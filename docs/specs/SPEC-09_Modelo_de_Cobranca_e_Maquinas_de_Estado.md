# SPEC-09: Modelo de Cobrança e Máquinas de Estado (Agendamento e Taxa)

- **Status**: PENDENTE
- **Data de Início**: 2026-11-03
- **Data de Conclusão**: Em aberto
- **Documento PRD de Referência**: `docs/prd/checklist-home-clinicle.md` (Seção 3 e 5) e `docs/prd/roadmap-evolucao.md` (EVOL-014, EVOL-015, EVOL-016, EVOL-017)
- **Substitui**: SPEC-08 (incorporada integralmente nesta spec) e parcialmente SPEC-07 (estados `PAGO`/`PENDENCIA_PAGAMENTO`, regra "não cobramos fora do app" e envio de PIX/boleto ao paciente deixam de valer). Notificações por WhatsApp e Google Auth permanecem na SPEC-07 reduzida (EVOL-005).

> **Instrução para a IA/Agente:** Antes de iniciar a implementação, audite este documento contra o checklist da Seção 7. Se houver qualquer campo com `[A DEFINIR]` ou ambiguidade em regras críticas, **NÃO assuma nem implemente**. Questione o desenvolvedor pontualmente no chat.

---

## 0. Decisões de Negócio Consolidadas (ADR)

1. A clínica cadastra os serviços e valores; o paciente compara, solicita e a clínica confirma.
2. **Fluxo padrão (`FEE_ONLY`)**: o paciente paga os serviços **diretamente à clínica**, na chegada. A clínica paga à plataforma a **taxa de R$ 5,00**, por **pedido por clínica** (`orderId` + `clinicId`), via boleto semanal emitido pela administração.
3. **Fluxo opcional (`FULL_AMOUNT`, regra futura — Fase B, EVOL-017)**: o sistema emite boleto **ao paciente** com a soma dos serviços + R$ 5,00. Exemplo: 180 + 75 + 5 = **R$ 260**. A plataforma recebe e **repassa** os serviços à clínica. Estorno e repasse **só existem neste modo** e são implementados apenas na Fase B.
4. A taxa é devida por padrão quando o agendamento fica `REALIZADO`. A administração configura, **por clínica**, em quais estados a taxa é cobrada (somente `REALIZADO` e `NAO_COMPARECEU` são permitidos).
5. Por clínica, a administração escolhe a forma de cobrança da taxa: **individual** (por pedido) ou **acumulada** (ciclo semanal, fuso `America/Bahia`, `weekKey` formato `YYYY-Www`).
6. Comparecimento: o paciente confirma no sistema se esteve na clínica **apenas enquanto o agendamento ainda estiver em `CONFIRMADO_CLINICA`** após a data do atendimento. Se a clínica já marcou `REALIZADO`, o paciente não é questionado e não há divergência possível por essa via.
7. Divergência (paciente declara `NOT_ATTENDED` mas o status ainda é `CONFIRMADO_CLINICA`, e a clínica depois marca diferente) é resolvida pela administração (`attendanceDispute: true` → lançamento vai a `EM_ANALISE`).
8. **Estorno não existe na Fase A / `FEE_ONLY`**. O status `ESTORNADO` é modelado no contrato de dados (Fase B), mas nenhuma ação o aciona na implementação mock. Ver ADR §3 e §8-B.
9. O token **não tem validade por tempo**; é invalidado por evento (ver §4.4). Token não é invalidado ao chegar em `NAO_COMPARECEU` — pode ser utilizado para reverter o status (prova de guichê). Recomenda-se reavaliar quando houver backend.
10. A taxa de R$ 5,00 incide sobre todo pedido por clínica, **independentemente do tipo de pagamento** (particular ou convênio). Agendamentos 100% por convênio têm `servicesAmount = 0`; a taxa persiste.
11. Prova de guichê: se o paciente declarou `NAO_COMPARECEU` mas a clínica apresentar o token posteriormente (ex: paciente chegou com atraso), a reversão `NAO_COMPARECEU` → `REALIZADO` é permitida, registrada como `checkInMethod: MANUAL_REVERSAL` e sinalizada à administração para verificação.
12. **Check-in e conclusão são duas ações separadas**: o check-in por token registra `checkedInAt` e habilita a ação "Marcar como realizado"; a clínica então aciona explicitamente `REALIZADO`. Isso preserva a possibilidade de o paciente comparecer mas o exame não ser realizado (reagendamento, preparo inadequado, etc.).
13. **Valores monetários**: o contrato de dados usa `number` em reais com decimais (ex.: `5.00`, `180.75`). Conversão para centavos inteiros ocorrerá na camada de integração quando o backend for criado (EVOL-002 / EVOL-014).
14. **Contrato de API**: `docs/api/openapi.yaml` é a fonte da verdade da API futura. Enquanto o backend não existe, o arquivo fica neste repositório frontend. Mudanças na API começam por ele. Uma cópia em outro repositório apenas referencia este; nunca duas cópias como fontes simultâneas.

### Faseamento

- **Fase A (esta spec)**: máquinas de estado, token, confirmação do paciente, lançamento da taxa e configuração administrativa com **persistência mock**.
- **Fase B (EVOL-014 e EVOL-017, fora desta spec)**: geração real de boleto, Pix, webhook, repasse e estorno. Requer backend (EVOL-002).

---

## 1. Contexto, Rota e Localização

- **Objetivo da Tarefa**: substituir a máquina de estados de agendamento (que misturava pagamento) por duas máquinas independentes; implementar check-in por token de pedido (duas etapas: chegada + conclusão) e confirmação de comparecimento pelo paciente; e criar o lançamento da taxa com configuração administrativa por clínica.
- **Rota(s) da Aplicação**:
  - `/paciente/inicio` — exibir token, bloquear novo pedido com comparecimento pendente, declarar presença
  - `/dashboard/agenda` — confirmar vaga, check-in por token, marcar realizado/não compareceu
  - `/dashboard/financeiro` — cobranças da clínica, boletos da semana
  - `/admin/clinicas` — modo de cobrança e estados faturáveis por clínica
  - `/admin/cobrancas` — fechar semana e emitir boletos mock
- **Arquivo(s) Alvo**:
  - Novo: `src/services/appointmentStateMachine.js` (funções puras de transição), `src/services/feeLedgerService.js`, `src/constants/billingConstants.js`
  - Novo: `src/pages/admin/AdminChargesPage.jsx`
  - Novo: `src/components/patient/AttendanceTokenCard.jsx`, `src/components/patient/AttendanceDeclarationModal.jsx`, `src/components/clinic/TokenCheckInForm.jsx`
  - Editado: `src/data/appointments.js`, `src/services/appointmentService.js`, `src/services/clinicService.js`
  - Editado: `src/pages/PatientWelcomePage.jsx`, `src/pages/clinic/ClinicAgendaPage.jsx`, `src/pages/clinic/ClinicFinancePage.jsx`, `src/pages/admin/AdminClinicsPage.jsx`
  - Editado: `src/components/clinic/StatusBadge.jsx`, `src/components/patient/PatientRecentOrdersCard.jsx`
  - Editado (copy): `src/components/landing/TestimonialsCarousel.jsx`
  - Editado: `src/App.jsx` (registrar rota `/admin/cobrancas`)
- **Perfil de Acesso (Role)**: `ROLE_USUARIO` (token e declaração), `ROLE_CLINICA` (agenda e financeiro), sessão administrativa mock (admin)

---

## 2. Contrato de Dados & Persistência (Mock First)

- **Fonte de Dados Inicial**: `localStorage` via serviços em `src/services/*.js`; dados padrão em `src/data/*.js`
- **Query / Mutation Hooks**: `useAppointments`, `usePatientAppointments` (existentes); novos `useFeeLedger`, `useClinicBillingConfig`
- **Query Keys**:
  - `['appointments']`
  - `['patient', 'appointments', patientId]`
  - `['fee-ledger', clinicId]`
  - `['fee-ledger', 'admin', weekKey]`
  - `['clinic-billing-config', clinicId]`
  - `['admin', 'clinics']` ao alterar `settlementMode` ou `billableStatuses`
- **Constante de taxa**: `PLATFORM_FEE_BRL = 5` em `src/constants/billingConstants.js`
- **Fuso da semana**: `America/Bahia`. Semana = segunda 00:00:00 até domingo 23:59:59. `weekKey` no formato `YYYY-Www` (ISO-8601, semana começando na segunda).

> **Nomenclatura unificada de domínio**:
> - **Lançamento** (`feeLedger`): registro financeiro por `orderId`+`clinicId`; uma instância por par.
> - **Boleto** (`weeklyBill`): documento de cobrança semanal por clínica; agrupa lançamentos.
> - **Hooks**: `useFeeLedger` (lançamentos), `useWeeklyBill` (boletos), `useClinicBillingConfig` (configuração).
> - Não usar `charges` como nome de entidade; "cobrança" na UI é o lançamento; "boleto" é o documento semanal.

### Agendamento

```json
{
  "id": "string",
  "orderId": "string",
  "patientId": "string",
  "patientName": "string",
  "clinicId": "string",
  "clinicName": "string",
  "examName": "string",
  "selectedDate": "YYYY-MM-DD",
  "selectedTimeSlot": "HH:mm",
  "paymentType": "PARTICULAR | CONVENIO",
  "price": "number decimal (ex: 180.75; 0 quando CONVENIO)",
  "status": "SOLICITADO | CONFIRMADO_CLINICA | REALIZADO | NAO_COMPARECEU | CANCELADO",
  "cancelledBy": "PACIENTE | CLINICA | ADMIN | null",
  "cancelReason": "string | null",
  "checkInToken": "string | null",
  "tokenIssuedAt": "ISO-8601 | null",
  "checkedInAt": "ISO-8601 | null",
  "checkInMethod": "TOKEN | MANUAL | MANUAL_REVERSAL | null",
  "patientAttendance": "ATTENDED | NOT_ATTENDED | null",
  "attendanceDispute": "boolean"
}
```

> **Token**: 6 caracteres do alphabet `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (sem caracteres ambíguos `0/O, 1/I`). **Um token por `orderId`**: gerado na primeira transição de qualquer item do pedido para `CONFIRMADO_CLINICA` e copiado para todos os itens desse `orderId`, inclusive os ainda em `SOLICITADO` em outra clínica. Deve ser único entre pedidos não cancelados.

### Lançamento da taxa (`feeLedger`)

```json
{
  "id": "string",
  "orderId": "string",
  "clinicId": "string",
  "appointmentIds": ["string"],
  "weekKey": "YYYY-Www",
  "feeAmount": "number decimal (ex: 5.00)",
  "servicesAmount": "number decimal",
  "totalAmount": "number decimal",
  "settlementMode": "FEE_ONLY | FULL_AMOUNT",
  "status": "EM_ANALISE | DEVIDA | COBRANCA_GERADA | PAGA | EM_ATRASO | ISENTA",
  "triggerStatus": "REALIZADO | NAO_COMPARECEU",
  "weeklyBillId": "string | null",
  "attendanceDispute": "boolean",
  "createdAt": "ISO-8601"
}
```

> - `servicesAmount`: soma de `price` dos itens `PARTICULAR` daquele `orderId` + `clinicId` que atingiram estado cobrável. Itens `CONVENIO` somam `0`.
> - `totalAmount` em `FEE_ONLY`: sempre `5.00`. Em `FULL_AMOUNT`: `servicesAmount + 5.00`.
> - Exemplo `FULL_AMOUNT`: exames R$ 180,00 + R$ 75,00 → `servicesAmount = 255.00`, `feeAmount = 5.00`, `totalAmount = 260.00`.
> - O campo `ESTORNADO` não existe neste enum. Estorno pertence ao `weeklyBill` e apenas na Fase B.

### Boleto semanal (`weeklyBill`)

```json
{
  "id": "string",
  "clinicId": "string",
  "weekKey": "YYYY-Www",
  "feeLedgerIds": ["string"],
  "totalAmount": "number decimal",
  "digitableLine": "string mock",
  "status": "EMITIDO | LIQUIDADO | ESTORNADO",
  "issuedAt": "ISO-8601"
}
```

> - `ESTORNADO` é modelado no contrato mas **não acionado na Fase A**. Fica reservado para a Fase B (`FULL_AMOUNT`).
> - `feeLedgerIds` substitui `chargeIds` para manter nomenclatura consistente com a entidade `feeLedger`.

### Configuração de cobrança por clínica (`clinicBillingConfig`)

```json
{
  "clinicId": "string",
  "settlementMode": "FEE_ONLY",
  "billableStatuses": ["REALIZADO"],
  "billingGrouping": "INDIVIDUAL | ACCUMULATED",
  "feeOnInsuranceOrders": true
}
```

> - `settlementMode` padrão: `FEE_ONLY`.
> - `billableStatuses` padrão: `["REALIZADO"]`. Valores permitidos: apenas `REALIZADO` e `NAO_COMPARECEU`. Proibido incluir `SOLICITADO`, `CONFIRMADO_CLINICA` ou `CANCELADO`.
> - `feeOnInsuranceOrders` padrão: `true` — taxa incide mesmo em pedidos 100% convênio.
> - `billingGrouping` padrão: `INDIVIDUAL`. Forma `ACCUMULATED` agrupa em ciclo semanal (`weekKey`).

---

## 3. Reuso Mandatório de Componentes (DRY)

- [ ] `FormField.jsx` (rótulos e erros acessíveis)
- [ ] `Toast.jsx` (mensagens flutuantes de sucesso/erro)
- [ ] `inputClassName` de `src/utils/formUtils.js`
- [ ] `StatusBadge.jsx` — ampliar `APPOINTMENT_STATUS_CONFIG` com os novos estados
- [ ] `ClinicActionBanner.jsx` — avisos de comparecimento pendente no portal do paciente
- [ ] `StatCard.jsx` — métricas do financeiro
- [ ] `FilterButtonGroup.jsx` — filtros de status na agenda e no admin
- [ ] Ícones: exclusivamente `lucide-react` ou `@fortawesome/*` (zero emojis)
- [ ] Hooks TanStack Query para toda leitura e mutação, inclusive no admin

---

## 4. Máquinas de Estado & Regras de Interação

### 4.1 Máquina 1 — Agendamento

> O enum de status do agendamento é **o mesmo nas três pontas** (paciente, clínica e admin). Todos enxergam os mesmos rótulos; o que difere é **quem pode acionar cada transição** (`getAvailableActions(status, role)`).

| De | Ação | Para | Quem |
|---|---|---|---|
| `SOLICITADO` | Confirmar vaga | `CONFIRMADO_CLINICA` | Clínica |
| `SOLICITADO` | Recusar / cancelar | `CANCELADO` | Clínica, paciente ou admin |
| `CONFIRMADO_CLINICA` | **Check-in por token** (Passo 1) | permanece `CONFIRMADO_CLINICA`, grava `checkedInAt`, habilita "Marcar realizado" | Clínica |
| `CONFIRMADO_CLINICA` | **Marcar realizado** (Passo 2, após check-in) | `REALIZADO` | Clínica |
| `CONFIRMADO_CLINICA` | Marcar não compareceu | `NAO_COMPARECEU` | Clínica |
| `CONFIRMADO_CLINICA` | Cancelar | `CANCELADO` | Clínica, paciente ou admin |
| `NAO_COMPARECEU` | Apresentar token (prova de guichê) | `REALIZADO` | Clínica |

**Regras da Máquina 1:**
- O **mesmo enum** `APPOINTMENT_STATUS` é exibido e interpretado identicamente pelo paciente, pela clínica e pelo admin. A função `getAvailableActions(status, role)` filtra quais ações cada role pode executar.
- `REALIZADO`, `NAO_COMPARECEU` e `CANCELADO` são **terminais** (exceto a reversão `NAO_COMPARECEU` → `REALIZADO` por token, exclusiva da clínica).
- `REALIZADO` **exige `checkedInAt` preenchido**. Exceção apenas por busca manual (CPF/nome), registrada como `checkInMethod: MANUAL`.
- **Check-in e conclusão são etapas distintas**: o check-in por token grava `checkedInAt` e `checkInMethod: TOKEN`, e habilita o botão "Marcar realizado". A transição para `REALIZADO` é uma ação explícita posterior da clínica.
- Toda regra de transição vive em funções puras (`getAvailableActions(status, role)`, `canTransition(from, to, role)`) em `appointmentStateMachine.js`.
- Transição inválida **lança erro** (não apenas `console.warn`) em `updateAppointmentStatus` e exibe `Toast` em português. Estado não é alterado.
- Check-in da clínica A **nunca** altera itens da clínica B no mesmo pedido.

**Transições proibidas (nunca implementar):**
- Qualquer destino `PAGO`, `PENDENCIA_PAGAMENTO`, `FINALIZADO`, `AGUARDANDO_PAGAMENTO` ou `ESTORNO_SOLICITADO` no agendamento.
- `SOLICITADO` → `REALIZADO` ou `NAO_COMPARECEU` sem passar por `CONFIRMADO_CLINICA`.
- `ESTORNADO` como status do agendamento (pertence só ao `weeklyBill`, e apenas na Fase B).
- `REALIZADO` sem `checkedInAt` preenchido (bloquear na função de transição).

### 4.2 Máquina 2 — Lançamento da taxa (`feeLedger`)

Modo `FEE_ONLY` (Fase A — mock):

| De | Evento | Para |
|---|---|---|
| (criação) | Ao menos um item do grupo `orderId`+`clinicId` atinge estado cobrável sem divergência | `DEVIDA` |
| (criação) | Estado cobrável, mas `attendanceDispute: true` | `EM_ANALISE` |
| `EM_ANALISE` | Administração decide cobrar | `DEVIDA` |
| `EM_ANALISE` | Administração decide isentar | `ISENTA` |
| `DEVIDA` | Admin gera cobrança (individual) ou fecha ciclo semanal (acumulada) | `COBRANCA_GERADA` |
| `COBRANCA_GERADA` | Pagamento identificado (mock: ação manual do admin) | `PAGA` |
| `COBRANCA_GERADA` | Prazo vencido sem pagamento (mock: ação manual do admin) | `EM_ATRASO` |
| `EM_ATRASO` | Pagamento identificado | `PAGA` |
| `DEVIDA` | Agendamento cancelado antes da cobrança | `ISENTA` |

Modo `FULL_AMOUNT` (**Fase B, EVOL-017 — apenas modelado, não implementar**): `EMITIDO` → `PAGA` → `REPASSADO`, com `VENCIDO`, `ESTORNO_SOLICITADO` e `ESTORNADO`. O boleto pode ser pago antes do atendimento; o token só é gerado após o pagamento. O estorno é aprovado pela administração.

**Regras do lançamento:**
- Unidade: **pedido por clínica** (`orderId` + `clinicId`). Pedido com duas clínicas gera dois lançamentos independentes.
- **Fato gerador**: ao menos um item do grupo `orderId`+`clinicId` atinge um status listado em `billableStatuses` da clínica. Se ainda não existir lançamento para o par, criar com `weekKey` da data/hora da transição em `America/Bahia`.
- Convênio: `servicesAmount = 0.00`, mas a taxa de R$ 5,00 ainda incide (ver ADR §10).
- Forma `ACCUMULATED`: agrupa lançamentos `DEVIDA` em um único fechamento por `weekKey`.

### 4.3 Token de check-in

- **Um token por `orderId`** (pedido inteiro). Gerado na primeira transição de qualquer item do pedido para `CONFIRMADO_CLINICA`.
- Copiado para o campo `checkInToken` de **todos os itens** do `orderId`, inclusive os ainda em `SOLICITADO` em outra clínica.
- **6 caracteres** do alphabet `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (sem `0/O, 1/I`). Deve ser único entre pedidos não cancelados.
- **Sem validade por tempo**. É invalidado (não pode mais ser usado para check-in normal) quando: o status do grupo desta clínica fica `REALIZADO` ou `CANCELADO`. **Não é invalidado em `NAO_COMPARECEU`** — pode ser apresentado posteriormente para a reversão por prova de guichê.
- O mesmo token serve nas duas recepções quando o pedido inclui clínicas diferentes.
- Na recepção, a clínica informa o token; o sistema lista **apenas** nome do paciente, serviços, preço, instruções de preparo (`descriptionPrep`) e horário **da própria clínica** naquele pedido.
- Limitar tentativas de código incorreto: bloquear após **5 falhas consecutivas** no mesmo formulário.

**Reversão por prova de guichê (`NAO_COMPARECEU` → `REALIZADO`):**
- Permitida quando a clínica apresenta o token após ter marcado `NAO_COMPARECEU` (ex.: paciente chegou atrasado).
- Registrado como `checkInMethod: MANUAL_REVERSAL` e `attendanceDispute: true`.
- Sinalizado automaticamente à administração para verificação (`feeLedger` vai a `EM_ANALISE` se ainda não estava `PAGA`).

### 4.4 Confirmação de comparecimento pelo paciente

- O paciente responde em `/paciente/inicio` **apenas para agendamentos que ainda estão em `CONFIRMADO_CLINICA` após a data do atendimento**: "Fui atendido" (`ATTENDED`) ou "Não fui atendido" (`NOT_ATTENDED`), por clínica.
- Se a clínica já marcou `REALIZADO` antes da declaração, **o paciente não é questionado** e não há divergência possível por essa via (ver ADR §6).
- **Bloqueio de novo pedido**: ao submeter novo carrinho, se houver agendamento passado em `CONFIRMADO_CLINICA` sem declaração do paciente, bloquear envio e focar no modal de declaração. Mensagem: *"Informe se você compareceu aos exames confirmados antes de solicitar novos agendamentos."*
- Divergência: paciente declara `NOT_ATTENDED` para um agendamento ainda em `CONFIRMADO_CLINICA` e a clínica depois marca `REALIZADO` → `attendanceDispute: true` → lançamento vai a `EM_ANALISE`.

### 4.5 Boleto semanal (admin) — Fase A

- Em `/admin/cobrancas`, ação **"Emitir boletos da semana"** para um `weekKey` informado.
- Agrupa lançamentos `DEVIDA` por `clinicId`, cria um `weeklyBill` mock por clínica com status `EMITIDO`, move esses lançamentos para `COBRANCA_GERADA`.
- **Estorno não é implementado na Fase A**. O status `ESTORNADO` existe no contrato de dados mas não há ação na UI que o acione. A funcionalidade será implementada na Fase B (`FULL_AMOUNT`).

### 4.6 Comportamento em erro / exceção

| Situação | Mensagem (Toast) |
|---|---|
| Token inexistente, inválido **ou** sem itens desta clínica | *"Token não encontrado. Confira o código informado pelo paciente."* |
| Token já utilizado nesta clínica (check-in já realizado) | *"A presença deste pedido já foi registrada nesta clínica."* (sem duplicar cobrança) |
| Reversão por prova de guichê bem-sucedida | *"Prova de guichê registrada. O agendamento voltou para Realizado e foi sinalizado para revisão administrativa."* |
| Check-in bem-sucedido (Passo 1) | *"Chegada registrada. Clique em 'Marcar realizado' para encerrar o atendimento."* |
| Marcar realizado sem check-in prévio | *"É necessário registrar a chegada pelo token antes de marcar como realizado."* |
| Submissão de carrinho com declaração pendente | Bloqueio e foco no modal de declaração |
| Tentativa de definir estado cobrável inválido na admin | *"Só é permitido cobrar taxa em Realizado ou Não compareceu."* |
| Transição inválida de agendamento | Toast de erro em português; estado inalterado |

### 4.7 Feedback visual

**Badges de agendamento via `StatusBadge`:**

| Status | Classes Tailwind |
|---|---|
| `SOLICITADO` | `bg-blue-50 text-blue-700 border-blue-200` |
| `CONFIRMADO_CLINICA` | `bg-amber-50 text-amber-700 border-amber-200` |
| `REALIZADO` | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| `NAO_COMPARECEU` | `bg-slate-100 text-slate-700 border-slate-300` |
| `CANCELADO` | `bg-red-50 text-red-700 border-red-200` |

**Badges de lançamento (`feeLedger`) — somente na tela financeira, nunca no agendamento:**

| Status | Classes Tailwind |
|---|---|
| `DEVIDA` / `COBRANCA_GERADA` | `bg-orange-50 text-orange-700 border-orange-200` |
| `PAGA` | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| `EM_ATRASO` | `bg-red-50 text-red-700 border-red-200` |
| `EM_ANALISE` | `bg-yellow-50 text-yellow-700 border-yellow-200` |
| `ISENTA` | `bg-slate-100 text-slate-500 border-slate-200` |

**Badge de boleto semanal (`weeklyBill`):**

| Status | Classes Tailwind |
|---|---|
| `EMITIDO` | `bg-orange-50 text-orange-700 border-orange-200` |
| `LIQUIDADO` | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| `ESTORNADO` | `bg-red-50 text-red-700 border-red-200` *(modelado; não acionado na Fase A)* |

### 4.8 Identificação do pagamento Pix (Fase B — apenas referência, EVOL-017)

A plataforma gerará uma **cobrança Pix dinâmica** com `txid` próprio por lançamento (26–35 caracteres alfanuméricos, único por recebedor), confirmada por webhook do provedor. Pix feito digitando a chave sem cobrança exige conciliação manual. Decisão de provedor e formato do `txid` pertencem à EVOL-017.

---

## 5. Anti-Escopo

- [ ] **NÃO** criar backend, endpoint, gateway de boleto, webhook bancário ou cron de servidor.
- [ ] **NÃO** implementar o modo `FULL_AMOUNT`, repasse ou estorno (apenas modelar os campos no contrato de dados).
- [ ] **NÃO** acionar o status `ESTORNADO` em nenhuma entidade na Fase A.
- [ ] **NÃO** usar `CONFIRMADO_CLINICA` como estado cobrável (cobraria antes do atendimento).
- [ ] **NÃO** manter `PAGO`, `PENDENCIA_PAGAMENTO`, `FINALIZADO`, `AGUARDANDO_PAGAMENTO` ou `ESTORNO_SOLICITADO` como status de agendamento.
- [ ] **NÃO** alterar rotas fora das listadas na Seção 1.
- [ ] **NÃO** utilizar emojis na interface.
- [ ] **NÃO** criar utilitários que já existam.
- [ ] **NÃO** implementar Google Auth, WhatsApp ou e-mail transacional (SPEC-07 / EVOL-005).
- [ ] **NÃO** cobrar PIX de R$ 5,00 do paciente nem reintroduzir `PAGO` como status de agendamento.
- [ ] **NÃO** custodiar valor de serviço em conta da plataforma além do registro mock do modo `FULL_AMOUNT`.
- [ ] **NÃO** sobrescrever `docs/specs/TEMPLATE_SPEC.md` nem reabrir DoD da SPEC-06.
- [ ] **NÃO** alterar o wizard de credenciamento da SPEC-05 além de persistir `settlementMode` e `billableStatuses` padrão nos cadastros existentes.
- [ ] **NÃO** resolver aqui o vínculo clínica logada x dados (EVOL-016) nem a autenticação real (EVOL-015); o lançamento usa o `clinicId` do dado do agendamento.
- [ ] **NÃO** adicionar Vitest ou qualquer framework de teste automatizado (pertence à EVOL-012; o DoD desta spec substitui o critério de testes por cobertura manual dos fluxos interativos).

---

## 6. Critérios de Aceite Fechados (DoD)

- [ ] `appointmentStateMachine.js` define as transições da Máquina 1 e `updateAppointmentStatus` **lança erro** (não apenas `console.warn`) em transição inválida.
- [ ] `APPOINTMENT_STATUS` contém somente `SOLICITADO`, `CONFIRMADO_CLINICA`, `REALIZADO`, `NAO_COMPARECEU` e `CANCELADO`.
- [ ] Check-in por token (Passo 1) grava `checkedInAt` e habilita "Marcar realizado" — **não transita para `REALIZADO` automaticamente**.
- [ ] `REALIZADO` só é possível após `checkedInAt` preenchido; busca manual registrada como `checkInMethod: MANUAL`.
- [ ] A primeira confirmação de qualquer item do pedido gera um token de 6 caracteres visível em `/paciente/inicio` e copiado para todos os itens do `orderId`.
- [ ] Token **não** é invalidado em `NAO_COMPARECEU`; pode ser apresentado para reversão com `checkInMethod: MANUAL_REVERSAL`.
- [ ] Reversão por prova de guichê marca `attendanceDispute: true` e sinaliza lançamento a `EM_ANALISE`.
- [ ] Check-in da clínica A não afeta itens da clínica B no mesmo pedido.
- [ ] Fato gerador da taxa: ao menos um item do grupo `orderId`+`clinicId` atinge estado cobrável → cria `feeLedger` com `weekKey` correto (`America/Bahia`).
- [ ] Pedido com duas clínicas gera dois lançamentos independentes; o token é o mesmo.
- [ ] Modo `FULL_AMOUNT` modelado no contrato mas sem UI ou ação que o acione na Fase A.
- [ ] Convênio: `servicesAmount = 0.00`; taxa de R$ 5,00 incide normalmente.
- [ ] `NAO_COMPARECEU` → `REALIZADO` possível apenas por token (prova de guichê) com log de `MANUAL_REVERSAL`.
- [ ] Agenda da clínica oferece ações confirmar, check-in, marcar realizado, não compareceu e cancelar — sem ação de pagamento.
- [ ] Paciente com item `CONFIRMADO_CLINICA` sem declaração não envia novo carrinho; bloqueio com modal.
- [ ] Declaração do paciente não solicitada quando agendamento já está em `REALIZADO`.
- [ ] Divergência (`NOT_ATTENDED` pelo paciente + clínica marca `REALIZADO`) → `attendanceDispute: true` → `EM_ANALISE`.
- [ ] Administração configura por clínica: `settlementMode`, `billableStatuses` e `billingGrouping`.
- [ ] Administração visualiza e altera lançamentos conforme a Máquina 2 em `/admin/cobrancas`.
- [ ] `/admin/cobrancas` emite um `weeklyBill` mock por clínica ao fechar a semana ISO informada.
- [ ] Estorno **não implementado** na Fase A; `ESTORNADO` modelado mas sem ação na UI.
- [ ] Financeiro da clínica mostra atendimentos realizados e taxa a pagar; bloco de chave Pix removido.
- [ ] Copy de "taxa via PIX do paciente" removido de `PatientWelcomePage.jsx` e `TestimonialsCarousel.jsx`.
- [ ] Todas as mensagens de token usam a mensagem genérica para inexistente/inválido/sem itens desta clínica.
- [ ] Zero emojis; `StatusBadge`, `StatCard`, `FormField`, `ClinicActionBanner` e `Toast` reutilizados.
- [ ] Linter roda 100% limpo (`npm run lint`).
- [ ] Build da aplicação compila com sucesso (`npm run build`).

---

## 7. Checklist do Gatekeeper (Auto-auditoria da IA antes de codificar)

A IA deve verificar este checklist. Se algum item for **NÃO**, deve perguntar antes de codificar:

1. *Os campos de entrada e seus tipos estão 100% claros?* **SIM**
2. *As mensagens de erro e estados vazios foram especificados?* **SIM** (ver §4.6)
3. *A fonte do mock e chaves de cache do TanStack Query foram informadas?* **SIM** (ver §2)
4. *O escopo está livre de termos vagos?* **SIM**

---

## 8. Fechamento de Ciclo & Rastreabilidade (Obrigatório ao Concluir)

*Ao passar com sucesso no linter e build, a IA DEVE executar todos os passos abaixo:*

- [ ] 1. Marcar todos os checkboxes de Critérios de Aceite (Seção 6) como `[x]`.
- [ ] 2. Alterar o cabeçalho desta spec para `Status: CONCLUÍDO` com a data atual.
- [ ] 3. Sincronizar `docs/prd/checklist-home-clinicle.md` (tabela de estados §3.1 e pendências financeiras §5) e `docs/prd/roadmap-evolucao.md` (EVOL-014, 015, 016 e 017) — marcar itens entregues como `[x]`.
- [ ] 4. Reescrever a §4 do `AGENTS.md` com as duas máquinas de estado, remover a regra "Registrar Pagamento" e substituir referências à SPEC-08 pela SPEC-09.
- [ ] 5. Reduzir a SPEC-07 para manter apenas notificações (WhatsApp) e Google Auth (EVOL-005).
- [ ] 6. Confirmar que `docs/api/openapi.yaml` existe (pode ser stub vazio com versão e info) e está referenciado no `AGENTS.md` §9.
