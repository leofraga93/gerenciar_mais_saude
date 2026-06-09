# Checklist - Portais Pós-Credenciamento (GerenciarSaúde)

Base de comparação: `docs/.cursorrulesIndexHomeClinicle` e fluxo de negócio B2B2C (clínica credencia → mantém cadastro → publica serviços → paciente compara e agenda).

**Escopo desta fase:** front-end visual + mock data. **Fora de escopo agora:** banco de dados, `fetch`/`axios` real, persistência de token. **Preparar desde já:** contratos de dados, `src/data/*.js`, `src/services/*.js`, hooks compatíveis com TanStack Query.

**Última revisão:** credenciamento completo (wizard, validações, UX senha, banner no dashboard).

---

## Visão do fluxo

```text
Landing (/) → Credenciamento (/cadastro-clinica) → Login clínica (mock) → Portal (/dashboard/*)
                                                      ↓
                                              Perfil + Serviços + Agenda + Financeiro
```

| Etapa | Objetivo | Status |
|--------|----------|--------|
| Credenciamento | Criar conta da empresa (dados mínimos + acesso). | **Concluído** (mock) |
| Login | Entrar no portal administrativo (`ROLE_CLINICA`). | **Mock** (landing; sem vínculo com senha cadastrada) |
| Perfil | Manter cadastro institucional, contato, financeiro e documentos. | **Pendente** |
| Operação | Agenda, métricas, máquina de estados nos agendamentos. | **Pendente** |
| Oferta | Catálogo de exames/procedimentos, preços e convênios. | **Pendente** |

---

## 1) O que já foi feito (Concluído)

### 1.1 Entrada e infraestrutura compartilhada

- [x] Hub de entrada único: Landing Page convertendo Clínicas e Pacientes (`src/pages/LandingPage.jsx`).
- [x] Roteamento em `src/App.jsx`: `/`, `/cadastro-clinica`, `/dashboard`, `/paciente/inicio`.
- [x] Identidade visual: `src/index.css` como referência de cores e estilos.
- [x] Modal de acesso com abas: **Acesso Clínica** vs **Acesso Paciente**.
- [x] Redirecionamento mock por perfil no submit: Clínica → `/dashboard`; Paciente → `/paciente/inicio`.
- [x] CTA na landing/modal: navegação para credenciamento (`navigate('/cadastro-clinica')`).

### 1.2 Área do paciente (ponte mobile) — parcialmente atendida na web

- [x] Página de boas-vindas (`src/pages/PatientWelcomePage.jsx`).
- [x] Seção **Baixe o app** com CTAs App Store e Google Play.
- [x] Bloqueio explícito de agendamento na web (mensagem: recurso só no app).
- [ ] Perfil read-only completo (Nome, CPF, Plano de Saúde) — hoje só e-mail vindo do `state` do login mock; demais campos aguardam API/mock.

### 1.3 Portal da clínica — esqueleto pós-credenciamento

- [x] Página em `/dashboard` (`src/pages/DashboardPage.jsx`) com header e área de conteúdo mock.
- [x] Nome da clínica no header após credenciamento (`getRegisteredClinic()` + `sessionStorage`).
- [x] Banner **“Complete seu perfil”** pós-credenciamento (dispensável com “Entendi”).
- [x] Link **Sair para a página inicial** (volta para `/`).
- [ ] Layout shell completo (sidebar, rotas aninhadas, avatar) — ver seção 3.
- [ ] Métricas, agenda, serviços e perfil editável — ver seções 3 e 4.

---

## 2) Credenciamento da clínica (`/cadastro-clinica`)

Wizard em 4 etapas para criar a conta da empresa **antes** do uso pleno do portal.

### 2.1 Implementação (código)

- [x] Rota `/cadastro-clinica` registrada em `src/App.jsx`.
- [x] Página `ClinicSignupPage.jsx` (wizard em 4 etapas com indicador de progresso).
- [x] Ao concluir (mock): redirecionar para `/dashboard` com banner **“Complete seu perfil”** (`location.state` + `sessionStorage`).
- [x] Validação visual dos campos obrigatórios (sem API) em `src/utils/clinicSignupValidation.js`.
- [x] Serviço mock `registerClinic()` em `src/services/clinicService.js` (Promise + `sessionStorage`).
- [x] Chave de sessão mock em `src/constants/clinicStorage.js`.
- [x] Leitura mock pós-cadastro: `getRegisteredClinic()` e `clearRegisteredClinic()` em `clinicService.js`.

> Mapa de arquivos: `App.jsx` (rota) → `ClinicSignupPage.jsx` (UI) → `clinicSignupValidation.js` (regras) → `clinicService.js` (mock persistência) → `DashboardPage.jsx` (nome + banner).

### 2.2 Campos — credenciamento inicial (mínimo para conta)

| Campo | Obrigatório | Status UI |
|--------|-------------|-----------|
| Razão social ou nome fantasia | Sim | [x] Etapa 1 |
| CNPJ | Sim | [x] Etapa 1 |
| E-mail administrativo (login) | Sim | [x] Etapa 2 |
| Senha + confirmação | Sim | [x] Etapa 2 |
| Nome do responsável / gestor | Sim | [x] Etapa 3 |
| Telefone / WhatsApp comercial | Sim | [x] Etapa 3 |
| Aceite termos de uso e privacidade | Sim | [x] Etapa 4 |
| Código de indicação / parceiro | Não | [x] Etapa 3 |

### 2.3 Validação e UX do wizard (evoluções concluídas)

- [x] Validação **por etapa** ao clicar **Continuar** (bloqueia avanço se houver erro).
- [x] Validação **por campo** ao sair do input (`onBlur`).
- [x] Revalidação do formulário inteiro ao **Concluir credenciamento** (volta à etapa com erro, se necessário).
- [x] Mensagem de etapa + borda vermelha + foco no primeiro campo inválido.
- [x] **Razão social:** 3–200 caracteres, deve conter letras.
- [x] **CNPJ:** 14 dígitos + algoritmo de dígitos verificadores (front-end; não consulta Receita).
- [x] **E-mail:** formato válido, máx. 254 caracteres.
- [x] **Senha:** mín. 8 caracteres, letras e números; confirmação obrigatória e igual à senha.
- [x] **Responsável:** nome completo (nome + sobrenome), apenas letras/espaços.
- [x] **Telefone:** DDD válido (lista BR), fixo (10 dígitos) ou celular (11 dígitos com 9 após DDD).
- [x] **Código de indicação:** opcional; se preenchido, 4–30 caracteres alfanuméricos + hífen.
- [x] Máscaras de digitação: CNPJ e telefone (`formatCnpj`, `formatPhone`).
- [x] Componente `PasswordInput`: **segurar** ícone de olho para revelar senha; soltar oculta novamente.
- [x] Formulário com `noValidate` (mensagens customizadas em português).
- [x] Resumo dos dados na etapa 4 antes do aceite dos termos.
- [ ] Páginas reais de termos de uso e política de privacidade (hoje só texto no checkbox).
- [ ] Login da landing validando e-mail/senha cadastrados no credenciamento (mock ainda independente).

---

## 3) Fase 1 — Fundação do portal da clínica (visual + mock)

Referência: `.cursorrulesIndexHomeClinicle` + itens pendentes abaixo.

### 3.1 Layout e navegação

- [ ] **Layout shell** (`ClinicShell`): sidebar fixa + top bar.
- [ ] Itens de menu: Dashboard (Home), Agenda, Meus Serviços, Financeiro, Perfil.
- [ ] Top bar completa: nome da clínica logada, **avatar**, logout.
- [ ] Rotas aninhadas: `/dashboard`, `/dashboard/agenda`, `/dashboard/servicos`, `/dashboard/financeiro`, `/dashboard/perfil`.
- [ ] Sidebar responsiva: menu hambúrguer em mobile/tablet.

> **Parcial hoje:** `DashboardPage` exibe nome da clínica e link de saída, sem sidebar nem rotas filhas.

### 3.2 Mock data e contratos

- [ ] Pasta `src/data/` com arquivos exportando objetos estáveis para futura API:
  - [ ] `clinicProfile.js` — perfil da clínica logada.
  - [ ] `appointments.js` — agendamentos.
  - [ ] `services.js` — catálogo de procedimentos.
  - [ ] `insurances.js` — convênios/planos mestre.
- [ ] Contrato documentado: `ClinicProfile`, `Service[]`, `Appointment[]`, `Insurance[]` (mesma forma no mock e na API futura).

> **Parcial hoje:** registro mínimo da clínica em `sessionStorage` via `registerClinic()` (não é `src/data/*.js`).

### 3.3 Componentização

- [ ] `Sidebar.jsx`, `ClinicTopBar.jsx`, `ClinicShell.jsx`.
- [ ] `StatCard.jsx` (métricas).
- [ ] `StatusBadge.jsx` (estados de agendamento).
- [ ] Componentes de formulário reutilizáveis extraídos (inputs, seções de perfil).

> **Parcial hoje:** `Field`, `PasswordInput`, `EyeIcon`/`EyeOffIcon` locais em `ClinicSignupPage.jsx` (não extraídos para pasta `components/`).

### 3.4 Ganchos para API (sem integração real)

- [x] `registerClinic()`, `getRegisteredClinic()`, `clearRegisteredClinic()` em `src/services/clinicService.js`.
- [ ] `getClinicProfile`, `updateClinicProfile`, `getAppointments`, `getServices`, etc. (mock via Promise).
- [ ] Hooks em `src/hooks/`: ex. `useClinicProfile`, `useAppointments`, `useServices`.
- [ ] Dependência e estrutura TanStack Query preparadas (`queryKey` + `queryFn` trocável).
- [ ] Contexto opcional `ClinicSessionContext` (clínica logada mock, `ROLE_CLINICA`).

### 3.5 Proteção de rotas (simulação visual)

- [ ] Acesso a `/dashboard/*` tratado como área exclusiva de clínica (guard mock por role).
- [ ] Paciente não deve ver fluxo de gestão de serviços/agenda administrativa.

---

## 4) Fase 2 — Portal da clínica (gestão e oferta)

### 4.1 Dashboard — visão geral (`/dashboard`)

- [ ] Cards de métricas: agendamentos do dia, solicitações pendentes, receita estimada.
- [ ] Lista de agendamentos recentes: Nome do Paciente, Exame, Horário Sugerido, Status.
- [ ] Dados consumidos de `src/data/appointments.js` via hooks.

### 4.2 Agenda (`/dashboard/agenda`)

- [ ] Listagem completa (tabela ou cards) com os mesmos campos da home.
- [ ] Filtros simples mock (status, data).
- [ ] Ações mock: confirmar, recusar, avançar status (sem persistência em banco).

### 4.3 Máquina de estados visual

Cores padronizadas (Tailwind / `index.css`):

| Status | Cor | Item |
|--------|-----|------|
| `SOLICITADO` | Azul (`blue-500`) | [ ] |
| `CONFIRMADO_CLINICA` | Amarelo (`yellow-500`) | [ ] |
| `PAGO` | Verde (`green-600`) | [ ] |
| `CANCELADO` | Vermelho (`red-500`) | [ ] |

Regras de UX (preparar lógica de negócio):

- [ ] Botão **Confirmar agendamento** só quando status = `SOLICITADO`.
- [ ] Botão **Registrar pagamento** (ou equivalente) só após `CONFIRMADO_CLINICA`.
- [ ] Feedback visual ao mudar status (badge, transição, toast).

### 4.4 Meus serviços (`/dashboard/servicos`)

- [ ] Listagem em cards: nome do exame, valor particular, badges de convênios aceitos.
- [ ] Modal **Novo serviço**: nome, descrição, categoria, valor particular, duração/preparo, ativo/inativo.
- [ ] Seleção múltipla de convênios por procedimento (lista mestre em `insurances.js`).
- [ ] Edição/inativação mock de serviço existente.

### 4.5 Financeiro (`/dashboard/financeiro`)

- [ ] Visão mock: resumo de receita estimada, histórico simplificado, destaque PIX.
- [ ] Sem integração bancária real nesta fase.

### 4.6 Perfil da clínica (`/dashboard/perfil`)

Formulário de manutenção do cadastro (edição local / mock). Agrupar em abas ou seções:

#### Identificação e localização

| Campo | Obrigatório | UI |
|--------|-------------|-----|
| Nome fantasia | Sim | [ ] |
| Razão social | Sim | [ ] |
| CNPJ (somente leitura após credenciamento) | Sim | [ ] |
| Inscrição estadual / municipal | Não | [ ] |
| Endereço completo (CEP, logradouro, número, complemento, bairro, cidade, UF) | Sim | [ ] |
| Ponto de referência | Não | [ ] |
| Telefones da recepção | Sim | [ ] |
| E-mail institucional | Sim | [ ] |
| Site / redes sociais | Não | [ ] |

#### Operação

| Campo | Obrigatório | UI |
|--------|-------------|-----|
| Especialidades / áreas de atuação | Sim | [ ] |
| Horário de funcionamento por dia | Sim | [ ] |
| Feriados / fechamentos excepcionais | Não | [ ] |
| Observações gerais / preparo padrão | Não | [ ] |

#### Marca

| Campo | Obrigatório | UI |
|--------|-------------|-----|
| Logo (upload mock) | Recomendado | [ ] |
| Descrição curta | Sim | [ ] |
| Descrição longa / diferenciais | Não | [ ] |

#### Responsáveis

| Campo | Obrigatório | UI |
|--------|-------------|-----|
| Gestor principal (nome, CPF, cargo, e-mail, telefone) | Sim | [ ] |
| Usuários adicionais do portal (futuro) | Não | [ ] |
| CRM / responsável técnico (se aplicável) | Conforme regra | [ ] |

#### Financeiro (perfil)

| Campo | Obrigatório | UI |
|--------|-------------|-----|
| Chave PIX + titular | Sim | [ ] |
| Dados bancários alternativos | Não | [ ] |
| Política de cancelamento / no-show | Recomendado | [ ] |
| Emissão de NF e dados fiscais extras | Não | [ ] |

#### Documentação (upload mock)

| Documento | Obrigatório | UI |
|-----------|-------------|-----|
| Contrato social / MEI | Sim | [ ] |
| Alvará / licença sanitária | Sim | [ ] |
| Comprovante de endereço | Não | [ ] |
| Certidões / homologação | Não | [ ] |

#### Catálogo — campos por procedimento (tela Serviços)

| Campo | Obrigatório | UI |
|--------|-------------|-----|
| Nome do exame/procedimento | Sim | [ ] |
| Código interno / TUSS | Não | [ ] |
| Categoria | Sim | [ ] |
| Descrição para o paciente | Sim | [ ] |
| Valor particular (R$) | Sim | [ ] |
| Duração / preparo | Recomendado | [ ] |
| Ativo / inativo | Sim | [ ] |
| Convênios aceitos no procedimento | Sim | [ ] |
| Regra de valor por convênio | Recomendado | [ ] |
| Observações comerciais | Não | [ ] |

#### Convênios — cadastro mestre

| Campo | Obrigatório | UI |
|--------|-------------|-----|
| Nome da operadora | Sim | [ ] |
| Código do prestador na operadora | Não | [ ] |
| Documento de credenciamento (upload mock) | Não | [ ] |

- [ ] Salvar perfil atualiza estado local/mock e reflete nome na top bar.
- [ ] Banner **“Cadastro incompleto”** quando faltar campos obrigatórios do perfil (além do banner pós-credenciamento já existente).

---

## 5) Dados gerados pela operação (não são “cadastro”, mas aparecem no portal)

| Dado | Origem | Onde exibir | Status |
|------|--------|-------------|--------|
| Agendamentos (paciente, exame, horário, status) | Plataforma / pacientes | Dashboard, Agenda | [ ] |
| Métricas derivadas | Cálculo sobre agendamentos mock | Cards da home | [ ] |
| Histórico de confirmações e pagamentos | Máquina de estados | Agenda + Financeiro | [ ] |

---

## 6) Área do paciente — complementos pendentes

Itens já parcialmente em `PatientWelcomePage.jsx`; marcar `[x]` só quando atender 100%.

- [x] Boas-vindas e mensagem de sucesso de acesso.
- [x] CTAs para lojas de aplicativo.
- [x] Aviso de que agendamento é exclusivo do app.
- [ ] Perfil read-only: Nome, CPF, Plano de Saúde (mock em `src/data/patientProfile.js`).
- [ ] Dados de perfil via hook/service mock (mesmo padrão da clínica).

---

## 7) Qualidade técnica e UX

### Credenciamento (concluído nesta fase)

- [x] Feedback de validação no wizard (alertas, bordas, hints, `aria-invalid`).
- [x] Responsividade do wizard (`sm:` no progresso e layout).
- [x] Aderência visual ao `src/index.css` / Tailwind no fluxo de credenciamento.

### Portal e operação (pendente)

- [ ] Responsividade do dashboard em tablet e desktop de recepção.
- [ ] Feedback de ação (toast ou mensagem) ao confirmar, recusar ou excluir itens mockados.
- [ ] Transições suaves ao alterar `StatusBadge`.
- [ ] Componentização alinhada às regras (extrair shell e formulários de `DashboardPage.jsx` / `ClinicSignupPage.jsx`).

---

## 8) Integração futura (registrar, não implementar agora)

Marcar aqui apenas quando existir código real de backend.

- [ ] Autenticação API (e-mail/senha, token, `role` do backend).
- [ ] Persistência de sessão e estados loading/erro/sucesso.
- [ ] CRUD de clínica, serviços e agendamentos no backend.
- [ ] Upload real de documentos.
- [ ] Consulta de CNPJ na API (hoje só validação algorítmica no front em `isValidCnpj`).
- [ ] Substituição de `sessionStorage` / `src/data/*.js` por endpoints sem mudar contratos dos hooks.

---

## 9) Critérios de pronto (validação com a clínica — fase visual)

- [x] Clínica **credencia** em `/cadastro-clinica` (fluxo completo mock com validações).
- [x] Clínica vê **nome** na barra superior após credenciamento (`tradeName` via `sessionStorage`).
- [ ] Clínica entra só pelo login da landing e vê nome real (depende de API ou vínculo mock login ↔ cadastro).
- [ ] Clínica **edita perfil** e vê dados refletidos na UI.
- [ ] Clínica **cadastra serviço** com valor particular e convênios.
- [ ] Clínica vê **agenda** com cores e botões coerentes com o status.
- [ ] Paciente **não** acessa rotas `/dashboard/*` de gestão (guard mock).

---

## 10) Mapa rápido de status (visão executiva)

| Área | Status atual |
|------|----------------|
| Landing + rotas base + modal por perfil | **Concluído** |
| Paciente: boas-vindas + app + bloqueio agendamento | **Concluído** (perfil completo pendente) |
| Credenciamento `/cadastro-clinica` | **Concluído** (wizard, validações, senha, mock `sessionStorage`) |
| Dashboard pós-credenciamento | **Parcial** (nome + banner; conteúdo operacional pendente) |
| Portal clínica (shell, mocks, métricas, agenda, serviços, perfil) | **Não iniciado** (além do placeholder) |
| Services / hooks / TanStack Query / guards | **Parcial** (`registerClinic` + leitura sessão) |
| API e banco | **Fora da fase atual** |

**Pendente crítico (próxima entrega):** Fase 1 (shell + `src/data/` + rotas aninhadas) → home com métricas e agenda → serviços e perfil completo (§4.6).

---

## 11) Rotina de uso deste checklist

1. Marcar `[x]` **somente** com evidência em código ou teste manual documentado.
2. Itens de tabela (campos de cadastro): marcar `[x]` na coluna **UI** quando o campo existir na interface (mesmo com mock).
3. Usar notas **“Parcial hoje”** quando só parte do item estiver implementada.
4. Ao concluir um item de portal, verificar segregação de role (clínica vs paciente).
5. **Foco visual:** não implementar `fetch` real; manter paridade com o produto final esperado pelo cliente.
6. Atualizar a seção **10** quando o mapa executivo mudar.

---

## 12) Referências cruzadas

- Landing e login: `docs/checklist-landing-page.md`
- Regras do portal: `docs/.cursorrulesIndexHomeClinicle`
- Rotas atuais: `src/App.jsx`
- Páginas: `ClinicSignupPage.jsx`, `DashboardPage.jsx`, `PatientWelcomePage.jsx`, `LandingPage.jsx`
- Credenciamento: `src/services/clinicService.js`, `src/utils/clinicSignupValidation.js`, `src/constants/clinicStorage.js`
