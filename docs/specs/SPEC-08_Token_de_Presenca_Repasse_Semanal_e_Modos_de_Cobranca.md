# SPEC-08: Token de Presença, Repasse Semanal e Modos de Cobrança

- **Status**: SUBSTITUÍDA — ver `SPEC-09_Modelo_de_Cobranca_e_Maquinas_de_Estado.md`
- **Data de Início**: 2026-10-28
- **Data de Conclusão**: 2026-11-03
- **Documento PRD de Referência**: `docs/prd/checklist-home-clinicle.md` (Seção 3 e Seção 5) e `docs/prd/checklist-home-patiente.md` (Seção 2.3 e nova Seção 3.1)

> **Instrução para a IA/Agente:** Antes de iniciar a implementação, audite este documento contra o checklist da Seção 7. Se houver qualquer campo com "[A DEFINIR]" ou ambiguidade em regras críticas, **NÃO assuma nem implemente**. Questione o desenvolvedor pontualmente no chat.

**Relação com outras specs:** esta spec é a fonte do contrato de presença, taxa e boleto. Substitui o modelo de taxa PIX do paciente e os estados `PAGO`, `PENDENCIA_PAGAMENTO` e `FINALIZADO` descritos na SPEC-07. A SPEC-07 permanece responsável apenas por Google Auth e WhatsApp (EVOL-005). A SPEC-06 permanece responsável pelo carrinho e pela criação do `orderId`; não reabre critérios já concluídos.

---

## 1. Contexto, Rota e Localização
- **Objetivo da Tarefa**: Trocar o mock de “paciente paga R$ 5 via PIX” por presença via token, estados operacionais compartilhados e cobrança da clínica (repasse de R$ 5,00 por pedido-clínica ou faturamento de serviços + taxa), com boleto semanal emitido na área administrativa.
- **Rota(s) da Aplicação**:
  - `/paciente/inicio` (exibir token, declarar presença antes de novo pedido)
  - `/dashboard/agenda` (confirmar vaga, check-in por token)
  - `/dashboard/financeiro` (cobranças da clínica, boletos da semana)
  - `/admin/clinicas` (modo de cobrança e estados faturáveis por clínica)
  - `/admin/cobrancas` (fechar semana e emitir boletos mock)
- **Arquivo(s) Alvo**:
  - Página / View: `src/pages/PatientWelcomePage.jsx`, `src/pages/clinic/ClinicAgendaPage.jsx`, `src/pages/clinic/ClinicFinancePage.jsx`, `src/pages/admin/AdminClinicsPage.jsx`, `src/pages/admin/AdminChargesPage.jsx` (novo)
  - Componentes novos/editados: `src/components/clinic/StatusBadge.jsx`, `src/components/patient/PatientRecentOrdersCard.jsx`, `src/components/patient/AttendanceTokenCard.jsx` (novo), `src/components/patient/AttendanceDeclarationModal.jsx` (novo), `src/components/clinic/TokenCheckInForm.jsx` (novo), `src/components/landing/TestimonialsCarousel.jsx` (copy da taxa)
  - Serviços / Mocks: `src/data/appointments.js`, `src/services/appointmentService.js`, `src/services/chargeService.js` (novo), `src/services/clinicService.js`, `src/hooks/useAppointments.js`, `src/hooks/usePatientAppointments.js`, `src/hooks/useCharges.js` (novo), `src/App.jsx`
- **Perfil de Acesso (Role)**: `ROLE_USUARIO` (token e declaração), `ROLE_CLINICA` (agenda e financeiro), sessão administrativa mock já usada em `/admin/clinicas`

---

## 2. Contrato de Dados & Persistência (Mock First)
- **Fonte de Dados Inicial**: `src/data/appointments.js`; `localStorage` `gerenciar_saude_appointments_v1`; `localStorage` `gerenciar_saude_charges_v1`; cadastros de clínica já persistidos por `clinicService.js`
- **Query / Mutation Hook**: `useAppointments`, `usePatientAppointments`, `useCharges` via `@tanstack/react-query`
- **Query Key**:
  - `['appointments']`
  - `['patient', 'appointments', patientId]`
  - `['charges', clinicId]`
  - `['admin', 'charges', weekKey]`
  - `['admin', 'clinics']` ao alterar `billingMode` ou `billableStatuses`
- **Constante de taxa**: `PLATFORM_FEE_BRL = 5` em `src/constants/billingConstants.js`
- **Fuso da semana**: `America/Bahia`. Semana = segunda 00:00:00 até domingo 23:59:59. `weekKey` no formato `YYYY-Www` (ISO-8601, semana começando na segunda).
- **Estrutura do Objeto (Payload/Item)**:

Agendamento (item do pedido; status operacional compartilhado nas três pontas):

```json
{
  "id": "string",
  "orderId": "string",
  "patientId": "string",
  "patientName": "string",
  "clinicId": "string",
  "clinicName": "string",
  "examName": "string",
  "selectedDate": "string YYYY-MM-DD",
  "selectedTimeSlot": "string HH:mm",
  "paymentType": "PARTICULAR | CONVENIO",
  "price": "number (0 quando CONVENIO)",
  "status": "SOLICITADO | CONFIRMADO_CLINICA | REALIZADO | NAO_COMPARECEU | CANCELADO",
  "attendanceToken": "string | null",
  "tokenIssuedAt": "string ISO-8601 | null",
  "checkedInAt": "string ISO-8601 | null",
  "attendanceSource": "TOKEN | PATIENT_DECLARATION | null"
}
```

Pedido (campos denormalizados em todos os itens do mesmo `orderId`): um único `attendanceToken` por `orderId`, gerado na primeira transição de qualquer item para `CONFIRMADO_CLINICA`.

Cobrança (um registro por par `orderId` + `clinicId`, nunca por exame):

```json
{
  "id": "string",
  "orderId": "string",
  "clinicId": "string",
  "appointmentIds": ["string"],
  "weekKey": "string YYYY-Www",
  "mode": "REPASSE | FATURAMENTO",
  "feeAmount": 5,
  "servicesAmount": "number",
  "totalAmount": "number",
  "status": "TAXA_DEVIDA | BOLETO_EMITIDO | LIQUIDADO | ESTORNADO",
  "boletoId": "string | null",
  "createdAt": "string ISO-8601"
}
```

Boleto semanal (um por clínica e `weekKey`):

```json
{
  "id": "string",
  "clinicId": "string",
  "weekKey": "string YYYY-Www",
  "chargeIds": ["string"],
  "totalAmount": "number",
  "digitableLine": "string mock",
  "status": "BOLETO_EMITIDO | LIQUIDADO | ESTORNADO",
  "issuedAt": "string ISO-8601"
}
```

Configuração da clínica (persistida no cadastro mock):

```json
{
  "billingMode": "REPASSE | FATURAMENTO",
  "billableStatuses": ["REALIZADO"]
}
```

- `billingMode` padrão: `REPASSE`.
- `billableStatuses` padrão: `["REALIZADO"]`. Valores permitidos somente `REALIZADO` e `NAO_COMPARECEU`. Proibido incluir `SOLICITADO`, `CONFIRMADO_CLINICA` ou `CANCELADO`.
- Token: 6 caracteres do alfabeto `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`, único entre pedidos não cancelados.
- `servicesAmount`: soma de `price` dos itens `PARTICULAR` daquele `orderId` e `clinicId` que estão em estado faturável da clínica. Itens `CONVENIO` somam `0`.
- `totalAmount` em `REPASSE`: sempre `5`. Em `FATURAMENTO`: `servicesAmount + 5`.
- Exemplo FATURAMENTO: exames 180 e 75 na mesma clínica e pedido → `servicesAmount = 255`, `feeAmount = 5`, `totalAmount = 260`.

---

## 3. Reuso Mandatório de Componentes (DRY)
Liste os componentes existentes que **DEVEM** ser utilizados:
- [ ] `FormField.jsx` (rótulos e erros acessíveis)
- [ ] `Toast.jsx` (mensagens flutuantes de sucesso/erro)
- [ ] `inputClassName` de `src/utils/formUtils.js`
- [ ] Ícones: exclusivamente `lucide-react` ou `@fortawesome/*` (zero emojis)
- [ ] Outros: `StatusBadge.jsx`, `StatCard.jsx`, `ClinicActionBanner.jsx`

---

## 4. Máquina de Estados & Regras de Interação
- **Estado Inicial**: cada item nasce `SOLICITADO` (inalterado em relação à SPEC-06). Token ainda não existe.
- **Transições Permitidas** (mesmo enum para paciente, clínica e admin):
  - `SOLICITADO` → `CONFIRMADO_CLINICA` (clínica confirma a vaga daquele item)
  - `SOLICITADO` → `CANCELADO`
  - `CONFIRMADO_CLINICA` → `REALIZADO` (check-in com token na clínica do item, ou declaração “compareceu” do paciente para o recorte dessa clínica)
  - `CONFIRMADO_CLINICA` → `NAO_COMPARECEU` (declaração “não compareceu” do paciente para o recorte dessa clínica)
  - `CONFIRMADO_CLINICA` → `CANCELADO`
  - `NAO_COMPARECEU` → `REALIZADO` somente se a clínica apresentar o token depois (prova de guichê prevalece)
- **Transições Proibidas**:
  - Qualquer destino `PAGO`, `PENDENCIA_PAGAMENTO`, `FINALIZADO`, `AGUARDANDO_PAGAMENTO` ou `ESTORNO_SOLICITADO` no agendamento
  - `SOLICITADO` → `REALIZADO` ou `NAO_COMPARECEU` sem passar por `CONFIRMADO_CLINICA`
  - `ESTORNADO` como status do agendamento (pertence só à cobrança/boleto)
  - Check-in de clínica A alterando itens de clínica B
- **Token**:
  - Um token por `orderId`.
  - Gerado na primeira confirmação de qualquer item do pedido e copiado para todos os itens desse `orderId`, inclusive os ainda `SOLICITADO` em outra clínica.
  - Permanece válido até o pedido não ter mais item em `CONFIRMADO_CLINICA` (todos `REALIZADO`, `NAO_COMPARECEU` ou `CANCELADO`).
  - No guichê, a clínica informa o token; o sistema lista somente os itens da sessão daquela clínica naquele pedido (serviços, preço, preparo, dados do paciente já persistidos).
  - Check-in bem-sucedido marca `REALIZADO` em todos os itens `CONFIRMADO_CLINICA` daquele `orderId` + `clinicId` e preenche `checkedInAt` e `attendanceSource = TOKEN`.
- **Pedido com duas clínicas**: o lote de cobrança é por clínica. Cada par `orderId` + `clinicId` que atingir estado faturável gera a própria taxa de R$ 5,00. O mesmo token serve nas duas recepções.
- **Trava de novo pedido**: se o paciente autenticado tiver algum item em `CONFIRMADO_CLINICA` cujo token ainda não foi usado na clínica desse item, a submissão de um novo carrinho é bloqueada até declarar, por clínica pendente, se compareceu ou não. Mensagem: “Informe se você compareceu aos exames confirmados antes de solicitar novos agendamentos.”
- **Fato gerador da cobrança**: ao entrar em um status listado em `billableStatuses` da clínica, se ainda não existir cobrança para o par `orderId` + `clinicId`, criar `TAXA_DEVIDA` com `weekKey` da data/hora da transição em `America/Bahia`.
- **Boleto semanal**: em `/admin/cobrancas`, ação “Emitir boletos da semana” para um `weekKey`. Agrupa cobranças `TAXA_DEVIDA` por `clinicId`, cria um boleto mock por clínica, move essas cobranças para `BOLETO_EMITIDO`.
- **Estorno**: permitido só em cobrança/boleto `BOLETO_EMITIDO` ou `LIQUIDADO`. O agendamento permanece `REALIZADO` ou `NAO_COMPARECEU`. Não existe estorno de R$ 5,00 ao paciente.
- **Comportamento em Erro / Exceção**:
  - Token inexistente ou inválido: Toast “Token não encontrado. Confira o código informado pelo paciente.”
  - Token válido sem itens desta clínica em `CONFIRMADO_CLINICA` nem `REALIZADO`: Toast “Este token não possui exames confirmados nesta clínica.”
  - Token já check-in nesta clínica: Toast “A presença deste pedido já foi registrada nesta clínica.” (sem duplicar cobrança)
  - Submissão de carrinho com declaração pendente: bloqueio e foco no modal de declaração
  - Tentativa de marcar estado faturável inválido na admin: Toast “Só é permitido cobrar taxa em Realizado ou Não compareceu.”
- **Feedback Visual**:
  - `SOLICITADO`: `bg-blue-50 text-blue-700 border-blue-200`
  - `CONFIRMADO_CLINICA`: `bg-amber-50 text-amber-700 border-amber-200`
  - `REALIZADO`: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - `NAO_COMPARECEU`: `bg-slate-100 text-slate-700 border-slate-300`
  - `CANCELADO`: `bg-red-50 text-red-700 border-red-200`
  - Cobrança `TAXA_DEVIDA` / `BOLETO_EMITIDO`: badge laranja `bg-orange-50 text-orange-700 border-orange-200` no financeiro (não no status do agendamento)
  - Cobrança `LIQUIDADO`: esmeralda; `ESTORNADO`: vermelho
  - Toast de confirmação de check-in: “Presença registrada. O pedido desta clínica está como realizado.”

---

## 5. Anti-Escopo (O que NÃO fazer nesta tarefa)
*Esta seção é a barreira contra alucinação de escopo.*
- [ ] **NÃO** criar endpoint ou backend Express real, gateway de boleto, webhook bancário ou cron de servidor.
- [ ] **NÃO** alterar rotas fora de `/paciente/inicio`, `/dashboard/agenda`, `/dashboard/financeiro`, `/admin/clinicas`, `/admin/cobrancas` e o registro em `src/App.jsx`.
- [ ] **NÃO** utilizar emojis na interface.
- [ ] **NÃO** criar novos arquivos de utilitários se já existirem equivalentes.
- [ ] **NÃO** implementar Google Auth, WhatsApp, e-mail transacional (SPEC-07 / EVOL-005).
- [ ] **NÃO** cobrar PIX de R$ 5,00 do paciente nem reintroduzir `PAGO` como status de agendamento.
- [ ] **NÃO** custodiar valor de serviço em conta da plataforma além do registro mock do modo `FATURAMENTO`.
- [ ] **NÃO** sobrescrever `docs/specs/TEMPLATE_SPEC.md` nem reabrir DoD da SPEC-06.
- [ ] **NÃO** alterar o wizard de credenciamento da SPEC-05 além de persistir `billingMode` e `billableStatuses` padrão nos cadastros existentes.

---

## 6. Critérios de Aceite Fechados (DoD - Definition of Done)
*O agente só conclui a tarefa se todos os itens abaixo forem verificados:*
- [ ] O componente renderiza corretamente sem erros no console.
- [ ] Todos os fluxos de sucesso e validação de erro funcionam interativamente.
- [ ] Linter roda 100% limpo (`npm run lint` ou `lint_applet`).
- [ ] Build da aplicação compila com sucesso (`compile_applet` ou `npm run build`).
- [ ] `APPOINTMENT_STATUS` contém somente `SOLICITADO`, `CONFIRMADO_CLINICA`, `REALIZADO`, `NAO_COMPARECEU` e `CANCELADO`.
- [ ] A primeira confirmação de um pedido gera um token de 6 caracteres visível em `/paciente/inicio`.
- [ ] Check-in por token na clínica A marca `REALIZADO` só nos itens da clínica A e cria cobrança de R$ 5,00 (modo `REPASSE`) para o par pedido-clínica.
- [ ] Pedido com duas clínicas gera duas cobranças de R$ 5,00 quando cada recorte é realizado; o token é o mesmo.
- [ ] Modo `FATURAMENTO` na admin produz boleto/cobrança com `servicesAmount + 5` (exemplo 255 + 5 = 260).
- [ ] Paciente com item `CONFIRMADO_CLINICA` sem check-in não envia novo carrinho até declarar presença por clínica pendente.
- [ ] `/admin/cobrancas` emite um boleto mock por clínica ao fechar a semana ISO informada.
- [ ] Estorno altera só cobrança/boleto; o agendamento permanece `REALIZADO` ou `NAO_COMPARECEU`.
- [ ] Copy da landing/paciente deixa de afirmar taxa PIX de R$ 5,00 paga pelo paciente (`PatientWelcomePage.jsx`, `TestimonialsCarousel.jsx`).
- [ ] Agenda da clínica não exibe ação “Registrar pagamento” ligada a `PAGO`.
- [ ] Zero emojis; `StatusBadge`, `StatCard`, `FormField` e `Toast` reutilizados.

---

## 7. Checklist do Gatekeeper (Auto-auditoria da IA antes de codificar)
A IA deve verificar este checklist. Se algum item for **NÃO**, ela deve perguntar antes:
1. *Os campos de entrada e seus tipos estão 100% claros?* (Sim)
2. *As mensagens de erro e estados vazios foram especificados?* (Sim)
3. *A fonte do mock e chaves de cache do TanStack Query foram informadas?* (Sim)
4. *O escopo está livre de termos vagos como "etc.", "fazer da melhor forma", "e outras opções"?* (Sim)

---

## 8. Fechamento de Ciclo & Rastreabilidade (Obrigatório ao Concluir)
*Ao passar com sucesso no linter e build, a IA DEVE executar os 3 passos de fechamento:*
- [ ] 1. Marcar todos os checkboxes de Critérios de Aceite (Seção 6) como `[x]`.
- [ ] 2. Alterar o cabeçalho desta spec para `Status: CONCLUÍDO` com a data atual.
- [ ] 3. Abrir o arquivo PRD vinculado (indicado no cabeçalho) e marcar o item correspondente como concluído `[x]`, atualizando também as tabelas de status do PRD.
