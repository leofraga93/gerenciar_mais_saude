# SPEC-09: Modelo de Cobrança ao Paciente, Máquinas de Estado e Fluxo do Portal do Paciente

- **Status**: CONCLUÍDO
- **Data de Início**: 2026-11-03
- **Última revisão**: 2026-11-18 (revisão de produto: taxa única de R$ 5,00 paga pelo paciente por `orderId`, acesso prioritário ao token/taxa e edição cadastral em `/paciente/inicio`)
- **Data de Conclusão**: 2026-11-18
- **Documento PRD de Referência**: `docs/prd/checklist-home-patiente.md` (Seção 2.4), `docs/prd/checklist-home-clinicle.md` (Seções 3 e 5) e `docs/prd/roadmap-evolucao.md` (EVOL-014, EVOL-015, EVOL-016, EVOL-017)
- **Substitui**: SPEC-08 (revogada integralmente) e ajustes financeiros da SPEC-07. Notificações por WhatsApp e Google Auth permanecem na SPEC-07 reduzida (EVOL-005).

> **Instrução para a IA/Agente:** Antes de iniciar a implementação, audite este documento contra o checklist da Seção 7. Se houver qualquer campo com `[A DEFINIR]` ou ambiguidade em regras críticas, **NÃO assuma nem implemente**. Questione o desenvolvedor pontualmente no chat.

---

## 0. Decisões de Negócio Consolidadas (ADR)

1. A clínica cadastra seus serviços e valores; o paciente compara, solicita o carrinho de exames e a clínica confirma a disponibilidade.
2. **Fluxo padrão (`PATIENT_FEE_ONLY`) — Taxa única por pedido paga pelo paciente**:
   - O paciente paga o valor dos exames/consultas **diretamente à clínica** (no atendimento presencial ou via guia do convênio).
   - A plataforma cobra do **paciente** uma **taxa única de agendamento de R$ 5,00 por pedido (`orderId`)**, com pagamento à vista (PIX mock na Fase A), independentemente de quantos exames ou clínicas componham o pedido.
   - A clínica **não é cobrada** por exame/agendamento e não recebe boletos semanais de taxa. Seu modelo comercial próprio (`SPEC-05`) é de **3 meses (90 dias) de uso gratuito ilimitado** após aprovação, com adesão posterior ao plano mensal de **R$ 99,00/mês** (e suspensão automática até regularização caso expire sem adesão).
3. **Ciclo Token x Pagamento da Taxa + Trava do Próximo Pedido**:
   - Ao enviar o pedido (`POST /orders`), os agendamentos nascem em `SOLICITADO` e o registro único `orderFee` nasce em `AGUARDANDO_CONFIRMACAO`.
   - Assim que **qualquer item do pedido é confirmado pela clínica (`CONFIRMADO_CLINICA`)**, o sistema gera o **token único de 6 caracteres por `orderId`** para o paciente apresentar presencialmente na clínica, e a `orderFee` transita para `PENDENTE_PAGAMENTO`.
   - O paciente pode pagar a taxa de R$ 5,00 no portal (`/paciente/inicio`) logo após a confirmação OU comparecer presencialmente com o token. Porém, enquanto existir qualquer pedido com `orderFee.status === 'PENDENTE_PAGAMENTO'`, o paciente fica **obrigatoriamente bloqueado de finalizar um novo pedido** até quitar a pendência.
4. **Incidência em Convênios**: A taxa única de R$ 5,00 incide sobre todo pedido confirmado (`orderId`), **independentemente do tipo de pagamento dos exames** (`PARTICULAR` ou `CONVENIO`).
5. **Fluxo opcional futuro (`FULL_AMOUNT` — Fase B, EVOL-017)**: O pagamento integral (soma dos serviços particulares + R$ 5,00) com repasse à clínica e estorno administrativo fica apenas modelado para a Fase B (fora desta entrega mock).
6. **Comparecimento e Divergência**: O paciente declara em `/paciente/inicio` se foi atendido **apenas enquanto o agendamento com data passada ainda estiver em `CONFIRMADO_CLINICA`**. Se a clínica já marcou `REALIZADO`, o paciente não é questionado. Divergências entre declaração e ação da clínica recebem `attendanceDispute: true` para revisão administrativa.
7. **Check-in e Conclusão em Duas Etapas**: Na recepção, o check-in por token (Passo 1) grava `checkedInAt` e `checkInMethod: 'TOKEN'` sem concluir automaticamente; a clínica aciona explicitamente **Marcar realizado** (Passo 2) para transitar a `REALIZADO`.
8. **Prova de Guichê (`MANUAL_REVERSAL`)**: O token não expira por tempo e **não é invalidado** em `NAO_COMPARECEU`. Se o paciente comparecer atrasado com o token, a clínica pode reverter `NAO_COMPARECEU` → `REALIZADO` com `checkInMethod: 'MANUAL_REVERSAL'` e `attendanceDispute: true`.
9. **Portal do Paciente (`/paciente/inicio`) — Fluxo Pós-Cadastro e Gestão**:
   - Substituir texto B2B ("Credenciamento Realizado com Sucesso") pela mensagem oficial B2C: *"Cadastro concluído com sucesso! Seja muito bem-vindo(a) à Gerenciar Mais Saúde!"*.
   - Disponibilizar no **topo da tela** acesso imediato aos tokens ativos e pendências de taxa R$ 5,00 com botão de quitação via PIX mock.
   - Disponibilizar CTA primário para buscar/agendar exames (`/?nicho=paciente#catalogo-paciente`) e ação **"Alterar cadastro"** para editar **telefone, e-mail e convênios** (mantendo **CPF, nome completo e data de nascimento** fixos).
   - Atualizar a seção lateral *"Sua Saúde no Bolso!"* com os 4 benefícios solicitados pelo cliente usando ícones `lucide-react` (**zero emojis**), mantendo claro que o agendamento já funciona pelo site (além do aplicativo futuro) e ajustando o grid de *"Dados do Paciente"* para eliminar área ociosa.
10. **Contrato de API (`docs/api/openapi.yaml`)**: Fonte da verdade da API futura (atualmente `v0.2.1` com endpoints `/patients/me` (`PUT`), `/patients/me/pending-fees`, `/orders/{orderId}/fee/pay`, `/admin/order-fees*` e bloqueio `409 FEE_PAYMENT_PENDING`). Mudanças contratuais começam sempre pelo YAML.

### Faseamento

- **Fase A (esta spec)**: máquinas de estado (`Appointment` + `orderFee`), token único por `orderId`, pagamento PIX mock da taxa no portal do paciente, trava de novo pedido por taxa/declaração pendente, confirmação do paciente, fluxo completo de `/paciente/inicio` (incluindo edição de cadastro e bloco lateral), check-in/conclusão na clínica e painel financeiro da clínica sem cobrança de taxa — tudo com **persistência mock (`localStorage` / `sessionStorage`)** e **TanStack Query**.
- **Fase B (EVOL-014, EVOL-015, EVOL-017 — fora desta spec)**: emissão real de Pix dinâmico (`txid`), webhooks bancários, gateway de pagamento, autenticação JWT e modo `FULL_AMOUNT` com repasse/estorno.

---

## 1. Contexto, Rota e Localização

- **Objetivo da Tarefa**: substituir o status legado `PAGO` por duas máquinas independentes (`Appointment` e `orderFee`), implementar token único por pedido com check-in em duas etapas na clínica, cobrança única de R$ 5,00 ao paciente com trava de inadimplência e completar o fluxo interativo do portal `/paciente/inicio`.
- **Rota(s) da Aplicação**:
  - `/` (visão Paciente / `ExamCartDrawer.jsx` — trava de novo pedido com taxa ou comparecimento pendente)
  - `/paciente/inicio` — banner de boas-vindas, card prioritário no topo de token ativo + quitação de taxa R$ 5,00, CTA de agendamento, edição cadastral (telefone, e-mail, convênios; CPF fixo), declaração de comparecimento, pedidos recentes e bloco lateral *"Sua Saúde no Bolso!"*
  - `/dashboard/agenda` — confirmar vaga, check-in por token (Passo 1), marcar realizado (Passo 2), não compareceu, cancelar e prova de guichê
  - `/dashboard/financeiro` — remoção do bloco de chave PIX e do status `PAGO`; 3 cards superiores na ordem **`3 → 2 → 1`** (*Receita pendente de validação* → *Receita confirmada* → *Exame realizado*); e **Gráfico de Progressão de Agendamento por Pagamento** filtrável por **Ano** e **Mês** (Realizados vs. Pendentes e Particular vs. Convênio)
  - `/admin/clinicas` — moderação de clínicas (`PENDENTE_APROVACAO_ADMIN`, `APROVADO`, `SUSPENSO`, `REJEITADO`) e visualização de divergências/taxas de pedidos se aplicável
- **Arquivo(s) Alvo**:
  - Novo: `src/constants/billingConstants.js`
  - Novo: `src/services/appointmentStateMachine.js` (funções puras de transição)
  - Novo: `src/services/orderFeeService.js` (persistência mock e máquina de `orderFee`)
  - Novo: `src/hooks/useOrderFees.js` (hooks TanStack Query para `orderFee`)
  - Novo: `src/components/patient/PatientTopPriorityBar.jsx` (token ativo + alerta/pagamento PIX mock da taxa no topo de `/paciente/inicio`)
  - Novo: `src/components/patient/PatientProfileEditModal.jsx` (edição de e-mail, telefone e convênios com CPF fixo)
  - Novo: `src/components/patient/AttendanceDeclarationModal.jsx`
  - Novo: `src/components/clinic/TokenCheckInForm.jsx`
  - Editado: `src/data/appointments.js`, `src/services/appointmentService.js`, `src/services/patientService.js`, `src/hooks/usePatientProfile.js`, `src/hooks/usePatientAppointments.js`
  - Editado: `src/pages/LandingPage.jsx`, `src/components/patient/ExamCartDrawer.jsx`
  - Editado: `src/pages/PatientWelcomePage.jsx`, `src/components/patient/PatientRecentOrdersCard.jsx`
  - Editado: `src/pages/clinic/ClinicAgendaPage.jsx`, `src/pages/clinic/ClinicDashboardPage.jsx`, `src/pages/clinic/ClinicFinancePage.jsx`
  - Editado: `src/components/clinic/StatusBadge.jsx`
  - Editado (copy): `src/components/landing/TestimonialsCarousel.jsx`
- **Perfil de Acesso (Role)**: `ROLE_USUARIO` (paciente), `ROLE_CLINICA` (agenda e financeiro), `ROLE_ADMIN` (auditoria administrativa mock)

---

## 2. Contrato de Dados & Persistência (Mock First)

- **Fonte de Dados Inicial**: `localStorage` e `sessionStorage` via serviços em `src/services/*.js`; fixtures padrão em `src/data/*.js`.
- **Query / Mutation Hooks**: `useAppointments`, `usePatientAppointments`, `usePatientProfile`, `useUpdatePatientProfile`, `usePatientOrderFees`, `usePayOrderFee`.
- **Query Keys**:
  - `['appointments']`
  - `['patient', 'appointments', patientId]`
  - `['patient', 'profile']`
  - `['patient', 'order-fees', patientId]`
  - `['landing', 'registered-profiles']`
- **Constante de taxa**: `PLATFORM_FEE_BRL = 5` em `src/constants/billingConstants.js`

### Agendamento (`Appointment` — Máquina 1)

```json
{
  "id": "string",
  "orderId": "string (ex.: ORD-2026-000101)",
  "patientId": "string",
  "patientName": "string",
  "clinicId": "string",
  "clinicName": "string",
  "examName": "string",
  "selectedDate": "YYYY-MM-DD",
  "selectedTimeSlot": "HH:mm",
  "selectedPeriod": "MANHA | TARDE | NOITE",
  "paymentType": "PARTICULAR | CONVENIO",
  "insuranceId": "string | null",
  "price": "number decimal (ex: 180.75; 0 quando CONVENIO)",
  "descriptionPrep": "string",
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

> **Token**: 6 caracteres do alfabeto `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (sem caracteres ambíguos `0/O, 1/I`). **Um token por `orderId`**: gerado na primeira transição de qualquer item do pedido para `CONFIRMADO_CLINICA` e copiado para todos os itens desse `orderId`, inclusive os ainda em `SOLICITADO` em outra clínica. Deve ser único entre pedidos não cancelados.

### Taxa Única do Pedido do Paciente (`OrderFee` — Máquina 2)

```json
{
  "id": "string",
  "orderId": "string",
  "patientId": "string",
  "feeAmount": 5.00,
  "status": "AGUARDANDO_CONFIRMACAO | PENDENTE_PAGAMENTO | PAGA | ISENTA",
  "paymentMethod": "PIX | null",
  "paidAt": "ISO-8601 | null",
  "waivedReason": "string | null",
  "createdAt": "ISO-8601"
}
```

> - Unidade única: **1 registro `orderFee` por `orderId`** (mesmo se o pedido contiver múltiplas clínicas ou múltiplos exames).
> - `feeAmount`: sempre `5.00`.
> - Incide normalmente em pedidos `CONVENIO` e `PARTICULAR`.

### Edição Cadastral do Paciente (`PatientProfileUpdate`)

```json
{
  "email": "string (RFC válido, máx. 254)",
  "phone": "string (DDD válido + 10 ou 11 dígitos)",
  "insuranceIds": ["string (IDs de src/data/insurances.js; fallback ['ins-particular'])"]
}
```

> - `cpf`, `fullName` e `birthDate` permanecem somente leitura na edição do paciente.

---

## 3. Reuso Mandatório de Componentes (DRY)

- [ ] `FormField.jsx` (campos e mensagens de erro acessíveis na edição cadastral e busca manual)
- [ ] `Toast.jsx` (mensagens flutuantes de sucesso/erro para transições, PIX mock e edição de perfil)
- [ ] `inputClassName` de `src/utils/formUtils.js`
- [ ] `FilterButtonGroup.jsx` (seleção múltipla de convênios na edição do cadastro do paciente)
- [ ] `StatusBadge.jsx` — atualizar `APPOINTMENT_STATUS_CONFIG` com os 5 estados oficiais + badges da `orderFee`
- [ ] `ClinicActionBanner.jsx` — banner de boas-vindas e alerta prioritário de token/taxa no topo de `/paciente/inicio`
- [ ] `StatCard.jsx` — 3 métricas do financeiro da clínica na ordem exata `3 → 2 → 1`: **Receita pendente de validação** (`CONFIRMADO_CLINICA`, particular), **Receita confirmada** (`REALIZADO`, particular + resumo convênio) e **Exame realizado** (quantidade `REALIZADO`)
- [ ] Gráfico analítico nativo em SVG/Tailwind (`ClinicFinancePage.jsx`, sem dependências extras no bundle) filtrável por **Ano** e **Mês** comparando **Realizados vs. Pendentes** e **Particular vs. Convênio**, com tipografia `tabular-nums`
- [ ] Ícones: exclusivamente `lucide-react` ou `@fortawesome/*` (**zero emojis**)
- [ ] Hooks TanStack Query para toda leitura e mutação

---

## 4. Máquinas de Estado & Regras de Interação

### 4.1 Máquina 1 — Agendamento

> O enum de status do agendamento é **o mesmo nas três pontas** (paciente, clínica e admin). Todos enxergam os mesmos rótulos; o que difere é **quem pode acionar cada transição** (`getAvailableActions(status, role)`).

| De | Ação | Para | Quem | Efeito na `orderFee` / Token |
|---|---|---|---|---|
| `SOLICITADO` | Confirmar vaga | `CONFIRMADO_CLINICA` | Clínica | Se for a 1ª confirmação do `orderId`, gera `checkInToken` único e move `orderFee` para `PENDENTE_PAGAMENTO` |
| `SOLICITADO` | Recusar / cancelar | `CANCELADO` | Clínica, paciente ou admin | Se **todos** os itens do `orderId` ficarem `CANCELADO` sem confirmação prévia, `orderFee` vai a `ISENTA` |
| `CONFIRMADO_CLINICA` | **Check-in por token** (Passo 1) | permanece `CONFIRMADO_CLINICA`, grava `checkedInAt`, habilita "Marcar realizado" | Clínica | Sem alteração |
| `CONFIRMADO_CLINICA` | **Marcar realizado** (Passo 2, após check-in) | `REALIZADO` | Clínica | Sem alteração (`orderFee` segue `PENDENTE_PAGAMENTO` ou `PAGA`) |
| `CONFIRMADO_CLINICA` | Marcar não compareceu | `NAO_COMPARECEU` | Clínica | Sem alteração |
| `CONFIRMADO_CLINICA` | Cancelar | `CANCELADO` | Clínica, paciente ou admin | Taxa já gerada permanece `PENDENTE_PAGAMENTO` (exceto isenção administrativa) |
| `NAO_COMPARECEU` | Apresentar token (prova de guichê) | `REALIZADO` | Clínica | Marca `checkInMethod: 'MANUAL_REVERSAL'` e `attendanceDispute: true` |

**Regras da Máquina 1:**
- `REALIZADO`, `NAO_COMPARECEU` e `CANCELADO` são **terminais** (exceto a reversão `NAO_COMPARECEU` → `REALIZADO` por token, exclusiva da clínica).
- `REALIZADO` **exige `checkedInAt` preenchido** (via token ou busca manual registrada como `checkInMethod: 'MANUAL'`).
- Toda regra de transição vive em funções puras (`getAvailableActions(status, role)`, `canTransition(from, to, role)`) em `appointmentStateMachine.js`.
- Transição inválida **lança erro** em `updateAppointmentStatus` e exibe `Toast` em português.
- Check-in da clínica A **nunca** altera itens da clínica B no mesmo pedido.

**Transições proibidas (nunca implementar):**
- Qualquer destino `PAGO`, `PENDENCIA_PAGAMENTO`, `FINALIZADO`, `AGUARDANDO_PAGAMENTO`, `ESTORNO_SOLICITADO` ou `ESTORNADO` no agendamento.
- `SOLICITADO` → `REALIZADO` ou `NAO_COMPARECEU` sem passar por `CONFIRMADO_CLINICA`.
- `REALIZADO` sem `checkedInAt` preenchido.

### 4.2 Máquina 2 — Taxa Única do Pedido do Paciente (`orderFee`)

| De | Evento | Para | Quem |
|---|---|---|---|
| (criação) | Paciente envia pedido (`POST /orders`) | `AGUARDANDO_CONFIRMACAO` | Sistema |
| `AGUARDANDO_CONFIRMACAO` | Primeiro item do `orderId` é confirmado pela clínica | `PENDENTE_PAGAMENTO` | Sistema (gatilho na clínica) |
| `AGUARDANDO_CONFIRMACAO` | Todos os itens do `orderId` são cancelados antes de qualquer confirmação | `ISENTA` | Sistema |
| `PENDENTE_PAGAMENTO` | Paciente realiza pagamento à vista (PIX mock) no portal | `PAGA` | Paciente |
| `PENDENTE_PAGAMENTO` | Isenção excepcional administrativa | `ISENTA` | Admin (com `reason`) |

**Regra crítica de trava de novo pedido:**
- Antes de concluir qualquer novo pedido na Landing (`ExamCartDrawer.jsx` / `LandingPage.jsx`), o sistema verifica:
  1. Se existe qualquer `orderFee` do paciente com `status === 'PENDENTE_PAGAMENTO'`. Se existir, **bloqueia o envio**, exibe alerta claro com o número do pedido e oferece atalho direto para `/paciente/inicio` quitar a taxa de R$ 5,00.
  2. Se existe agendamento com data passada em `CONFIRMADO_CLINICA` sem `patientAttendance`. Se existir, bloqueia o envio e orienta a declaração no portal do paciente.

### 4.3 Token de check-in

- **Um token por `orderId`** (pedido inteiro), gerado na primeira transição de qualquer item do pedido para `CONFIRMADO_CLINICA` e visível no **topo de `/paciente/inicio`** e no histórico de pedidos do paciente.
- **6 caracteres** do alfabeto `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (sem `0/O, 1/I`).
- **Sem validade por tempo**. Invalidado na clínica apenas quando o grupo daquela clínica fica `REALIZADO` ou `CANCELADO` (mantido ativo em `NAO_COMPARECEU` para prova de guichê).
- Na recepção da clínica, informar o token exibe apenas os itens **daquela clínica** (paciente, exame, preço particular/convênio, preparo e horário).
- Bloquear após **5 falhas consecutivas** de token incorreto no formulário.

### 4.4 Comportamento em Erro / Exceção

| Situação | Mensagem (Toast / Alerta) |
|---|---|
| Novo pedido com taxa R$ 5,00 pendente | *"Você possui uma taxa de agendamento de R$ 5,00 em aberto (pedido [orderId]). Quite o pagamento no seu portal antes de solicitar um novo pedido."* |
| Novo pedido com declaração pendente | *"Informe se você compareceu aos exames confirmados antes de solicitar novos agendamentos."* |
| Quitação PIX mock com sucesso | *"Pagamento da taxa de R$ 5,00 confirmado! Seu histórico foi atualizado e novos agendamentos estão liberados."* |
| Edição cadastral do paciente salva | *"Dados cadastrais atualizados com sucesso!"* |
| Token inexistente, inválido ou sem itens da clínica | *"Token não encontrado. Confira o código informado pelo paciente."* |
| Token já utilizado nesta clínica | *"A presença deste pedido já foi registrada nesta clínica."* |
| Check-in bem-sucedido (Passo 1) | *"Chegada registrada. Clique em 'Marcar realizado' para encerrar o atendimento."* |
| Marcar realizado sem check-in prévio | *"É necessário registrar a chegada pelo token antes de marcar como realizado."* |
| Reversão por prova de guichê | *"Prova de guichê registrada. O agendamento voltou para Realizado e foi sinalizado para revisão administrativa."* |
| Transição inválida de agendamento | Toast de erro em português; estado inalterado |

### 4.5 Feedback Visual (Tailwind)

**Badges de agendamento via `StatusBadge`:**
- `SOLICITADO`: `bg-blue-50 text-blue-700 border-blue-200`
- `CONFIRMADO_CLINICA`: `bg-amber-50 text-amber-700 border-amber-200`
- `REALIZADO`: `bg-emerald-50 text-emerald-700 border-emerald-200`
- `NAO_COMPARECEU`: `bg-slate-100 text-slate-700 border-slate-300`
- `CANCELADO`: `bg-red-50 text-red-700 border-red-200`

**Badges da Taxa do Pedido (`orderFee`):**
- `AGUARDANDO_CONFIRMACAO`: `bg-slate-100 text-slate-600 border-slate-200`
- `PENDENTE_PAGAMENTO`: `bg-amber-50 text-amber-800 border-amber-200`
- `PAGA`: `bg-emerald-50 text-emerald-700 border-emerald-200`
- `ISENTA`: `bg-slate-100 text-slate-500 border-slate-200`

---

## 5. Anti-Escopo

- [ ] **NÃO** criar backend, endpoint real, gateway de pagamento ou webhook bancário.
- [ ] **NÃO** implementar o modo `FULL_AMOUNT`, repasse ou estorno bancário nesta Fase A.
- [ ] **NÃO** manter `PAGO`, `PENDENCIA_PAGAMENTO`, `FINALIZADO`, `AGUARDANDO_PAGAMENTO` ou `ESTORNO_SOLICITADO` no enum `APPOINTMENT_STATUS`.
- [ ] **NÃO** cobrar taxa da plataforma às clínicas nem emitir boletos semanais para clínicas.
- [ ] **NÃO** permitir que o paciente edite CPF, nome completo ou data de nascimento em "Alterar cadastro".
- [ ] **NÃO** utilizar emojis na interface (substituir integralmente por ícones `lucide-react` ou `@fortawesome/*`).
- [ ] **NÃO** utilizar eyebrows decorativos acima de títulos.
- [ ] **NÃO** implementar Google Auth, WhatsApp ou chatbot/mascote IA (pertencem à SPEC-07 / EVOL-005 / EVOL-018).
- [ ] **NÃO** sobrescrever `docs/specs/TEMPLATE_SPEC.md` nem adicionar frameworks de teste automatizado.

---

## 6. Critérios de Aceite Fechados (DoD)

- [x] `appointmentStateMachine.js` define exclusivamente `SOLICITADO`, `CONFIRMADO_CLINICA`, `REALIZADO`, `NAO_COMPARECEU` e `CANCELADO`, lançando erro em transição inválida.
- [x] `orderFeeService.js` cria uma `orderFee` única de `5.00` por `orderId` em `AGUARDANDO_CONFIRMACAO` no envio do carrinho.
- [x] A primeira confirmação da clínica em um pedido gera o `checkInToken` de 6 caracteres para todo o `orderId` e move `orderFee` para `PENDENTE_PAGAMENTO`.
- [x] Check-in por token na clínica grava `checkedInAt` (Passo 1) sem concluir automaticamente; "Marcar realizado" (Passo 2) exige `checkedInAt`.
- [x] `NAO_COMPARECEU` → `REALIZADO` só ocorre por token (`MANUAL_REVERSAL` + `attendanceDispute: true`).
- [x] Novo pedido no carrinho é bloqueado (`FEE_PAYMENT_PENDING`) enquanto houver `orderFee === 'PENDENTE_PAGAMENTO'`, direcionando o paciente a `/paciente/inicio`.
- [x] `/paciente/inicio` exibe o banner de sucesso *"Cadastro concluído com sucesso! Seja muito bem-vindo(a) à Gerenciar Mais Saúde!"* (sem rótulo B2B "Credenciamento"), CTA para buscar/agendar exames e ação **"Alterar cadastro"**.
- [x] `/paciente/inicio` exibe no topo os tokens ativos e pendências de taxa de R$ 5,00 com botão funcional de quitação via PIX mock.
- [x] Modal/fluxo **"Alterar cadastro"** permite editar telefone, e-mail e convênios mantendo CPF, nome e data de nascimento fixos, persistindo na sessão e cache do TanStack Query.
- [x] Bloco *"Sua Saúde no Bolso!"* atualizado com os 4 benefícios solicitados (incluindo taxa de R$ 5,00), ícones vetoriais (zero emojis) e layout equilibrado sem espaço vazio abaixo de *"Dados do Paciente"*.
- [x] `/dashboard/financeiro` exibe os 3 `StatCard` na ordem **`3 → 2 → 1`** (**Receita pendente de validação** → **Receita confirmada** → **Exame realizado**), gráfico interativo filtrável por **Ano** e **Mês** (Realizados vs. Pendentes e Particular vs. Convênio), sem status `PAGO`, sem bloco de chave PIX da clínica e sem cobrança por exame contra a clínica.
- [x] Zero emojis e zero eyebrows decorativos; reutilização estrita de `FormField`, `Toast`, `FilterButtonGroup`, `StatusBadge`, `StatCard` e `ClinicActionBanner`.
- [x] `lint_applet` e `compile_applet` passam 100% sem erros.

---

## 7. Checklist do Gatekeeper (Auto-auditoria da IA antes de codificar)

1. *Os campos de entrada e seus tipos estão 100% claros?* **SIM** — Seção 2 e `docs/api/openapi.yaml`.
2. *As mensagens de erro e estados vazios foram especificados?* **SIM** — Seção 4.4.
3. *A fonte do mock e chaves de cache do TanStack Query foram informadas?* **SIM** — Seção 2.
4. *O escopo está livre de termos vagos?* **SIM** — todas as regras e textos aprovados estão explícitos.

---

## 8. Fechamento de Ciclo & Rastreabilidade (Obrigatório ao Concluir)

- [x] 1. Marcar todos os checkboxes de Critérios de Aceite (Seção 6) como `[x]`.
- [x] 2. Alterar o cabeçalho desta spec para `Status: CONCLUÍDO` com a data atual.
- [x] 3. Sincronizar `docs/prd/checklist-home-patiente.md`, `docs/prd/checklist-home-clinicle.md` e `docs/prd/roadmap-evolucao.md`.
- [x] 4. Confirmar aderência de `docs/api/openapi.yaml` e `AGENTS.md`.
