# Plano da SPEC-13: Arquitetura Backend (Spring Boot + PostgreSQL) e Atualização Contratual

Este plano consolida todas as decisões técnicas para especificar a arquitetura do backend em Spring Boot e PostgreSQL (em subpasta isolada no mesmo repositório) antes de qualquer implementação em código, atualizando o contrato OpenAPI, a documentação de governança e o roadmap do produto.

## User Review & Critical Decisions

> [!IMPORTANT] Confirme os pontos abaixo (e os padrões recomendados para os dois últimos questionamentos) antes de eu gerar a documentação final:

- **Decisões já confirmadas por você**:
  - **Estrutura do projeto**: subpasta dedicada para o backend Java Spring Boot + PostgreSQL dentro deste mesmo repositório (mantendo a raiz exclusiva do frontend React/Vite), com infraestrutura local via Docker (`PostgreSQL` + `MinIO`) para rodar na sua IDE.
  - **Armazenamento de fotos**: **Cloudflare R2** (protocolo S3-compatível, download gratuito, MinIO no Docker em desenvolvimento), com limite de **5 MB por foto**, até **10 fotos por clínica**, aceitando **JPEG/JPG, PNG e WebP**.
  - **Localização e CEP**: **ViaCEP + Nominatim (OpenStreetMap)** com tabela local de bairros e cache no PostgreSQL; captura de GPS do navegador ao abrir a vitrine do paciente com fallback em `Centro - Lauro de Freitas`, botão *"Usar minha localização atual"*, campo livre para terceiros e registro no roadmap/SPEC-11 para exibir clínica, bairro e distância (`km`) nos cards.
  - **Taxa PIX (R$ 5,00)**: quitação operacional direta na API na Fase 1 (`POST /orders/{orderId}/fee/pay`), mantendo gateway PSP/webhook para Fase 2 (`EVOL-014`).
  - **Agenda e concorrência**: geração dinâmica de slots de **30 minutos** por expediente ativo; trava **1 vaga já em `SOLICITADO`** dentro de transação no PostgreSQL e só libera em `CANCELADO`.
  - **Seed, Admin e unicidade**: carga demonstrativa de clínicas apenas em perfil `dev` (dados mestres em todos os ambientes); primeiro Admin por variáveis de ambiente; e-mail único por perfil (Paciente vs. Clínica), CPF e CNPJ únicos retornando `409`.
  - **Trial 90 dias e plano R$ 99,00/mês**: cobrança já explícita na Landing B2B, Etapa 4 do credenciamento e banners do painel da clínica; cobrança recorrente por gateway e disparo de e-mails permanecem fora da Fase 1 (`EVOL-019`).

- **Respostas diretas às suas últimas perguntas (padrão recomendado incluído no plano)**:
  - **Formatos de imagem seguros além de JPG/PNG**: além de **JPEG/JPG** e **PNG**, incluímos **WebP** (e opcionalmente **AVIF** como formato moderno seguro); **SVG é estritamente proibido** por poder embutir scripts maliciosos (XSS). O backend validará os **magic bytes** reais do arquivo (não apenas a extensão) e removerá metadados EXIF antes de gravar no R2.
  - **Completude do arquivo OpenAPI vs. Spec do PostgreSQL**: o contrato OpenAPI **não possui todas as definições necessárias para criar o banco**, pois omite campos internos de segurança (`password_hash`, `refresh_tokens`, tentativas de check-in), controle transacional (`idempotency_keys`, sequência anual de `orderId`), chaves de storage (`object_key`), cache de geocodificação e índices/chaves estrangeiras. *Padrão recomendado*: incluir a **modelagem completa das tabelas PostgreSQL e estratégia Flyway dentro da própria SPEC-13** (ou, se preferir separar em `SPEC-13` + `SPEC-14`, basta avisar antes de prosseguir).
  - **Escopo da adesão R$ 99,00/mês no contrato OpenAPI**: conforme definido, a cobrança recorrente por gateway fica para depois (`EVOL-019`), mantendo na `SPEC-13` e no OpenAPI (`v0.3.1`) o vencimento automático dos 90 dias -> `SUSPENSO` mais endpoints operacionais de adesão/reativação administrativa (sem integração com PSP recorrente).
  - **N vagas por horário (`slotCapacity`)**: configurável para a clínica por meio de um padrão no perfil da clínica (`defaultSlotCapacity`, padrão `1`) com opção de ajuste por serviço (`slotCapacity`, opcional), garantindo controle granular sem obrigar configuração manual em cada exame.

---

## 1. Overview & Core Concept

- **O que esta entrega faz**: estabelece a especificação técnica fechada do futuro backend (**SPEC-13**) e atualiza o contrato **OpenAPI para v0.3.1**, eliminando qualquer ambiguidade sobre tabelas PostgreSQL, concorrência de agendamentos, upload seguro no Cloudflare R2, geocodificação gratuita, autenticação JWT e limites entre Fase 1 e Fase 2.
- **Público-alvo**: equipe de engenharia / desenvolvimento (para construir o backend em Java Spring Boot + PostgreSQL e conectar o adaptador HTTP do frontend na `SPEC-11`) e governança do produto.
- **Valor principal**: garante que frontend e backend sigam exatamente a mesma fonte da verdade contratual (`SPEC-09` + `SPEC-10` + `SPEC-13`), evitando retrabalho de schema, falhas de segurança em uploads e conflitos de horário sob acesso simultâneo.

---

## 2. User Experience & Behavioral Contract

- **Fluxo ponta a ponta da localização na vitrine (documentado para execução na frente de catálogo/SPEC-11)**:
  1. Ao acessar a visão Paciente, o navegador solicita a posição atual (`navigator.geolocation`); se negado ou indisponível, assume `Centro - Lauro de Freitas`.
  2. O paciente vê e pode alterar a região a qualquer momento digitando bairro, rua ou CEP (para si ou para terceiros), ou clicar no botão *"Usar minha localização atual"* para restaurar o GPS.
  3. Os cards passam a exibir o nome da clínica, bairro e a distância calculada (`distanceKm`), ordenados pela menor distância (Haversine) e, em empate abaixo de 1 metro, maior avaliação.
- **Fluxo de upload seguro de fotos (Cloudflare R2)**:
  1. Clínica envia imagem via multipart; API valida tamanho máximo de **5 MB**, limite de **10 fotos por clínica** e assinatura binária (*magic bytes*) exclusivamente de **JPEG, PNG ou WebP** (bloqueando SVG/HTML/executáveis).
  2. API remove metadados EXIF, envia para o bucket R2 (ou MinIO local) e grava metadados + URL pública no PostgreSQL.
- **Fluxo de disponibilidade com N vagas por horário**:
  1. Clínica configura sua capacidade padrão por horário de 30 min (ex.: `1` ou `3` vagas simultâneas) e, se desejar, ajusta por serviço (ex.: coleta laboratorial com `5` vagas).
  2. A vitrine exibe o horário enquanto a quantidade de agendamentos ativos (`SOLICITADO`, `CONFIRMADO_CLINICA`, `REALIZADO`, `NAO_COMPARECEU`) for menor que a capacidade; apenas `CANCELADO` devolve a vaga imediatamente.
- **Estados vazios e erros mapeados**:
  - Upload inválido (SVG, > 5 MB ou > 10 fotos): `422 VALIDATION_ERROR` com feedback no front via Toast.
  - Horário esgotado no momento da submissão concorrente: `409 SLOT_UNAVAILABLE`.
  - CEP/endereço não localizado: fallback amigável com sugestão dos bairros locais cadastrados em cache.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1 — Consolidar o schema PostgreSQL na SPEC-13 (em vez de confiar apenas no YAML)**:
  - *Abordagem escolhida*: documentar todas as tabelas, colunas, tipos SQL, chaves estrangeiras, índices e ordem das migrations Flyway em seção dedicada da **SPEC-13**, complementando o contrato REST do OpenAPI.
  - *Por quê*: o YAML descreve DTOs externos de requisição/resposta, não estruturas internas como hashes de senha, tokens de refresh para app mobile, chaves de idempotência, contadores de bloqueio de check-in ou índices de concorrência.
  - *Alternativa*: separar a modelagem do banco em uma `SPEC-14` dedicada, caso prefira documentos menores por camada.

- **Decisão 2 — Cloudflare R2 (produção) + MinIO (Docker local) + validação por Magic Bytes**:
  - *Abordagem escolhida*: protocolo S3 único via SDK oficial, aceitando apenas JPEG/PNG/WebP até 5 MB (máx. 10 fotos/clínica) e bloqueando SVG.
  - *Por quê*: elimina cobrança de tráfego de saída (*egress* zero), evita inchar backups do PostgreSQL com binários e protege a aplicação contra XSS em arquivos SVG ou extensões falsificadas.
  - *Alternativa*: armazenar `BYTEA` no PostgreSQL (aumentaria custos e lentidão de backup) ou Google Cloud Storage/S3 (custo de banda em downloads).

- **Decisão 3 — ViaCEP + Nominatim com cache persistente no PostgreSQL**:
  - *Abordagem escolhida*: tabela inicial curada de bairros da RMS + cache de buscas de CEP/endereço no PostgreSQL para minimizar chamadas externas ao Nominatim (respeitando `User-Agent` e limite de 1 req/s).
  - *Por quê*: entrega busca real de CEPs e geocodificação automática de clínicas sem exigir chaves faturadas desde o dia 1.
  - *Alternativa*: tabela fixa sem busca por CEP ou Google Geocoding API com cobrança imediata.

- **Decisão 4 — Monorepo com subpasta isolada de backend + contrato OpenAPI v0.3.1**:
  - *Abordagem escolhida*: manter a raiz Node/Vite intacta (preservando o runtime e build do AI Studio Build) e situar o futuro código Java + Docker Compose em subpasta própria, atualizando o documento de regras do projeto para refletir essa decisão.
  - *Por quê*: simplifica controle de versão único sem contaminar o pipeline frontend nem exigir configuração Java neste ambiente web.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Arquitetura Alvo (Monorepo Isolado e Fluxos de Integração)

```text
┌───────────────────────────────┐        REST / JSON + Multipart (OpenAPI v0.3.1)
│  Frontend React + Vite (Raiz) ├──────────────────────────────────────────────────┐
│  • Vitrine + GPS + Busca      │                                                  ▼
│  • Painel Clínica / Paciente  │                               ┌────────────────────────────────────┐
│  • Admin + Toast / Query      │                               │  Backend Spring Boot (backend/)    │
└───────────────────────────────┘                               │  • JWT Stateless (Web 3600s)       │
                                                                │  • Regras SPEC-09 & Concorrência   │
                                                                │  • Validador Magic Bytes (Upload)  │
                                                                └───────┬───────────────┬────────────┘
                                                                        │               │
                 ┌──────────────────────────────────────────────────────┘               │
                 ▼                                                                      ▼
┌────────────────────────────────────────┐                    ┌──────────────────────────────────────┐
│  PostgreSQL 16 + Flyway (Docker/Cloud) │                    │  Serviços Externos (Fase 1)          │
│  • Pacientes, Clínicas, Serviços       │                    │  • Cloudflare R2 / MinIO (Fotos S3)  │
│  • Orders, Appointments, OrderFees     │                    │  • ViaCEP + Nominatim (Geocoding)    │
│  • Idempotency, Check-in Locks, Cache  │                    │  • [Fase 2: Gateway PIX / SMTP]      │
└────────────────────────────────────────┘                    └──────────────────────────────────────┘
```

### Entidades e Tabelas PostgreSQL (Flyway Migrations)

- **Identidade & Acesso**: `patients` (UUID, `cpf` único, `email` único no escopo paciente, `password_hash`, telefone, data nascimento, `insurance_ids`), `clinics` (UUID, `cnpj` único, `email` único no escopo clínica, `password_hash`, `approval_status`, `subscription_status`, `trial_started_at`, `trial_ends_at`, `default_slot_capacity`, `latitude`/`longitude`), `admin_users` (provisionado via variáveis de ambiente), `refresh_tokens` (exclusivo clientes mobile, com rotação/revogação).
- **Mídia & Catálogo**: `clinic_photos` (`id`, `clinic_id`, `object_key`, `url`, `title`, `category`, `is_cover`, máximo 10/clínica), `insurances` (seed mestre), `standard_procedures` (seed mestre), `clinic_services` (`id`, `clinic_id`, `name`, `category`, `tuss_code`, `price NUMERIC(12,2)`, `description_prep`, `duration_minutes`, `slot_capacity` opcional, `active`) e tabela associativa `clinic_service_insurances` (N:N oficial).
- **Localização & Cache**: `locations` (bairros iniciais da RMS semeados via Flyway) e `geocode_cache` (respostas normalizadas de CEP/endereço do ViaCEP + Nominatim com timestamp).
- **Pedidos, Concorrência & Taxa**: `order_id_sequences` (sequência atômica por ano `ORD-AAAA-NNNNNN`), `orders` (`order_id`, `patient_id`, `check_in_token`, `token_issued_at`), `appointments` (`id`, `order_id`, `clinic_id`, `service_id`, `selected_date`, `selected_time_slot`, `price NUMERIC(12,2)`, `status`, `checked_in_at`, `check_in_method`, `patient_attendance`, `attendance_dispute`), `order_fees` (`order_id` único, `fee_amount NUMERIC(12,2)` fixo `5.00`, `status`, `payment_method`, `paid_at`, `waived_reason`), `token_check_in_attempts` (controle das 5 falhas consecutivas para bloqueio `423`) e `idempotency_keys` (garantia de `Idempotency-Key` em `POST /orders`).

### Escopo desta Execução (Somente Documentação e Contrato)

1. **Atualizar contrato OpenAPI para `v0.3.1`**: incluir regras de upload seguro (`JPEG/JPG`, `PNG`, `WebP`, máx. 5 MB, máx. 10 fotos, Cloudflare R2), campo `defaultSlotCapacity` na clínica e `slotCapacity` opcional por serviço, além dos endpoints operacionais de adesão/reativação da assinatura pós-trial R$ 99,00/mês (sem gateway recorrente). Validar com **Spectral CLI (0 erros)** e **Prism CLI**.
2. **Criar a SPEC-13**: documento completo seguindo estritamente as 8 seções da matriz padrão de especificações do projeto, detalhando arquitetura Spring Boot na subpasta dedicada, modelagem completa das tabelas PostgreSQL/Flyway, regras de concorrência, segurança, seed dev vs. produção e anti-escopo explícito (sem criar código Java ou alterar aplicação React nesta etapa).
3. **Sincronizar governança e roadmap**: atualizar as diretrizes operacionais (registrando a subpasta dedicada do backend) e o roadmap de evolução (`EVOL-002`, `EVOL-014..016`, `EVOL-019`, além do registro para `SPEC-11`/vitrine sobre GPS automático, botão de retorno e exibição de clínica/distância nos cards).
4. **Verificação final**: garantir que nenhum arquivo do frontend foi quebrado executando lint e compilação da aplicação web.
