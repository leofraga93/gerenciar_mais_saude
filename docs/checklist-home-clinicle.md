# Checklist - Portais Pós-Credenciamento (GerenciarSaúde)

Base de comparação: `docs/.cursorrulesIndexHomeClinicle` e fluxo de negócio B2B2C (clínica credencia → mantém cadastro → publica serviços → paciente compara e agenda).

**Escopo desta fase:** front-end visual + mock data. **Fora de escopo agora:** banco de dados, `fetch`/`axios` real, persistência de token. **Preparar desde já:** contratos de dados, `src/data/*.js`, `src/services/*.js`, hooks compatíveis com TanStack Query.

**Última revisão:** §4.4 CRUD Meus Serviços + suporte a fotos de procedimentos + catálogo mestre (25 exames/consultas de Lauro de Freitas); §4.6 Perfil da Clínica com Vitrine e Galeria de Fotos (estilo TotalPass).

**Fase atual:** Catálogo de Serviços (§4.4) e Perfil Visual (§4.6) concluídos. **Próxima entrega:** Agenda Operacional (§4.2) + Máquina de Estados de Agendamento (§4.3) → Financeiro com PIX (§4.5).

---

## Visão do fluxo

```text
Landing (/) → Credenciamento (/cadastro-clinica) → Login clínica (mock) → Portal (/dashboard/*)
         [x]                              [x]                    [mock]              [x shell]
                                                      ↓
                              Perfil [x] + Serviços [x] + Agenda [próximo] + Financeiro [próximo]
```

| Etapa | Objetivo | Status |
|--------|----------|--------|
| Credenciamento | Criar conta da empresa (dados mínimos + acesso). | **Concluído** (mock) |
| Login | Entrar no portal administrativo (`ROLE_CLINICA`). | **Mock** (landing; sem vínculo com senha cadastrada) |
| **Fundação do portal** | Shell, rotas aninhadas, top bar, sidebar responsiva. | **Concluído** (§3.1) |
| **Catálogo / oferta** | Clínica publica exames e consultas (B2B2C + fotos). | **Concluído** (§3.2 + §4.4) |
| **Perfil & Vitrine** | Fotos da clínica estilo TotalPass + dados cadastrais. | **Concluído** (§4.6) |
| Operação | Agenda, métricas, máquina de estados. | **Próximo** (§4.1–4.3) |

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

### 1.3 Portal da clínica — ClinicShell (§3.1)

- [x] Layout **`ClinicShell`** envolvendo `/dashboard/*` (`src/components/clinic/ClinicShell.jsx`).
- [x] Nome fantasia no top bar (`getRegisteredClinic()` + `sessionStorage`).
- [x] Avatar placeholder (iniciais da clínica) em `ClinicTopBar.jsx`.
- [x] Botão **Sair** com `clearRegisteredClinic()` + redirecionamento para `/`.
- [x] Banner **“Complete seu perfil”** na home (`ClinicDashboardPage.jsx`).
- [x] Rotas aninhadas: home, agenda, serviços, financeiro, perfil.
- [ ] Métricas, agenda operacional, CRUD de serviços e perfil editável — ver §4.

---

## 2) Credenciamento da clínica (`/cadastro-clinica`) — CONCLUÍDO

Wizard em 4 etapas para criar a conta da empresa **antes** do uso pleno do portal.

### 2.1 Implementação (código)

- [x] Rota `/cadastro-clinica` registrada em `src/App.jsx`.
- [x] Página `ClinicSignupPage.jsx` (wizard em 4 etapas com indicador de progresso).
- [x] Ao concluir (mock): redirecionar para `/dashboard` com banner **“Complete seu perfil”** (`location.state` + `sessionStorage`).
- [x] Validação visual dos campos obrigatórios (sem API) em `src/utils/clinicSignupValidation.js`.
- [x] Serviço mock `registerClinic()` em `src/services/clinicService.js` (Promise + `sessionStorage`).
- [x] Chave de sessão mock em `src/constants/clinicStorage.js`.
- [x] Leitura mock pós-cadastro: `getRegisteredClinic()` e `clearRegisteredClinic()` em `clinicService.js`.

> Mapa de arquivos: `App.jsx` (rotas aninhadas) → `ClinicShell` → páginas em `pages/clinic/*` → `clinicService.js` (sessão).

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

### 2.3 Validação e UX do wizard

- [x] Validação por etapa, por campo (`onBlur`) e revalidação global ao concluir.
- [x] CNPJ com dígitos verificadores; telefone BR; senha com letras e números.
- [x] `PasswordInput`: segurar ícone de olho para revelar senha.
- [ ] Páginas reais de termos de uso e política de privacidade.
- [ ] Login da landing validando e-mail/senha cadastrados no credenciamento.

---

## 3) Operação — Fundação do Portal (Layout & Navegação)

Esta etapa garante ambiente de trabalho **profissional e responsivo** para a clínica operar após o credenciamento. Referência: `.cursorrulesIndexHomeClinicle` §2.A.

### 3.1 ClinicShell e navegação — CONCLUÍDO

- [x] **`ClinicShell`**: componente pai em `/dashboard/*` com Sidebar + Top Bar + `<Outlet />`.
- [x] **Sidebar fixa (desktop):** Dashboard, Agenda, Meus Serviços, Financeiro, Perfil (`Sidebar.jsx` + `clinicNav.js`).
- [x] **Sidebar responsiva (mobile/tablet):** menu hambúrguer + drawer com overlay.
- [x] **Top bar operacional** (`ClinicTopBar.jsx`):
- [x] Nome fantasia da clínica (`sessionStorage` / `getRegisteredClinic()`).
- [x] Avatar placeholder (iniciais em círculo esmeralda).
- [x] Botão **Sair** com `clearRegisteredClinic()` + redirecionamento para `/`.
- [x] **Rotas aninhadas** em `App.jsx`:
- [x] `/dashboard` — `ClinicDashboardPage.jsx`
- [x] `/dashboard/agenda` — `ClinicAgendaPage.jsx`
- [x] `/dashboard/servicos` — `ClinicServicesPage.jsx` (preview categorias/convênios)
- [x] `/dashboard/financeiro` — `ClinicFinancePage.jsx`
- [x] `/dashboard/perfil` — `ClinicProfilePage.jsx`

### 3.2 Estrutura de dados e contratos (mocks)

Antes da UI de serviços, definir contratos estáveis para a futura API (mesma forma no mock e nos endpoints).

- [x] Pasta `src/data/` criada.
- [x] **`src/data/services.js`** — mock de serviços da clínica:
- [x] Campos alinhados à arquitetura: `id`, `name`, `category`, `tussCode`, `privatePrice`, `insuranceIds[]`, `descriptionPrep`, `durationMinutes`, `active`, `photoUrl`.
- [x] **`src/data/insurances.js`** — lista mestre (Bradesco, Unimed, Cassi, etc.) com `id` + `name`.
- [x] **`src/constants/catalogConstants.js`** — categorias (Laboratório, Imagem, Cardiologia, Consulta, Outros) + `SERVICE_FIELD_KEYS`.
- [x] **`src/data/clinicProfileData.js`** — perfil estendido (dados cadastrais, galeria de fotos, horários de funcionamento).
- [ ] **`src/data/appointments.js`** — agendamentos mock (para dashboard/agenda).
- [x] Contrato tipado/documentado: `Service`, `Insurance`, `ClinicProfile`.
- [x] **`useServices` hook** em `src/hooks/useServices.js`:
- [x] Estrutura compatível com TanStack Query (`queryKey`, `queryFn`, mutations com optimistic update e invalidação de cache).
- [x] Consumo inicial de `src/data/services.js` (sem API).
- [x] Serviços em `clinicService.js`: `getServices`, `saveService`, `deleteService`, `getClinicProfile`, `updateClinicProfile` (Promise + mock local).

> **Insight (migração API):** no banco, a tabela `convenio_servico` fará o relacionamento **N:N** entre serviços e convênios. Na UI, o campo de convênios no modal deve ser **multi-select dinâmico** (IDs de `insurances.js`), nunca texto livre — facilita substituir o mock por API sem refatorar formulários.

### 3.3 Componentização do portal

- [x] `ClinicShell.jsx`, `Sidebar.jsx`, `ClinicTopBar.jsx` em `src/components/clinic/`.
- [x] `ClinicActionBanner.jsx` (banner padronizado de ação recomendada, onboarding e alertas da clínica).
- [x] `ServiceCard.jsx` e `ServiceFormModal.jsx` (cards do catálogo e modal completo de cadastro/edição com upload de foto).
- [x] `ClinicScheduleEditor.jsx` (editor alinhado de dias e horários de funcionamento).
- [ ] `StatCard.jsx` (métricas da home).
- [ ] `StatusBadge.jsx` (estados de agendamento).
- [x] Componentes reutilizáveis de formulário e feedback (`FormField.jsx`, `Toast.jsx`, `Icons.jsx`).

### 3.4 Ganchos para API (sem integração real)

- [x] `registerClinic()`, `getRegisteredClinic()`, `clearRegisteredClinic()` em `clinicService.js`.
- [x] `getClinicProfile()`, `updateClinicProfile()`, `getServices()`, `saveService()`, `deleteService()` (mock via Promise + sessionStorage).
- [ ] `getAppointments()` (mock via Promise para agenda e dashboard).
- [x] Dependência `@tanstack/react-query` + provider em `main.jsx`.
- [ ] Contexto opcional `ClinicSessionContext` (`ROLE_CLINICA` mock).

### 3.5 Proteção de rotas (simulação visual)

- [ ] Guard mock: `/dashboard/*` exclusivo de clínica.
- [ ] Paciente não acessa gestão de serviços/agenda administrativa.

---

## 4) Operação — Portal da clínica (gestão, catálogo e perfil)

### 4.1 Dashboard — visão geral (`/dashboard`)

- [ ] Cards de métricas: agendamentos do dia, solicitações pendentes, receita estimada.
- [ ] Lista de agendamentos recentes: Nome do Paciente, Exame, Horário Sugerido, Status.
- [ ] Dados de `src/data/appointments.js` via hook.

### 4.2 Agenda (`/dashboard/agenda`)

- [ ] Listagem completa (tabela ou cards).
- [ ] Filtros mock (status, data).
- [ ] Ações mock: confirmar, recusar, avançar status.

### 4.3 Máquina de estados visual (agendamentos)

| Status | Cor | Item |
|--------|-----|------|
| `SOLICITADO` | Azul (`blue-500`) | [ ] |
| `CONFIRMADO_CLINICA` | Amarelo (`yellow-500`) | [ ] |
| `PAGO` | Verde (`green-600`) | [ ] |
| `CANCELADO` | Vermelho (`red-500`) | [ ] |

- [ ] Botão **Confirmar agendamento** só quando status = `SOLICITADO`.
- [ ] Botão **Registrar pagamento** só após `CONFIRMADO_CLINICA`.
- [ ] Feedback visual ao mudar status (badge, transição, toast).

---

### 4.4 Meus Serviços (`/dashboard/servicos`) — vitrine B2B2C — CONCLUÍDO

Tela onde a clínica **oferta** exames e consultas para pacientes no app com catálogo completo e suporte a fotos de procedimentos.

#### 4.4.1 Visualização (lista / cards)

- [x] Listagem: cards com **Foto do Procedimento/Equipamento**, **Nome do exame**, **Valor Particular (R$)** e **badges dos convênios** aceitos.
- [x] Badge **Ativo / Inativo** por serviço no catálogo com toggle dinâmico de status.
- [x] Ações rápidas: **Editar**, **Inativar/Ativar** e **Remover** com confirmação e toasts de feedback.
- [x] Botão **Novo serviço** abrindo modal/formulário com foco automático.
- [x] Dados via `useServices` integrado a `@tanstack/react-query` (mock → API futura).
- [x] Banner padronizado de boas-vindas pós-credenciamento e alerta inteligente de fotos pendentes (`ClinicActionBanner.jsx`).

#### 4.4.2 Cadastro e edição (modal / formulário)

| Campo | Obrigatório | UI | Notas |
|--------|-------------|-----|-------|
| Nome do procedimento | Sim | [x] | Ex.: "Ressonância Magnética com Contraste" |
| Código TUSS | Não | [x] | Padrão de procedimentos médicos (6 a 8 dígitos) |
| Categoria | Sim | [x] | Select categorizado (Laboratório, Imagem, Cardiologia, Consulta, Outros) |
| Foto do Procedimento / Equipamento | Não | [x] | Upload direto com conversão Base64 e preview instantâneo |
| Descrição para o paciente | Sim | [x] | Orientações de preparo (ex.: jejum) |
| Valor particular (R$) | Sim | [x] | Base sem convênio com formatação BRL |
| Duração estimada | Recomendado | [x] | Tempo em minutos |
| Ativo / inativo | Sim | [x] | Toggle de visibilidade no catálogo |
| Convênios aceitos | Sim | [x] | **Multi-select** de `insurances.js` (IDs) |
| Regra de valor por convênio | Recomendado | [x] | Coparticipação ou tabela |
| Observações comerciais | Não | [x] | Promoções, pacotes |

**Gestão de convênios (regra de negócio):**

- [x] Multi-select dinâmico (não campo de texto).
- [x] Serviço só aparece para pacientes cujo plano está entre os convênios selecionados (documentar no mock; filtro real no app futuro).
- [x] Persistência mock do vínculo N:N (`insuranceIds[]` no serviço ↔ futuro `convenio_servico`).

#### 4.4.3 UX específica de serviços

- [x] Toast ou mensagem de sucesso ao salvar serviço no mock.
- [x] Validação sênior: borda vermelha, mensagens em português, `onBlur` + bloqueio de submit.
- [x] Botões e inputs com cores de `index.css` (esmeralda para ações primárias).
- [x] Exibição de foto do procedimento/equipamento no `ServiceCard.jsx`.

---

### 4.5 Financeiro (`/dashboard/financeiro`)

- [ ] Resumo mock: receita estimada, histórico simplificado, destaque PIX.
- [ ] Sem integração bancária real nesta fase.

### 4.6 Perfil da clínica & Vitrine de Fotos (`/dashboard/perfil`) — CONCLUÍDO

Manutenção cadastral completa e vitrine visual estilo TotalPass / Google Meu Negócio:

#### Vitrine e Galeria de Fotos do Estabelecimento

- [x] Upload de fotos da clínica por arquivo local (conversão Base64 com preview instantâneo e persistência local).
- [x] Categorização de fotos: **Fachada e Entrada**, **Recepção e Espera**, **Consultórios**, **Salas de Exames/Tecnologia** e **Estrutura**.
- [x] Definição de **Foto de Capa Principal** (Fachada destacada para os pacientes).
- [x] Visualizador de fotos em tela cheia (Zoom modal) e remoção rápida de fotos.
- [x] Bloco de **Pré-visualização do Card da Clínica** (exatamente como o paciente verá na busca).
- [x] Edição de dados cadastrais: Nome Fantasia, CNPJ, Telefones/WhatsApp, Endereço estruturado, Horário de Atendimento e Descrição.
- [x] Banner padronizado de ação recomendada (`ClinicActionBanner.jsx`) alertando sobre ausência de fotos, capa não definida ou endereço pendente.

---

## 5) Dados gerados pela operação

| Dado | Origem | Onde exibir | Status |
|------|--------|-------------|--------|
| Agendamentos | Plataforma / pacientes | Dashboard, Agenda | [ ] |
| Métricas derivadas | Cálculo sobre agendamentos mock | Cards da home | [ ] |
| Histórico confirmações / pagamentos | Máquina de estados | Agenda + Financeiro | [ ] |
| Catálogo publicado | Clínica em Meus Serviços | App paciente (futuro) | [x] |

---

## 6) Área do paciente — complementos pendentes

- [x] Boas-vindas, CTAs app, bloqueio de agendamento web.
- [ ] Perfil read-only: Nome, CPF, Plano de Saúde (`src/data/patientProfile.js`).
- [ ] Hook/service mock de perfil paciente.

---

## 7) Qualidade técnica e UX

### Credenciamento — concluído

- [x] Validação, responsividade, aderência visual (`index.css` / Tailwind).
- [x] Autofoco e navegação por teclado otimizada (acessibilidade e transição rápida).

### Portal, catálogo e operação

- [x] Toast de feedback ao salvar/editar/remover/inativar serviço mock (`Toast.jsx`).
- [x] Padrão de validação e layout limpo nos formulários de serviço e perfil.
- [x] Componentização: extração de `ClinicActionBanner.jsx`, `ServiceCard.jsx`, `ServiceFormModal.jsx` e `ClinicScheduleEditor.jsx`.
- [ ] Responsividade do dashboard completo (cards de métricas e tabela de agendamentos).
- [ ] Feedback ao confirmar/recusar agendamentos (toast + transição em `StatusBadge`).

---

## 8) Integração futura (não implementar agora)

- [ ] Autenticação API (token, `role`).
- [ ] CRUD backend: clínica, serviços, agendamentos.
- [ ] Tabela **`convenio_servico`** (N:N) substituindo `insuranceIds[]` no mock.
- [ ] Upload real de documentos; consulta CNPJ na API.
- [ ] Substituir `sessionStorage` / `src/data/*.js` por endpoints mantendo contratos dos hooks.

---

## 9) Critérios de pronto (validação com a clínica)

### Credenciamento

- [x] Fluxo completo em `/cadastro-clinica` com validações e foco automático.
- [x] Nome fantasia visível após credenciamento.

### Operação e catálogo

- [x] Clínica navega pelo **ClinicShell** (5 itens de menu + rotas aninhadas).
- [x] Logout limpa sessão mock e volta à home (`clearRegisteredClinic()`).
- [x] Clínica **cadastra serviço** com valor particular, upload de foto e multi-select de convênios.
- [x] Clínica **edita / inativa / remove** serviço no mock.
- [x] Clínica **edita perfil** completo com galeria de fotos, foto de capa e horários (§4.6).
- [ ] Clínica vê **agenda** com máquina de estados coerente (§4.2 e §4.3).
- [ ] Paciente não acessa `/dashboard/*` (guard mock).

---

## 10) Mapa rápido de status (visão executiva)

| Área | Status |
|------|--------|
| Landing + rotas base + modal por perfil | **Concluído** |
| Credenciamento `/cadastro-clinica` | **Concluído** |
| Paciente: boas-vindas + app | **Concluído** (perfil pendente) |
| Dashboard + ClinicShell | **Concluído** (§3.1; métricas operacionais pendentes) |
| **Fundação portal (§3.1)** | **Concluído** |
| **Mocks serviços/convênios/perfil (§3.2)** | **Concluído** (`services.js`, `insurances.js`, `clinicProfileData.js`, `catalogConstants.js`) |
| **Meus Serviços (§4.4)** | **Concluído** (CRUD completo + fotos + convênios) |
| **Perfil & Vitrine de Fotos (§4.6)** | **Concluído** (Galeria, capa, card preview, horários) |
| **Banners de Ação Recomendada** | **Concluído** (`ClinicActionBanner.jsx` unificado) |
| Agenda + métricas + máquina de estados | **Próximo** (§4.1, §4.2, §4.3) |
| Financeiro PIX (§4.5) | **A seguir** |
| TanStack Query / hooks | **Concluído** (`useServices`, `clinicService.js`) |
| API e banco | **Fora da fase atual** |

### Ordem de implementação recomendada

```text
1. ~~ClinicShell + rotas aninhadas + logout~~ ✓
2. ~~src/data/services.js + useServices (mock)~~ ✓
3. ~~Meus Serviços (/dashboard/servicos) + fotos + multi-select convênios~~ ✓
4. ~~Perfil da Clínica (/dashboard/perfil) + galeria de fotos + vitrine TotalPass~~ ✓
5. /dashboard (métricas) + /dashboard/agenda (máquina de estados) ← próximo
6. /dashboard/financeiro (resumo PIX)
```

---

## 11) Rotina de uso deste checklist

1. Marcar `[x]` **somente** com evidência em código ou teste manual.
2. Priorizar §3.1 → §3.2 → §4.4 → §4.6 (concluídos) antes de agenda/financeiro.
3. Multi-select de convênios: sempre por **ID** de `insurances.js` (preparar `convenio_servico`).
4. Reutilizar padrão de validação de `FormField.jsx` e banners com `ClinicActionBanner.jsx`.
5. Atualizar §10 a cada entrega concluída.

---

## 12) Referências cruzadas

| Documento / arquivo | Uso |
|---------------------|-----|
| `docs/checklist-landing-page.md` | Landing e login |
| `docs/.cursorrulesIndexHomeClinicle` | Shell, serviços, estados, UX |
| `src/App.jsx` | Rotas aninhadas `/dashboard/*` |
| `src/components/clinic/*` | ClinicShell, Sidebar, ClinicTopBar, ClinicActionBanner, ServiceCard, ServiceFormModal, ClinicScheduleEditor |
| `src/pages/clinic/*` | Páginas do portal |
| `src/constants/catalogConstants.js` | Categorias e contrato de campos (arquitetura) |
| `src/constants/clinicNav.js` | Itens do menu lateral |
| `src/data/insurances.js` | Convênios mestre (N:N futuro) |
| `src/data/services.js` | Catálogo de procedimentos com fotos e convênios |
| `src/data/clinicProfileData.js` | Dados cadastrais e galeria de fotos |
| `src/hooks/useServices.js` | Hooks TanStack Query para serviços |
