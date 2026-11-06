# SPEC-10: Contrato de API (fonte da verdade: `docs/api/openapi.yaml`)

- **Status**: PENDENTE
- **Data de Início**: 2026-11-05
- **Data de Conclusão**: Em aberto
- **Documento PRD de Referência**: `docs/prd/roadmap-evolucao.md` (EVOL-002, EVOL-015, EVOL-016; EVOL-008 como pré-requisito da SPEC-11)
- **Natureza**: documentação. Esta spec **não cria código de backend, banco de dados nem integração real**. Ela fixa o contrato que o front e o futuro backend Spring Boot vão obedecer.
- **Relação com outras specs**: descreve o estado-alvo definido na SPEC-09 (a SPEC-09 ainda está PENDENTE e o mock atual ainda usa `PAGO`). Alimenta a SPEC-11 (camada de integração do front). A autorização para iniciar o backend (EVOL-002) **não é concedida por esta spec** (ver ADR 6).

> **Instrução para a IA/Agente:** Antes de iniciar a implementação, audite este documento contra o checklist da Seção 7. Se houver qualquer campo com "[A DEFINIR]" ou ambiguidade em regras críticas, **NÃO assuma nem implemente**. Questione o desenvolvedor pontualmente no chat.

---

## 0. Decisões Consolidadas (ADR)

### ADR 1 — Valores monetários: decimais, como na SPEC-09
- A API trafega **dinheiro em reais com duas casas decimais** (`number`, ex.: `180.75`, `5.00`), sem sufixo `Cents`.
- No backend o tipo é `BigDecimal` (coluna futura `NUMERIC(12,2)`); nunca `double`/`float` para cálculo.
- No front, somas e totais devem usar o utilitário de formatação existente; evitar acumular erro de ponto flutuante (arredondar a 2 casas ao somar).
- **Consequência para o YAML (obrigatória)**: renomear todos os campos `*Cents` para o nome sem sufixo (`priceCents` → `price`, `feeAmountCents` → `feeAmount`, `servicesAmountCents` → `servicesAmount`, `totalAmountCents` → `totalAmount`, `suggestedPriceCents` → `suggestedPrice`, `minPriceCents`/`maxPriceCents` → `minPrice`/`maxPrice`, `chargedAmountCents` → `chargedAmount`) e trocar `type: integer` por `type: number` com `multipleOf: 0.01`. A decisão D1 do YAML (centavos) fica **revogada**; a ADR 13 da SPEC-09 passa a significar "decimal na API; a representação interna é detalhe do backend".

### ADR 2 — Sessão: access token em memória (web); plano de migração para o app
- **Fase atual (web)**: o `accessToken` (JWT) fica **apenas em variável de módulo/memória** do front. Sem cookie, sem `localStorage`, sem `sessionStorage` para o token. Sem endpoint de refresh ativo na web.
- **Duração do access token**: 3600 segundos (`expiresIn`), configurável no backend.
- **Implicações aceitas**:
  1. Recarregar a página (F5) ou abrir outra aba **encerra a sessão**; o usuário volta ao login. Hoje o mock mantém a sessão em `sessionStorage`; no modo `http` isso é uma mudança de comportamento esperada.
  2. A lista de exames (`gms_exam_cart`, em `sessionStorage`) **continua preservada** após o novo login, mantendo o fluxo "login na revisão final".
  3. Ganho de segurança: um XSS não consegue ler um token persistido (não há token persistido). O token só vive enquanto a aba vive.
  4. Sem cookie, **CORS simples**: front e API podem estar em domínios diferentes (ex.: Firebase e Railway), sem exigir domínio-pai comum. `Access-Control-Allow-Credentials` não é necessário.
  5. Em 401 o front limpa o token, mostra Toast em português e redireciona ao login.
- **Plano para o app mobile (futuro, EVOL-003)**: o app guarda o refresh token em armazenamento seguro do SO (Keychain/Keystore). Por isso o contrato prevê desde já:
  - `AuthResponse.refreshToken` (nullable), **preenchido somente quando a requisição envia o cabeçalho `X-Client-Type: MOBILE`**; na web é sempre `null`.
  - `POST /auth/refresh` aceita `{ "refreshToken": "..." }` no corpo (cliente MOBILE). A variante por cookie HttpOnly para a web fica **reservada para a Fase B** e deve ser registrada como EVOL própria se for adotada; não implementar agora.
  - Refresh token com rotação (cada uso emite um novo e invalida o anterior) e revogação no `POST /auth/logout`.
- **Consequência para o YAML**: remover D4 (cookie), reescrever a descrição de `/auth/refresh` conforme acima, adicionar o parâmetro de cabeçalho `X-Client-Type` e o campo `refreshToken`.

### ADR 3 — Catálogo vem da API (base de dados), alimentado pelos cadastros
- Resposta à pergunta do desenvolvedor: **sim, deve existir uma API para consumir o catálogo**. Os exames/serviços exibidos na vitrine são os **serviços cadastrados pelas clínicas aprovadas**; conforme as clínicas cadastram, a vitrine é populada.
- `GET /catalog/offers` é a fonte da vitrine (somente serviços ativos de clínicas `APROVADO`, o que resolve a etapa 6 da SPEC-05 / EVOL-006 no servidor).
- `GET /catalog/procedures` (catálogo padrão de sugestões para o autopreenchimento do cadastro de serviço) **permanece no contrato**; o backend o serve a partir de carga inicial (seed). No **modo `mock`** o adaptador continua lendo `src/data/standardCatalog.js` e `src/data/catalogData.js`.
- **Ponto de atenção registrado para a SPEC-11**: hoje a vitrine parte de `STANDARD_PROCEDURES_CATALOG` e procura a oferta da clínica (`getClinicService`). No modo `http` a vitrine passa a listar **ofertas** (`Offer`) diretamente. Enquanto não houver clínica aprovada com serviços, a lista fica vazia; a carga inicial de clínicas demonstrativas aprovadas é decisão da SPEC do backend, não desta.

### ADR 4 — `orderId` sequencial legível
- Formato: `ORD-AAAA-NNNNNN` (ano com 4 dígitos + sequência de 6 dígitos com zeros à esquerda), ex.: `ORD-2026-000101`. A sequência **reinicia a cada ano**.
- Unicidade e ausência de saltos duplicados são garantidas **pelo backend** (sequência atômica); o cliente nunca gera `orderId`.
- Por ser previsível, o `orderId` **não é segredo**: toda leitura valida que o pedido pertence ao paciente/clínica do token (404 caso contrário). O segredo do check-in é o `checkInToken`, separado.
- Demais IDs de entidade (agendamento, serviço, clínica, lançamento, boleto) permanecem UUID.

### ADR 5 — Mock da Fase A: Prism
- **Prism** (Stoplight) lê o `openapi.yaml` e sobe um servidor HTTP que responde com os exemplos do contrato e **valida requisições e respostas** contra ele.
- Papel do Prism neste projeto: **teste de conformidade do contrato** e desenvolvimento do adaptador `http`. Ele é **sem estado**: um `POST /orders` não faz o pedido aparecer em `GET /patients/me/orders`.
- Por isso o **modo `mock` do front continua sendo o atual** (serviços com `localStorage`, que têm estado), e o Prism é usado no modo `http` apontando para `http://127.0.0.1:4010`.
- Execução via `npx @stoplight/prism-cli` (sem alterar `package.json`). Instalar como `devDependency` exige autorização explícita (AGENTS §1); esta spec **não** a concede.
- **MSW fica fora do escopo** (nova dependência e handlers escritos à mão que podem divergir do contrato).
- **Consequência para o YAML**: adicionar `example` nas respostas principais (Prism gera dados genéricos sem exemplos).

### ADR 6 — Início do backend: não autorizado por esta spec
- A SPEC-10 só documenta. O início do backend Spring Boot requer **SPEC própria e autorização explícita** (AGENTS §1; EVOL-002). O desenvolvedor decidirá em uma nova SPEC.
- Registro técnico da pergunta "dá para implementar o backend sem banco?": ver Seção 2.5.

---

## 1. Contexto, Rota e Localização
- **Objetivo da Tarefa**: declarar `docs/api/openapi.yaml` como contrato único entre front e backend, fixar convenções (decimais, erros RFC 7807, JWT por perfil, `clinicId`/`patientId` vindos do token, `orderId` legível) e mapear cada função mock a um endpoint.
- **Rota(s) da Aplicação**: nenhuma rota do front é alterada.
- **Arquivo(s) Alvo**:
  - Editado: `docs/api/openapi.yaml` (versão `0.3.0`, aplicando os ajustes da Seção 2.6)
  - Novo: `docs/specs/SPEC-10_Contrato_de_API.md` (este arquivo)
  - Editado (sincronização): `docs/prd/roadmap-evolucao.md` (EVOL-002 e EVOL-015 referenciam a SPEC-10), `AGENTS.md` §9 (já cita a SPEC-10; conferir referência)
  - **Nenhum arquivo em `src/` é alterado.**
- **Perfil de Acesso (Role)**: PUBLICO (catálogo, auth), `ROLE_USUARIO`, `ROLE_CLINICA`, `ROLE_ADMIN` (conforme o contrato)

---

## 2. Contrato de Dados & Persistência (Mock First)
- **Fonte de Dados Inicial**: `docs/api/openapi.yaml`. O estado atual do produto continua mock (`localStorage`/`sessionStorage`).
- **Query / Mutation Hook**: sem alteração. Os hooks TanStack Query existentes permanecem; a troca mock/http acontece nos serviços (SPEC-11).
- **Query Key**: sem alteração nesta spec. Chaves existentes e as da SPEC-09 (`['fee-ledger', ...]`, `['clinic-billing-config', ...]`) valem.

### 2.1 Convenções do contrato
| Tema | Regra |
|---|---|
| Base | `/api/v1`, JSON `camelCase` |
| Dinheiro | `number` em reais com 2 casas (ADR 1) |
| Datas e horas | `YYYY-MM-DD`; `HH:mm` em `America/Bahia`; timestamps ISO-8601 UTC |
| Identificadores | UUID; `orderId` = `ORD-AAAA-NNNNNN` (ADR 4) |
| Erros | RFC 7807 (`application/problem+json`) com `code` estável e, quando houver, `itemIndex` e `fieldErrors` |
| Autorização | `Authorization: Bearer <JWT>`; role no token (`ROLE_USUARIO`, `ROLE_CLINICA`, `ROLE_ADMIN`) |
| Escopo de dados | `clinicId` e `patientId` **sempre do token**, nunca do corpo ou da URL do próprio perfil (`/me`) |
| Paginação | `page` (base 0) e `size` (máx. 100) |
| Idempotência | `POST /orders` exige `Idempotency-Key` |
| Cliente | `X-Client-Type: MOBILE` opcional (ADR 2) |
| Segredos | `checkInToken` só aparece para o paciente dono; nunca em respostas de clínica ou admin |

### 2.2 Endpoints por perfil (resumo; detalhe no YAML)
| Perfil | Grupos de endpoints |
|---|---|
| Público | `POST /auth/patients/register`, `POST /auth/clinics/register`, `POST /auth/login`, `POST /auth/admin/login`, `GET /insurances`, `GET /catalog/procedures`, `GET /catalog/offers`, `GET /clinics/{clinicId}/availability`, `GET /locations/search` |
| Qualquer autenticado | `POST /auth/logout`, `POST /auth/refresh` (somente cliente MOBILE) |
| `ROLE_USUARIO` | `/patients/me` (GET/PUT), `/patients/me/orders`, `/patients/me/pending-attendance`, `/appointments/{id}/attendance`, `/orders/validate`, `/orders` |
| `ROLE_CLINICA` | `/clinics/me`, `/clinics/me/profile`, `/clinics/me/photos*`, `/clinics/me/services*`, `/clinics/me/appointments`, `/appointments/{id}/transitions`, `/clinics/me/check-in`, `/clinics/me/check-in/manual`, `/clinics/me/billing-config` (leitura), `/clinics/me/fee-ledger`, `/clinics/me/weekly-bills` |
| `ROLE_ADMIN` | `/admin/clinics*`, `/admin/clinics/{id}/billing-config`, `/admin/fee-ledger*`, `/admin/appointments`, `/admin/weekly-bills*` |

### 2.3 Matriz mock → endpoint
| Função / dado mock atual | Endpoint do contrato | Observação |
|---|---|---|
| `registerPatient` | `POST /auth/patients/register` | Senha enviada na requisição; hoje o mock não a persiste |
| `getPatientProfile` / `getRegisteredPatient` | `GET /patients/me` | CPF volta mascarado |
| `clearRegisteredPatient`, `clearRegisteredClinic`, saída do admin | `POST /auth/logout` | |
| `registerClinic` | `POST /auth/clinics/register` | Nasce `PENDENTE_APROVACAO_ADMIN` |
| `getRegisteredClinic` | `GET /clinics/me` | |
| `getClinicProfile` / `saveClinicProfile` | `GET` / `PUT /clinics/me/profile` | |
| `addClinicPhoto` / `setClinicCoverPhoto` / `deleteClinicPhoto` | `POST /clinics/me/photos`, `PUT .../{id}/cover`, `DELETE .../{id}` | Upload multipart (não base64) |
| `getClinicServices` / `saveClinicService` / `toggleClinicServiceStatus` / `deleteClinicService` | `GET`/`POST /clinics/me/services`, `PUT`/`DELETE .../{id}`, `PATCH .../{id}/status` | |
| `getRegisteredClinics` / `updateClinicApprovalStatus` | `GET /admin/clinics`, `PATCH /admin/clinics/{id}/status` | |
| Login admin mock (`gerir_e_confiar`) | `POST /auth/admin/login` | Credencial fixa some do front |
| `STANDARD_PROCEDURES_CATALOG` | `GET /catalog/procedures` | Mock mantém o arquivo |
| `MOCK_SERVICES_CATALOG` + `getClinicService` | `GET /catalog/offers` | Ver ADR 3 |
| `getAvailableClinicSlots` | `GET /clinics/{id}/availability` | |
| `findMockLocations` | `GET /locations/search` | EVOL-002 |
| `createAppointmentOrder` | `POST /orders` (+ `POST /orders/validate`) | Preço e nomes vêm do servidor |
| `getAppointmentsForPatient` | `GET /patients/me/orders` | |
| `getAppointments` (clínica) | `GET /clinics/me/appointments` | |
| `updateAppointmentStatus` | `POST /appointments/{id}/transitions` | Depende da SPEC-09 |
| Token / check-in / declaração / taxa / boleto | endpoints da SPEC-09 listados em 2.2 | Depende da SPEC-09 |
| `saveAppointment` (criação manual) e `deleteAppointment` | **sem endpoint** | Ações exclusivas do mock; **descontinuadas no modo `http`** (decisão registrada; `useDeleteAppointment` não terá equivalente) |

### 2.4 Códigos de erro (`Problem.code`)
Conjunto do YAML: `VALIDATION_ERROR`, `INVALID_TRANSITION`, `SLOT_UNAVAILABLE`, `OFFER_UNAVAILABLE`, `ATTENDANCE_PENDING`, `TOKEN_NOT_FOUND`, `TOKEN_ALREADY_USED`, `TOKEN_LOCKED`, `CHECK_IN_REQUIRED`, `INVALID_BILLABLE_STATUS`, `DUPLICATE_REQUEST`, `ALREADY_EXISTS`. Cada código mapeia para a mensagem em português definida na SPEC-09 §4.6 e nas validações existentes; o texto exibido ao usuário é do **front** (o `title`/`detail` da API não é mostrado cru). Acrescentar `UNAUTHENTICATED` (401) e `FORBIDDEN_ROLE` (403) ao enum.

### 2.5 Registro técnico: backend Spring Boot sem banco de dados
- **A SPEC-10 não depende de banco**, pois só entrega documentação.
- Para a futura SPEC do backend, é **tecnicamente possível** operar sem PostgreSQL de duas formas, ambas **temporárias**: (a) repositórios em memória atrás de interfaces, ou (b) H2 em memória com migrations Flyway que depois rodam no PostgreSQL. A opção (b) preserva o código de persistência.
- **Limitações a registrar**: dados perdem-se a cada reinício (inclusive em deploy no Railway); a sequência do `orderId` e a unicidade do token dependem de estado que reinicia (risco de repetição); impedir reserva concorrente do mesmo horário precisa de restrição transacional; o backend não substitui o mock `localStorage` do front para persistência de longo prazo. Isso será tratado na SPEC que autorizar o backend (ADR 6).

### 2.6 Ajustes obrigatórios em `docs/api/openapi.yaml` (versão 0.3.0)
1. Aplicar a ADR 1 (decimais) em todos os schemas, parâmetros e exemplos.
2. Aplicar a ADR 2 (remover D4/cookie; `refreshToken`; `X-Client-Type`; `/auth/refresh` por corpo para MOBILE).
3. Atualizar o `info.description`: remover D1 e D4, registrar ADR 1, 2, 4.
4. Corrigir referências de EVOL: `SettlementMode.description` (hoje cita EVOL-009; correto: EVOL-017) e o texto de Fase B do boleto (EVOL-014).
5. `feeOnInsuranceOrders`: remover "Padrão a confirmar"; padrão `true` (SPEC-09 ADR 10).
6. Adicionar `example` nas respostas de `/catalog/offers`, `/orders`, `/patients/me/orders`, `/clinics/me/appointments`, `/clinics/me/fee-ledger` (requisito do Prism).
7. Acrescentar `UNAUTHENTICATED` e `FORBIDDEN_ROLE` ao enum de `Problem.code`; documentar `pattern` do `orderId`: `^ORD-\d{4}-\d{6}$`.
8. Validar o arquivo com um linter OpenAPI (ex.: Spectral) sem erros.

---

## 3. Reuso Mandatório de Componentes (DRY)
Esta spec não altera componentes. Para a SPEC-11 permanecem obrigatórios:
- [ ] `Toast.jsx` para exibir erros mapeados de `Problem.code`
- [ ] `FormField.jsx` e `inputClassName` para erros de campo vindos de `fieldErrors`
- [ ] Hooks TanStack Query existentes (sem criar chamadas diretas a serviços em componentes)
- [ ] Ícones: exclusivamente `lucide-react` ou `@fortawesome/*` (zero emojis)
- [ ] Outros: `StatusBadge.jsx`, `ClinicActionBanner.jsx` (inalterados)

---

## 4. Máquina de Estados & Regras de Interação
- **Estado Inicial**: não se aplica (spec documental).
- **Transições Permitidas**: as definidas na SPEC-09 §4.1 (agendamento) e §4.2 (lançamento da taxa); o YAML as expõe por `TransitionAction` e `LedgerTransitionRequest`. Esta spec não as altera.
- **Transições Proibidas**: as listadas na SPEC-09 §4.1.
- **Comportamento em Erro / Exceção**: 401 limpa sessão e redireciona ao login; 409 e 422 exibem Toast em português a partir do `code`; 404 de recurso de outro dono não revela existência.
- **Feedback Visual**: Toast; sem novos componentes.

---

## 5. Anti-Escopo (O que NÃO fazer nesta tarefa)
- [ ] **NÃO** criar endpoint, projeto Spring Boot, `docker-compose`, banco, migration ou qualquer código de backend.
- [ ] **NÃO** alterar nenhum arquivo em `src/`.
- [ ] **NÃO** adicionar dependências ao `package.json` (Prism roda via `npx`; MSW não será usado).
- [ ] **NÃO** implementar refresh por cookie HttpOnly nem o fluxo do app mobile (apenas reservar o contrato).
- [ ] **NÃO** implementar o modo `FULL_AMOUNT`, repasse, estorno, Pix dinâmico ou gateway (Fase B, EVOL-014/017).
- [ ] **NÃO** reabrir o DoD das SPEC-05, SPEC-06 ou SPEC-09.
- [ ] **NÃO** sobrescrever `docs/specs/TEMPLATE_SPEC.md`.
- [ ] **NÃO** utilizar emojis.
- [ ] **NÃO** autorizar o início do backend (ADR 6).

---

## 6. Critérios de Aceite Fechados (DoD - Definition of Done)
- [ ] `docs/api/openapi.yaml` está na versão `0.3.0` com os oito ajustes da Seção 2.6.
- [ ] O YAML passa em validação OpenAPI (Spectral) sem erros.
- [ ] Nenhum campo `*Cents` permanece no YAML.
- [ ] Prism sobe com o YAML e responde com exemplos nos endpoints listados em 2.6 (item 6), verificado manualmente com `npx @stoplight/prism-cli mock docs/api/openapi.yaml`.
- [ ] A tabela de endpoints por perfil (2.2) confere com os `paths` do YAML.
- [ ] A matriz mock → endpoint (2.3) cobre todas as funções exportadas de `src/services/*.js`, e as duas funções sem endpoint estão marcadas como descontinuadas no modo `http`.
- [ ] As seis decisões estão registradas na Seção 0 e refletidas no `info.description` do YAML.
- [ ] `docs/prd/roadmap-evolucao.md` referencia a SPEC-10 em EVOL-002 e EVOL-015; histórico de atualização registrado.
- [ ] Nenhum arquivo de `src/` foi alterado; `npm run lint` e `npm run build` continuam passando.
- [ ] Zero emojis.

---

## 7. Checklist do Gatekeeper (Auto-auditoria da IA antes de codificar)
1. *Os campos de entrada e seus tipos estão 100% claros?* **SIM** — tipos definidos no YAML e convenções na §2.1; a mudança para decimais está especificada na ADR 1 e na §2.6.
2. *As mensagens de erro e estados vazios foram especificados?* **SIM** — `Problem.code` na §2.4 e comportamento por status na §4; textos finais em português vêm da SPEC-09 §4.6.
3. *A fonte do mock e chaves de cache do TanStack Query foram informadas?* **SIM** — modo `mock` mantém os serviços atuais; Prism para conformidade (ADR 5); query keys existentes e as da SPEC-09 permanecem.
4. *O escopo está livre de termos vagos?* **SIM** — itens fora de escopo listados na §5; duração do token (3600 s), formato do `orderId` e política de refresh definidos.

**Dependências declaradas (não são lacunas de definição):** a SPEC-09 está PENDENTE; o YAML descreve seu estado-alvo e a SPEC-11 não deve migrar agenda e financeiro para `http` antes de ela ser implementada.

---

## 8. Fechamento de Ciclo & Rastreabilidade (Obrigatório ao Concluir)
- [ ] 1. Marcar todos os checkboxes de Critérios de Aceite (Seção 6) como `[x]`.
- [ ] 2. Alterar o cabeçalho desta spec para `Status: CONCLUÍDO` com a data atual.
- [ ] 3. Atualizar `docs/prd/roadmap-evolucao.md` (EVOL-002, EVOL-015, histórico) e conferir a referência à SPEC-10 em `AGENTS.md` §9.
- [ ] 4. Registrar no roadmap a decisão pendente da SPEC do backend (ADR 6) e a futura EVOL de refresh por cookie, se adotada.
