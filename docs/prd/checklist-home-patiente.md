### Checklist - Credenciamento do Paciente, Agendamento Web e Evolução Mobile
Base de comparação: docs/checklist-landing-page.md, SPEC-06, SPEC-07 e requisitos de negócio B2B2C.
**Escopo desta fase:** Front-end visual + Mock Data + Reaproveitamento de componentes e utilitários.
**Fora de escopo agora:** Banco de dados PostgreSQL, fetch/axios real, integração com API Spring Boot, persistência de token backend.
**Última revisão:** Incorporação da SPEC-06 (Carrinho de Exames / Multi-Agendamento, Resumo Consolidado `OrderSummaryModal` e Busca Geolocalizada para Terceiros `LocationSearchInput`) e SPEC-07 (Google Auth e Integração WhatsApp).

--------------------------------------------------------------------------------

#### Visão do fluxo de entrada e agendamento do paciente
```text
Landing neutra (/) ──► Visão Paciente ──► Vitrine / localização (SPEC-06)
       [ ]                    [ ]                    [ ]
                                                       │
                                                       ▼
Área do paciente ◄── OrderSummaryModal ◄── Carrinho / agendamento no site
    [x]                    [ ]                           [ ]
                                                       │
                                                       ▼
                                      Experiência equivalente no App Mobile (etapa futura)
```

--------------------------------------------------------------------------------

#### 1) O que já temos (Concluído)
*  [x] **Entrada atual:** Landing page com modal de acesso por abas (Clínica vs. Paciente) e redirecionamento mock para /paciente/inicio (src/pages/LandingPage.jsx).
*  [ ] **Hub Neutro e Seleção de Nicho (SPEC-04):** A tela inicial apresenta uma proposta institucional e escolha explícita; depois exibe a visão B2C ou B2B correspondente.
*  [x] **Identidade Visual:** Padrão global de cores, tipografia e utilitários em src/index.css.
*  [x] **Componente FormField:** Estrutura para rótulos, erros acessíveis e bordas vermelhas.
*  [x] **Componente Toast:** Sistema de notificações flutuantes.
*  [x] **Wizard de Cadastro do Paciente (/cadastro-paciente):** 3 etapas com validação de CPF (DV), idade mínima (18+), e-mail/senha com `PasswordInput.jsx` e suporte a convênios em pills.
*  [x] **Página de Boas-Vindas (/paciente/inicio):** Perfil read-only, banner unificado `ClinicActionBanner` e CTAs App Store / Google Play.

--------------------------------------------------------------------------------

#### 2) Agendamento Web: Carrinho de Exames, Resumo Consolidado e Busca para Terceiros (SPEC-06)
**Decisão:** o primeiro fluxo de carrinho e solicitação de agendamentos será concluído no site. A integração equivalente ao App Mobile ocorrerá depois e não é pré-requisito para o fluxo web.
##### 2.1 Carrinho de Exames — Multi-Agendamento (`useExamCart.js` / `cartStore.js`)
*  [ ] **Inclusão de Múltiplos Exames:** O paciente navega pela vitrine e adiciona N exames ao seu **Carrinho de Exames** com atualização instantânea do contador no cabeçalho.
*  [ ] **Painel Lateral do Carrinho (`ExamCartDrawer.jsx`):** Gaveta lateral para visualização e gerenciamento do lote de exames.
*  [ ] **Componente Individual por Exame (`ExamCartItem.jsx`):**
    - Seletor de **Data Desejada** por exame.
    - Seletor de **Período Preferencial** em pills (`MANHA`, `TARDE`, `NOITE`).
    - Modalidade de Pagamento: seleção entre "Particular" (exibe valor em R$) ou "Convênio" (filtra apenas os convênios aceitos pelo procedimento).
    - Exibição destacada das **Orientações de Preparo (`descriptionPrep`)** (ex: "Jejum de 8h").

##### 2.2 Busca Geolocalizada para Terceiros (`LocationSearchInput.jsx`)
*  [ ] **Seleção Manual de Endereço/Bairro:** O paciente pode alterar a localização de referência na busca de exames para agendar atendimentos para parentes ou terceiros em outras regiões (ex: agendar em Vilas do Atlântico / Lauro de Freitas estando em Salvador).
*  [ ] **Reordenação Dinâmica:** Reordena as clínicas e exames disponíveis com base no endereço informado para o beneficiário.

##### 2.3 Resumo Consolidado (`OrderSummaryModal.jsx`)
*  [ ] **Tabela Resumo do Lote:** Exibe a lista completa de exames agendados, clínicas responsáveis, datas e horários.
*  [ ] **Guia Unificado de Preparo:** Consolidação das orientações de atendimento de todos os exames do carrinho para o dia do procedimento.
*  [ ] **Envio em Lote:** Disparo dos agendamentos via `appointmentService.js` com status inicial `SOLICITADO`.

--------------------------------------------------------------------------------

#### 3) Canais Digitais e Autenticação (SPEC-07)
*  [ ] **Google Auth (`AuthModal.jsx`):** Inclusão do botão funcional **"Entrar com o Google"** no modal de acesso do paciente para acelerar o cadastro e login.
*  [ ] **Notificações via WhatsApp:** Suporte ao envio de lembretes, orientações de preparo e boletos/chaves PIX via WhatsApp diretamente pelos cards de agendamento.

--------------------------------------------------------------------------------

#### 4) Mapa de Status (Visão Executiva)
| Módulo / Funcionalidade | Status | Arquivo de Referência |
| ------ | ------ | ------ |
| **Wizard de Cadastro Paciente** | **Concluído** | `src/pages/PatientSignupPage.jsx` |
| **Página Boas-Vindas / Perfil** | **Concluído** | `src/pages/PatientWelcomePage.jsx` |
| **Carrinho de Exames (`useExamCart`)** | **Em Implementação (`SPEC-06`)** | `src/hooks/useExamCart.js` / `ExamCartDrawer.jsx` |
| **Item do Carrinho (`ExamCartItem`)** | **Em Implementação (`SPEC-06`)** | `src/components/patient/ExamCartItem.jsx` |
| **Busca para Terceiros (`LocationSearchInput`)** | **Em Implementação (`SPEC-06`)** | `src/components/patient/LocationSearchInput.jsx` |
| **Resumo Consolidado (`OrderSummaryModal`)** | **Em Implementação (`SPEC-06`)** | `src/components/patient/OrderSummaryModal.jsx` |
| **Google Auth (`AuthModal`)** | **Em Implementação (`SPEC-07`)** | `src/components/landing/AuthModal.jsx` |
