# SPEC-13: Arquitetura Backend (Spring Boot), Banco PostgreSQL e Integrações Fase 1

- **Status**: PENDENTE
- **Data de Início**: 2026-11-21
- **Data de Conclusão**: Em aberto
- **Documento PRD de Referência**: `docs/prd/roadmap-evolucao.md` (`EVOL-002`, `EVOL-014`, `EVOL-015`, `EVOL-016`, `EVOL-019`)
- **Contrato REST Associado**: `docs/api/openapi.yaml` (`v0.3.1`) e `docs/specs/SPEC-10_Contrato_de_API.md`

> **Instrução para a IA/Agente:** Antes de iniciar a implementação do código em `backend/`, audite este documento contra o checklist da Seção 7 e aguarde autorização explícita do desenvolvedor para criar o projeto Spring Boot. Se surgir qualquer divergência de endpoint ou campo, atualize primeiro `docs/api/openapi.yaml` (`AGENTS.md` §9).

---

## 0. Decisões Arquiteturais Consolidadas (ADR)

### ADR 1 — Monorepo com subpasta `backend/` isolada
- O backend **Java 21+ com Spring Boot 3.x** (Maven ou Gradle) será implementado em `backend/` dentro deste mesmo repositório, isolado da raiz Node/Vite (`package.json`, `vite.config.js`, `src/`).
- A raiz permanece 100% exclusiva para o SPA React + Vite (porta `3000`), preservando o build estático e o preview do frontend sem interferência.
- O ambiente de desenvolvimento local usa `backend/docker-compose.yml` com **PostgreSQL 16** (porta `5432`) e **MinIO** (emulador S3 compatível com Cloudflare R2, portas `9000`/`9001`), permitindo rodar a API Spring Boot na IDE (porta `8080`) com zero custo em nuvem.

### ADR 2 — Persistência relacional no PostgreSQL 16 + Flyway
- **Banco único oficial desde a Fase 1**: PostgreSQL 16 com controle de versão de schema via **Flyway** (`backend/src/main/resources/db/migration`). Sem H2 em produção e sem persistência em memória.
- Convenções de tipo SQL:
  - Identificadores de entidade em `UUID` (chave primária gerada no backend), exceto `order_id` no formato anual legível `ORD-AAAA-NNNNNN` (`^ORD-\d{4}-\d{6}$`).
  - Dinheiro sempre em `NUMERIC(12,2)` (Java `BigDecimal`), nunca `FLOAT`/`DOUBLE` para somas ou totais.
  - Carimbos temporais em `TIMESTAMPTZ` (UTC); datas de agendamento em `DATE` e horários em `VARCHAR(5)`/`TIME` no fuso `America/Bahia`.

### ADR 3 — Armazenamento seguro de fotos em Cloudflare R2 (MinIO em dev)
- Fotos de clínicas (`POST /clinics/me/photos`) usam Object Storage compatível com S3 (**Cloudflare R2** em produção; **MinIO** no Docker local), via AWS SDK v2 for S3 no Spring Boot. **Nunca** armazenar Base64 ou binário `BYTEA` no PostgreSQL.
- **Regras obrigatórias de segurança e validação**:
  - Formatos aceitos: exclusivamente **JPEG/JPG** (`image/jpeg`), **PNG** (`image/png`) e **WebP** (`image/webp`).
  - **SVG (`image/svg+xml`) é estritamente proibido** (prevenção de XSS armazenado).
  - Validação por **assinatura binária real (*magic bytes*)**, nunca confiando apenas na extensão do arquivo ou no header `Content-Type` enviado pelo cliente.
  - Remover metadados EXIF (e/ou reprocessar a imagem limpa) antes de enviar ao bucket.
  - Limite máximo: **5 MB por arquivo** e até **10 fotos por clínica** (`422 VALIDATION_ERROR` ao exceder).
  - Ao excluir uma foto (`DELETE /clinics/me/photos/{photoId}`), remover o registro do PostgreSQL e o objeto correspondente no R2 via `object_key`.

### ADR 4 — Localização e geocodificação gratuita (ViaCEP + Nominatim + Cache PostgreSQL)
- **Perfil da clínica (`PUT /clinics/me/profile`)**: ao salvar endereço/CEP, o backend consulta **ViaCEP** (`viacep.com.br`) para normalizar logradouro/bairro/cidade e **Nominatim (OpenStreetMap)** para obter `(latitude, longitude)`, persistindo as coordenadas na tabela `clinics` (com fallback ao centro do bairro/cidade se a rua exata não retornar).
- **Busca pública (`GET /locations/search?q=...`)**:
  1. Consulta primeiro a tabela curada `locations` no PostgreSQL (bairros de Lauro de Freitas e Região Metropolitana de Salvador semeados via Flyway) e o histórico em `geocode_cache` (zero chamada externa quando já conhecido).
  2. Para novos CEPs (8 dígitos) ou endereços livres, consulta ViaCEP + Nominatim (`countrycodes=br`, enviando cabeçalho `User-Agent` identificando o aplicativo e respeitando rate limit de 1 req/s com mutex/bucket), grava o resultado em `geocode_cache` e devolve `{ id, label, latitude, longitude }`.
- **Vitrine (`GET /catalog/offers?lat=...&lng=...`)**: calcula distância real no servidor via fórmula de **Haversine**, ordena por menor distância e, em empate inferior a `0.001 km` (1 metro), por maior avaliação (`rating`).
- **Nota documentada para o front (`SPEC-11`)**: ao abrir a visão Paciente, o front solicitará `navigator.geolocation` com fallback em `Centro - Lauro de Freitas`, oferecerá botão *"Usar minha localização atual"* ao lado da busca livre para terceiros e exibirá nome da clínica, bairro e `distanceKm` nos cards.

### ADR 5 — Agenda dinâmica de 30 minutos e concorrência transacional (`N` vagas configuráveis)
- Os horários disponíveis não são pré-cadastrados dia a dia: `GET /clinics/{clinicId}/availability` gera dinamicamente slots de **30 minutos** dentro das janelas ativas de `operating_days` (`open` .. `close`, excluindo horários já passados no dia corrente em `America/Bahia`).
- **Capacidade configurável por clínica e por serviço**:
  - Cada clínica possui `default_slot_capacity` (`INTEGER >= 1`, padrão `1`) editável no perfil (`ClinicProfileUpdate`).
  - Cada serviço possui `slot_capacity` opcional (`INTEGER >= 1`, `NULL` por padrão); quando preenchido, sobrescreve `default_slot_capacity` da clínica para aquele exame.
- **Trava de concorrência (`SOLICITADO`)**:
  - Ao criar pedido (`POST /orders`), o backend executa transação ACID no PostgreSQL adquirindo lock pessimista/por linha (`SELECT ... FOR UPDATE` na tabela da clínica/serviço ou lock transacional por chave `(clinic_id, selected_date, selected_time_slot)`).
  - Conta os agendamentos ativos no mesmo horário (`status IN ('SOLICITADO', 'CONFIRMADO_CLINICA', 'REALIZADO', 'NAO_COMPARECEU')`). Se `ativos >= capacidade_efetiva`, rejeita atomicamente todo o pedido com `409 SLOT_UNAVAILABLE` e `itemIndex`.
  - Somente a transição para `CANCELADO` libera imediatamente a vaga para outros pacientes.

### ADR 6 — Escopo Financeiro Fase 1 (PIX R$ 5,00 e Trial 90 dias + R$ 99,00/mês)
- **Taxa única do paciente (R$ 5,00 por `orderId`)**:
  - Na Fase 1, `POST /orders/{orderId}/fee/pay` opera por **quitação operacional direta**: valida que a `order_fee` pertence ao paciente autenticado e está em `PENDENTE_PAGAMENTO`, altera para `PAGA`, grava `payment_method = 'PIX'`, gera `pix_tx_id` interno e registra `paid_at`, liberando imediatamente o paciente para novos pedidos. Emissão de QR Code dinâmico por PSP e webhooks ficam reservados à `EVOL-014` (Fase 2).
- **Período de teste de 90 dias e plano mensal de R$ 99,00 da clínica**:
  - A transparência comercial já está explícita na interface atual (Landing B2B, Etapa 4 do credenciamento e banners do `/dashboard`).
  - Na primeira aprovação (`PATCH /admin/clinics/{clinicId}/status` -> `APROVADO`), o backend preenche `trial_started_at = NOW()` e `trial_ends_at = NOW() + 90 days`, mantendo `subscription_status = 'TRIAL'`.
  - Job agendado diário (`00:05 America/Bahia`) + verificação *on-read* ao autenticar/consultar clínicas expira automaticamente para `subscription_status = 'TRIAL_EXPIRED'` e `approval_status = 'SUSPENSO'` quando `NOW() > trial_ends_at` e `subscription_status <> 'ACTIVE_SUBSCRIPTION'`.
  - Os endpoints operacionais de regularização (`POST /clinics/me/subscription/activate` e `PATCH /admin/clinics/{clinicId}/subscription`) constam no `openapi.yaml` v0.3.1 sem gateway recorrente na Fase 1; cobrança recorrente automática em gateway e disparo de e-mails ficam reservados à `EVOL-019` (Fase 2).

### ADR 7 — Segurança, Unicidade de Contas, Seed e Admin Inicial
- **JWT e sessão**: assinatura HMAC-SHA256/RSA (`expiresIn = 3600` s). Na web, `accessToken` vive em memória no cliente e `refreshToken` retorna `null`; para `X-Client-Type: MOBILE`, emite e rotaciona `refresh_tokens` persistidos em hash SHA-256 no PostgreSQL.
- **Unicidade de contas (`409 ALREADY_EXISTS`)**:
  - **E-mail**: único por perfil (`UNIQUE (LOWER(email))` em `patients` e `UNIQUE (LOWER(email))` em `clinics`), permitindo que a mesma pessoa física tenha uma conta de Paciente e outra conta de Clínica com o mesmo e-mail se desejar.
  - **CPF**: único na tabela `patients` (`UNIQUE (cpf)` em 11 dígitos normalizados).
  - **CNPJ**: único na tabela `clinics` (`UNIQUE (cnpj)` em 14 dígitos normalizados).
- **Admin inicial**: não existe cadastro público de administrador. Na inicialização, o sistema garante (de forma idempotente) a conta em `admin_users` usando as variáveis `ADMIN_BOOTSTRAP_USERNAME` e `ADMIN_BOOTSTRAP_PASSWORD` (armazenando apenas o hash BCrypt/Argon2).
- **Seed de dados**:
  - **Todos os ambientes (Flyway)**: `insurances`, `standard_procedures` e `locations` iniciais (Lauro de Freitas / Salvador).
  - **Apenas perfil Spring `dev` (`@Profile("dev")`)**: carga idempotente das clínicas demonstrativas aprovadas e serviços iniciais do catálogo para testes locais (produção sobe sem clínicas demonstrativas).

---

## 1. Contexto, Rota e Localização
- **Objetivo da Tarefa**: especificar integralmente a arquitetura do backend Java Spring Boot, a modelagem relacional PostgreSQL + Flyway, a integração com Cloudflare R2 e ViaCEP/Nominatim e as regras de concorrência/segurança para a futura implementação de `EVOL-002`.
- **Rota(s) / Base da API**: `/api/v1/*` conforme `docs/api/openapi.yaml` (`v0.3.1`). Nenhuma rota do frontend é alterada nesta SPEC.
- **Arquivo(s) Alvo**:
  - Atualizado previamente (fonte da verdade): `docs/api/openapi.yaml` (`v0.3.1`)
  - Governança sincronizada: `AGENTS.md` e `docs/AGENTS.md` (§1 e §9), `docs/prd/roadmap-evolucao.md`
  - Futuro projeto backend (a ser criado somente após autorização da execução):
    - `backend/pom.xml` (ou `build.gradle`), `backend/docker-compose.yml`, `backend/.env.example`, `backend/Dockerfile`
    - `backend/src/main/java/br/com/gerenciarmaissaude/...` (`config`, `security`, `domain`, `repository`, `service`, `controller`, `integration`)
    - `backend/src/main/resources/db/migration/V1__*.sql` .. `V5__*.sql`
- **Perfil de Acesso (Role)**: `PUBLICO`, `ROLE_USUARIO`, `ROLE_CLINICA`, `ROLE_ADMIN`.

---

## 2. Contrato de Dados & Persistência (PostgreSQL + Flyway)

> **Por que o PostgreSQL precisa desta SPEC além do `openapi.yaml`?**
> O `openapi.yaml` define apenas os DTOs públicos HTTP. Estruturas internas essenciais para segurança e atomicidade — como `password_hash`, `refresh_tokens`, `object_key` do Cloudflare R2, `idempotency_keys`, sequência anual `order_id_sequences`, `token_check_in_attempts`, `geocode_cache`, tipos SQL exatos e índices — residem exclusivamente no PostgreSQL e estão fechadas abaixo.

### 2.1 Definição Completa das Tabelas PostgreSQL

#### 1) `patients`
| Coluna | Tipo PostgreSQL | Restrições / Default | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | ID do paciente (vai no claim `sub` do JWT) |
| `full_name` | `VARCHAR(200)` | `NOT NULL` | Nome completo |
| `cpf` | `CHAR(11)` | `NOT NULL, UNIQUE` | Somente 11 dígitos; resposta API mascara `***.XXX.XXX-**` |
| `birth_date` | `DATE` | `NOT NULL` | Mínimo 18 anos validado no cadastro |
| `email` | `VARCHAR(254)` | `NOT NULL` | Índice `UNIQUE (LOWER(email))` no escopo Paciente |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Hash BCrypt/Argon2 (nunca retornado na API) |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Telefone formatado / dígitos |
| `insurance_ids` | `JSONB` | `NOT NULL DEFAULT '["ins-particular"]'` | Array de IDs oficiais (`ins-*`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Data de criação UTC |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Última atualização UTC |

#### 2) `clinics`
| Coluna | Tipo PostgreSQL | Restrições / Default | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | ID da clínica (vai no claim `sub` do JWT) |
| `legal_name` | `VARCHAR(200)` | `NOT NULL` | Razão social |
| `trade_name` | `VARCHAR(200)` | `NOT NULL` | Nome fantasia exibido na vitrine |
| `cnpj` | `CHAR(14)` | `NOT NULL, UNIQUE` | Somente 14 dígitos validados por DV |
| `email` | `VARCHAR(254)` | `NOT NULL` | Índice `UNIQUE (LOWER(email))` no escopo Clínica |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Hash BCrypt/Argon2 |
| `manager_name` | `VARCHAR(200)` | `NOT NULL` | Nome do gestor responsável |
| `manager_phone` | `VARCHAR(20)` | `NOT NULL` | Contato direto do gestor (10 ou 11 dígitos; isolado do público) |
| `referral_code` | `VARCHAR(30)` | `NULL` | Código de indicação opcional |
| `approval_status` | `VARCHAR(40)` | `NOT NULL DEFAULT 'PENDENTE_APROVACAO_ADMIN'` | `PENDENTE_APROVACAO_ADMIN \| APROVADO \| SUSPENSO \| REJEITADO` |
| `subscription_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'TRIAL'` | `TRIAL \| ACTIVE_SUBSCRIPTION \| TRIAL_EXPIRED` |
| `trial_started_at` | `TIMESTAMPTZ` | `NULL` | Preenchido na primeira aprovação |
| `trial_ends_at` | `TIMESTAMPTZ` | `NULL` | `trial_started_at + INTERVAL '90 days'` |
| `subscription_activated_at` | `TIMESTAMPTZ` | `NULL` | Data de ativação do plano mensal R$ 99,00 |
| `monthly_plan_price` | `NUMERIC(12,2)` | `NOT NULL DEFAULT 99.00` | Valor contratual do plano mensal |
| `commercial_phone` | `VARCHAR(20)` | `NULL` | Telefone comercial público (`/dashboard/perfil`) |
| `whatsapp` | `VARCHAR(20)` | `NULL` | WhatsApp comercial público |
| `commercial_email` | `VARCHAR(254)` | `NULL` | E-mail público do perfil |
| `address_street` | `VARCHAR(200)` | `NULL` | Logradouro |
| `address_number` | `VARCHAR(30)` | `NULL` | Número |
| `address_complement` | `VARCHAR(120)` | `NULL` | Complemento |
| `neighborhood` | `VARCHAR(120)` | `NULL` | Bairro |
| `city` | `VARCHAR(120)` | `NULL` | Cidade |
| `state` | `CHAR(2)` | `NULL` | UF |
| `zip_code` | `VARCHAR(10)` | `NULL` | CEP |
| `reference_point` | `VARCHAR(200)` | `NULL` | Ponto de referência |
| `description` | `TEXT` | `NULL` | Descrição institucional da clínica |
| `latitude` | `DOUBLE PRECISION` | `NULL` | Coordenada geocodificada via ViaCEP + Nominatim |
| `longitude` | `DOUBLE PRECISION` | `NULL` | Coordenada geocodificada via ViaCEP + Nominatim |
| `rating` | `NUMERIC(3,2)` | `NOT NULL DEFAULT 5.00` | Avaliação exibida na ordenação da vitrine |
| `default_slot_capacity` | `INTEGER` | `NOT NULL DEFAULT 1 CHECK (default_slot_capacity >= 1)` | Capacidade padrão simultânea por horário de 30 min |
| `operating_days` | `JSONB` | `NOT NULL` | Array de `OperatingDay` (`seg`..`dom`, `active`, `open`, `close`) |
| `amenities` | `JSONB` | `NOT NULL DEFAULT '[]'` | Lista de comodidades |
| `moderation_reason` | `VARCHAR(300)` | `NULL` | Motivo opcional em rejeição/suspensão/assinatura |
| `status_updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Última alteração de status |
| `registered_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Data de credenciamento |

#### 3) `admin_users`
| Coluna | Tipo PostgreSQL | Restrições / Default | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Identificador do administrador |
| `username` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | Provisionado via `ADMIN_BOOTSTRAP_USERNAME` |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Hash da senha de `ADMIN_BOOTSTRAP_PASSWORD` |
| `display_name` | `VARCHAR(150)` | `NOT NULL` | Nome exibido no `AuthResponse` |
| `active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Permite desativação sem excluir histórico |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Timestamp UTC |

#### 4) `refresh_tokens` *(exclusivo `X-Client-Type: MOBILE`)*
| Coluna | Tipo PostgreSQL | Restrições / Default | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | ID do registro |
| `user_id` | `UUID` | `NOT NULL` | ID do usuário (`patient`, `clinic` ou `admin`) |
| `role` | `VARCHAR(30)` | `NOT NULL` | `ROLE_USUARIO \| ROLE_CLINICA \| ROLE_ADMIN` |
| `token_hash` | `CHAR(64)` | `NOT NULL, UNIQUE` | SHA-256 do refresh token (nunca texto puro) |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Expiração configurável (ex.: 30 dias) |
| `revoked_at` | `TIMESTAMPTZ` | `NULL` | Preenchido na rotação ou no `POST /auth/logout` |
| `replaced_by_token_id` | `UUID` | `NULL` | Cadeia de auditoria de rotação |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Criação UTC |

#### 5) `clinic_photos` *(metadados do Cloudflare R2)*
| Coluna | Tipo PostgreSQL | Restrições / Default | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | ID da foto |
| `clinic_id` | `UUID` | `NOT NULL REFERENCES clinics(id) ON DELETE CASCADE` | Clínica dona da imagem |
| `object_key` | `VARCHAR(300)` | `NOT NULL, UNIQUE` | Caminho no bucket R2/MinIO (`clinics/{clinicId}/{id}.{ext}`) |
| `url` | `VARCHAR(600)` | `NOT NULL` | URL pública CDN/R2 retornada para o front |
| `content_type` | `VARCHAR(40)` | `NOT NULL` | `image/jpeg \| image/png \| image/webp` |
| `size_bytes` | `INTEGER` | `NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880)` | Até 5 MB (5.242.880 bytes) |
| `title` | `VARCHAR(120)` | `NOT NULL` | Título descritivo |
| `category` | `VARCHAR(30)` | `NOT NULL` | `FACHADA \| RECEPCAO \| CONSULTORIO \| EXAMES \| ESTRUTURA` |
| `is_cover` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Capa principal da clínica |
| `uploaded_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Data do upload |

#### 6) `insurances` & 7) `standard_procedures` *(tabelas mestras via Flyway)*
- `insurances`: `id VARCHAR(40) PRIMARY KEY` (`ins-unimed`, `ins-bradesco`, `ins-particular`, etc.), `name VARCHAR(120) NOT NULL`, `active BOOLEAN NOT NULL DEFAULT TRUE`.
- `standard_procedures`: `id VARCHAR(60) PRIMARY KEY`, `name VARCHAR(200) NOT NULL`, `category VARCHAR(30) NOT NULL`, `tuss_code VARCHAR(8) NULL`, `suggested_price NUMERIC(12,2) NOT NULL`, `suggested_insurance_ids JSONB NOT NULL`, `suggested_prep TEXT NOT NULL`, `suggested_duration_minutes INTEGER NOT NULL`.

#### 8) `clinic_services` & 9) `clinic_service_insurances` *(N:N oficial)*
- `clinic_services`: `id UUID PRIMARY KEY`, `clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE`, `name VARCHAR(200) NOT NULL`, `category VARCHAR(30) NOT NULL`, `tuss_code VARCHAR(8) NULL`, `price NUMERIC(12,2) NOT NULL CHECK (price > 0)`, `description_prep TEXT NOT NULL`, `duration_minutes INTEGER NOT NULL DEFAULT 30`, `insurance_pricing_notes TEXT NULL`, `commercial_notes TEXT NULL`, `image_url VARCHAR(600) NULL`, `slot_capacity INTEGER NULL CHECK (slot_capacity IS NULL OR slot_capacity >= 1)`, `active BOOLEAN NOT NULL DEFAULT TRUE`, `created_at TIMESTAMPTZ NOT NULL`, `updated_at TIMESTAMPTZ NOT NULL`.
- `clinic_service_insurances`: `service_id UUID NOT NULL REFERENCES clinic_services(id) ON DELETE CASCADE`, `insurance_id VARCHAR(40) NOT NULL REFERENCES insurances(id)`, `PRIMARY KEY (service_id, insurance_id)`.

#### 10) `locations` & 11) `geocode_cache` *(ViaCEP + Nominatim)*
- `locations`: `id VARCHAR(80) PRIMARY KEY`, `label VARCHAR(200) NOT NULL`, `aliases TEXT NOT NULL`, `latitude DOUBLE PRECISION NOT NULL`, `longitude DOUBLE PRECISION NOT NULL`, `curated BOOLEAN NOT NULL DEFAULT TRUE`.
- `geocode_cache`: `query_normalized VARCHAR(200) PRIMARY KEY`, `zip_code CHAR(8) NULL`, `label VARCHAR(250) NOT NULL`, `latitude DOUBLE PRECISION NOT NULL`, `longitude DOUBLE PRECISION NOT NULL`, `provider VARCHAR(40) NOT NULL`, `cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

#### 12) `order_id_sequences`, 13) `orders`, 14) `appointments` & 15) `order_fees`
- `order_id_sequences`: `year INTEGER PRIMARY KEY`, `last_value INTEGER NOT NULL DEFAULT 0` (atualizada atomicamente via `INSERT ... ON CONFLICT (year) DO UPDATE SET last_value = order_id_sequences.last_value + 1 RETURNING last_value` para gerar `ORD-AAAA-NNNNNN`).
- `orders`: `order_id VARCHAR(16) PRIMARY KEY`, `patient_id UUID NOT NULL REFERENCES patients(id)`, `check_in_token CHAR(6) NULL UNIQUE`, `token_issued_at TIMESTAMPTZ NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- `appointments`:
  - `id UUID PRIMARY KEY`, `order_id VARCHAR(16) NOT NULL REFERENCES orders(order_id)`, `patient_id UUID NOT NULL REFERENCES patients(id)`, `clinic_id UUID NOT NULL REFERENCES clinics(id)`, `service_id UUID NOT NULL REFERENCES clinic_services(id)`.
  - Snapshots imutáveis da oferta no momento do pedido: `exam_name VARCHAR(200) NOT NULL`, `category VARCHAR(30) NOT NULL`, `description_prep TEXT NOT NULL`, `payment_type VARCHAR(20) NOT NULL` (`PARTICULAR | CONVENIO`), `insurance_id VARCHAR(40) NULL REFERENCES insurances(id)`, `price NUMERIC(12,2) NOT NULL` (`0.00` quando `CONVENIO`).
  - Agendamento e máquina `SPEC-09`: `selected_date DATE NOT NULL`, `selected_time_slot CHAR(5) NOT NULL`, `selected_period VARCHAR(10) NOT NULL`, `status VARCHAR(30) NOT NULL` (`SOLICITADO | CONFIRMADO_CLINICA | REALIZADO | NAO_COMPARECEU | CANCELADO`), `cancelled_by VARCHAR(20) NULL`, `cancel_reason VARCHAR(300) NULL`, `checked_in_at TIMESTAMPTZ NULL`, `check_in_method VARCHAR(20) NULL`, `patient_attendance VARCHAR(20) NULL`, `attendance_dispute BOOLEAN NOT NULL DEFAULT FALSE`, `charged_amount NUMERIC(12,2) NULL`, `created_at TIMESTAMPTZ NOT NULL`, `updated_at TIMESTAMPTZ NOT NULL`.
  - **Índice de concorrência/agenda**: `CREATE INDEX idx_appointments_slot_active ON appointments (clinic_id, selected_date, selected_time_slot) WHERE status <> 'CANCELADO';` e `CREATE INDEX idx_appointments_patient_order ON appointments (patient_id, order_id);`.
- `order_fees`: `id UUID PRIMARY KEY`, `order_id VARCHAR(16) NOT NULL UNIQUE REFERENCES orders(order_id)`, `patient_id UUID NOT NULL REFERENCES patients(id)`, `fee_amount NUMERIC(12,2) NOT NULL DEFAULT 5.00`, `status VARCHAR(30) NOT NULL` (`AGUARDANDO_CONFIRMACAO | PENDENTE_PAGAMENTO | PAGA | ISENTA`), `payment_method VARCHAR(20) NULL`, `pix_tx_id VARCHAR(80) NULL`, `paid_at TIMESTAMPTZ NULL`, `waived_reason VARCHAR(300) NULL`, `created_at TIMESTAMPTZ NOT NULL`, `updated_at TIMESTAMPTZ NOT NULL`.

#### 16) `token_check_in_attempts` & 17) `idempotency_keys`
- `token_check_in_attempts`: `clinic_id UUID PRIMARY KEY REFERENCES clinics(id) ON DELETE CASCADE`, `consecutive_failures INTEGER NOT NULL DEFAULT 0`, `locked_until TIMESTAMPTZ NULL`, `updated_at TIMESTAMPTZ NOT NULL`.
- `idempotency_keys`: `id UUID PRIMARY KEY`, `patient_id UUID NOT NULL REFERENCES patients(id)`, `idempotency_key VARCHAR(80) NOT NULL`, `request_hash CHAR(64) NOT NULL`, `response_order_id VARCHAR(16) NULL REFERENCES orders(order_id)`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `UNIQUE (patient_id, idempotency_key)`.

### 2.2 Plano de Migrations Flyway & Variáveis de Ambiente
- **Migrations estruturais (todos os ambientes)**:
  - `V1__identity_and_auth.sql`: `patients`, `clinics`, `admin_users`, `refresh_tokens`, índices de unicidade por perfil/CPF/CNPJ.
  - `V2__catalog_and_storage.sql`: `insurances`, `standard_procedures`, `clinic_services`, `clinic_service_insurances`, `clinic_photos`.
  - `V3__locations_and_geocode_cache.sql`: `locations` + seed RMS + `geocode_cache`.
  - `V4__orders_appointments_and_fees.sql`: `order_id_sequences`, `orders`, `appointments` (com índice parcial de vaga ativa), `order_fees`, `token_check_in_attempts`, `idempotency_keys`.
  - `V5__seed_master_catalog.sql`: carga oficial dos convênios (`insurances`) e catálogo padrão (`standard_procedures`).
- **Seed demonstrativo (`dev` apenas)**: executado por `CommandLineRunner`/`Flyway` em `classpath:db/seed-dev` apenas quando `spring.profiles.active=dev`, populando clínicas aprovadas e ofertas equivalentes ao catálogo demonstrativo.
- **Variáveis obrigatórias (`backend/.env.example`)**: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS=3600`, `ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_PASSWORD`, `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_PUBLIC_BASE_URL`, `GEOCODING_USER_AGENT`.

### 2.3 Impacto no Frontend (`TanStack Query` / Hooks)
- **Nesta SPEC**: nenhum hook ou componente do frontend é alterado. Os Query Keys existentes (`['appointments']`, `['patient', 'appointments', patientId]`, `['patient', 'profile']`, `['patient', 'order-fees', patientId]`, `['landing', 'registered-profiles']`) ficam preservados para a camada adaptadora (`SPEC-11`).

---

## 3. Reuso & Padrões Arquiteturais (DRY)
- **Máquina de estados única**: a classe de domínio do backend espelha integralmente as transições e validações puras de `src/services/appointmentStateMachine.js` e `SPEC-09`.
- **Respostas de erro RFC 7807 (`Problem.code`)**: o `GlobalExceptionHandler` emite sempre `application/problem+json` com os códigos mapeados para o frontend renderizar via `Toast.jsx` e `FormField.jsx` (`fieldErrors`).
- **Zero emojis**: proibido retornar emojis em mensagens de API, logs voltados ao cliente ou textos padrão.

---

## 4. Máquina de Estados, Concorrência & Segurança
- **Reserva e liberação de vagas com `N` capacidade**:
  1. Em `POST /orders`, para cada item do carrinho o backend valida oferta ativa, clínica `APROVADO`, ausência de `order_fees` em `PENDENTE_PAGAMENTO` (`409 FEE_PAYMENT_PENDING`) e ausência de pendência de comparecimento (`409 ATTENDANCE_PENDING`).
  2. Obtém lock pessimista sobre a clínica (`SELECT * FROM clinics WHERE id = :clinicId FOR UPDATE`) para serializar reservas concorrentes naquela clínica dentro da transação.
  3. Calcula capacidade efetiva: `COALESCE(service.slot_capacity, clinic.default_slot_capacity)`.
  4. Verifica se o horário pertence a um `OperatingDay` ativo em múltiplos de 30 minutos e conta agendamentos `status <> 'CANCELADO'` para `(clinic_id, selected_date, selected_time_slot)`. Se `count >= capacity`, faz rollback de todo o lote retornando `409 SLOT_UNAVAILABLE` com `itemIndex`.
- **Upload de fotos (`POST /clinics/me/photos`)**:
  - Verifica se clínica já possui 10 fotos; lê cabeçalho binário real (*magic bytes*) aceitando só JPEG (`FF D8 FF`), PNG (`89 50 4E 47`) e WebP (`52 49 46 46 .... 57 45 42 50`); re-codifica/remove EXIF; grava no bucket R2/MinIO e persiste metadados no PostgreSQL.
- **Brute-force de Check-in (`POST /clinics/me/check-in`)**:
  - 5 tentativas consecutivas inválidas por clínica gravam `locked_until = NOW() + INTERVAL '15 minutes'` (ou desbloqueio manual), respondendo `423 TOKEN_LOCKED`.
- **Trial de 90 dias e Assinatura R$ 99,00/mês**:
  - Aprovação inicial (`PENDENTE_APROVACAO_ADMIN` -> `APROVADO`) fixa `trial_started_at` e `trial_ends_at (+90 dias)`.
  - Scheduler diário + validação na leitura transita vencidos sem `ACTIVE_SUBSCRIPTION` para `TRIAL_EXPIRED` + `SUSPENSO` (ocultando imediatamente da vitrine `GET /catalog/offers`).
  - `POST /clinics/me/subscription/activate` e `PATCH /admin/clinics/{clinicId}/subscription` regularizam operacionalmente na Fase 1 (`ACTIVE_SUBSCRIPTION` -> `APROVADO`).

---

## 5. Anti-Escopo (O que NÃO fazer nesta entrega e na Fase 1)
- [ ] **NÃO** criar código Java, `pom.xml`, `docker-compose.yml` ou alterar arquivos em `src/` e `package.json` nesta entrega documental.
- [ ] **NÃO** integrar PSP/gateway PIX real ou webhooks bancários na Fase 1 (reservado a `EVOL-014`).
- [ ] **NÃO** integrar gateway de cobrança recorrente para R$ 99,00/mês nem envio automático de e-mails SMTP na Fase 1 (reservado a `EVOL-019`).
- [ ] **NÃO** implementar envio trimestral analítico (`EVOL-020`) nem evolução multi-clínica do painel Admin (`EVOL-021`).
- [ ] **NÃO** implementar modo `FULL_AMOUNT`, repasse ou estorno (`EVOL-017`).
- [ ] **NÃO** implementar Google Auth, WhatsApp (`EVOL-005` / `SPEC-07`) ou Chatbot **Zelo** (`EVOL-018`).
- [ ] **NÃO** armazenar imagens em `BYTEA`/Base64 no PostgreSQL nem aceitar upload `SVG`.
- [ ] **NÃO** sobrescrever `docs/specs/TEMPLATE_SPEC.md`.

---

## 6. Critérios de Aceite Fechados (DoD - Definition of Done)
*(Verificáveis quando a execução do projeto `backend/` for autorizada e concluída)*
- [ ] Subpasta `backend/` sobe PostgreSQL 16 + MinIO via `docker-compose.yml` e API Spring Boot na porta `8080` sem afetar o build/dev do frontend na raiz.
- [ ] Todas as migrations Flyway (`V1`..`V5`) executam limpas em banco vazio; seed de clínicas demo executa somente com perfil `dev`.
- [ ] `POST /clinics/me/photos` aceita JPEG/PNG/WebP até 5 MB (máx. 10 fotos) validados por magic bytes, bloqueia SVG (`422`) e persiste no MinIO/Cloudflare R2 mantendo apenas metadados/URL no PostgreSQL.
- [ ] `GET /locations/search` e `PUT /clinics/me/profile` resolvem CEPs/endereços via ViaCEP + Nominatim com cache em `geocode_cache`, e `GET /catalog/offers` ordena por Haversine usando somente clínicas `APROVADO`.
- [ ] `POST /orders` garante idempotência (`Idempotency-Key`), gera `ORD-AAAA-NNNNNN`, bloqueia `FEE_PAYMENT_PENDING` / `ATTENDANCE_PENDING` e respeita concorrência transacional para `slotCapacity` configurável (`N` vagas por slot de 30 min, reservando em `SOLICITADO` e liberando em `CANCELADO`).
- [ ] `POST /orders/{orderId}/fee/pay` executa quitação operacional direta em `PENDENTE_PAGAMENTO` -> `PAGA`.
- [ ] Trial de 90 dias expira automaticamente para `SUSPENSO` (`TRIAL_EXPIRED`) e aceita reativação operacional via `POST /clinics/me/subscription/activate` ou `PATCH /admin/clinics/{clinicId}/subscription`.
- [ ] Testes de integração (Testcontainers PostgreSQL) passam validando concorrência, máquinas de estado `SPEC-09`, check-in `423`, unicidade de contas (`409`) e segurança por role.
- [ ] Contrato `docs/api/openapi.yaml` (`v0.3.1`+) passa em Spectral sem erros e confere 100% com os controllers Spring Boot.

---

## 7. Checklist do Gatekeeper (Auto-auditoria da IA antes de codificar)
1. *Os campos de entrada, colunas SQL e seus tipos estão 100% claros?* **SIM** — todas as 17 tabelas, colunas, constraints, índices e endpoints do `openapi.yaml` `v0.3.1` estão especificados sem lacunas.
2. *As mensagens de erro e códigos HTTP foram especificados?* **SIM** — RFC 7807 (`Problem.code`), códigos `401`, `403`, `404`, `409`, `422` e `423 TOKEN_LOCKED` fechados.
3. *A estratégia de persistência local/dev, seed e storage foi informada?* **SIM** — Docker (`PostgreSQL 16` + `MinIO`), Cloudflare R2 em produção, ViaCEP + Nominatim com cache em banco e seed `dev`-only + Admin por env.
4. *O escopo está livre de termos vagos?* **SIM** — anti-escopo explícito separa Fase 1 operacional das futuras `EVOL-014`, `EVOL-017`, `EVOL-019`, `EVOL-020` e `EVOL-021`.

**Dependências declaradas (não são lacunas de definição):** o início da codificação em `backend/` requer autorização explícita em turno próprio (`AGENTS.md` §1); as melhorias de UX de localização no frontend (`navigator.geolocation`, botão *"Usar minha localização atual"* e exibição clínica/bairro/`distanceKm` nos cards da vitrine) estão registradas no roadmap para execução na frente frontend (`SPEC-11`).

---

## 8. Fechamento de Ciclo & Rastreabilidade (Obrigatório ao Concluir a Implementação do Backend)
- [ ] 1. Marcar todos os checkboxes de Critérios de Aceite (Seção 6) como `[x]`.
- [ ] 2. Alterar o cabeçalho desta spec para `Status: CONCLUÍDO` com a data de conclusão.
- [ ] 3. Atualizar `docs/prd/roadmap-evolucao.md` marcando `EVOL-002`, `EVOL-006`, `EVOL-015` e `EVOL-016` como concluídos e sincronizar `docs/specs/SPEC-05_Credenciamento_Completo_da_Clínica_Moderação_Administrativa.md` (etapa 6 / `EVOL-006`).
- [ ] 4. Confirmar paridade final com `docs/api/openapi.yaml` e validação verde de build/testes do backend e frontend (`npm run lint` + `npm run build`).
