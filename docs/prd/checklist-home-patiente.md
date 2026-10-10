### Checklist - Credenciamento do Paciente, Agendamento Web e Evolução Mobile
Base de comparação: docs/checklist-landing-page.md, SPEC-06, SPEC-07 e requisitos de negócio B2B2C.
Roadmap transversal de evolução: `docs/prd/roadmap-evolucao.md` (itens EVOL-001 a EVOL-005; geocodificação em EVOL-002, Google Auth e WhatsApp em EVOL-005).
**Escopo desta fase:** Front-end visual + Mock Data + Reaproveitamento de componentes e utilitários.
**Fora de escopo agora:** Banco de dados PostgreSQL, fetch/axios real, integração com API Spring Boot, persistência de token backend.
**Última revisão:** 2026-10-10 — SPEC-06 concluída para fluxo web mock (lista de exames, localização local, submissão em lote, resumo e consulta do paciente); integrações externas Google Auth e WhatsApp adiadas para EVOL-005.

--------------------------------------------------------------------------------

#### Visão do fluxo de entrada e agendamento do paciente
```text
Landing neutra (/) ──► Visão Paciente ──► Vitrine / localização (SPEC-06)
       [x]                    [x]                    [x]
                                                       │
                                                       ▼
Área do paciente ◄── OrderSummaryModal ◄── Carrinho / agendamento no site
    [x]                    [x]                           [x]
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
*  [x] **Título do cadastro:** A finalidade da página é informada diretamente pelo título, sem etiqueta/eyebrow decorativo acima dele.
*  [x] **Página do Paciente (/paciente/inicio):** Perfil read-only, banner unificado `ClinicActionBanner`, pedidos recentes do fluxo web SPEC-06 e CTAs App Store / Google Play.

--------------------------------------------------------------------------------

#### 2) Agendamento Web: Carrinho de Exames, Resumo Consolidado e Busca para Terceiros (SPEC-06)
**Decisão:** o primeiro fluxo de carrinho e solicitação de agendamentos será concluído no site. A integração equivalente ao App Mobile ocorrerá depois e não é pré-requisito para o fluxo web.
##### 2.1 Carrinho de Exames — Multi-Agendamento (`useExamCart.js` / `cartStore.js`)
*  [x] **Inclusão de Múltiplos Exames:** Cada card abre a configuração pela ação "Solicitar agendamento". O botão "Adicionar Exame" confirma a inclusão, atualiza o contador vermelho e retorna à vitrine.
*  [x] **Painel da Lista de Exames (`ExamCartDrawer.jsx`):** O ícone com contador acumulado abre a lista para revisar os exames, concluir a solicitação e remover itens. A ação "Concluir solicitação" abre `ExamRequestReviewModal.jsx`; o acesso/cadastro preserva a lista, que só é limpa após submissão mock bem-sucedida. A lateral apresenta resumo com edição; salvar atualiza o item existente. A revisão final precede o login/cadastro, que mantém a lista até o envio bem-sucedido.
*  [x] **Componente Individual por Exame (`ExamCartItem.jsx`):**
    - Seletor de **Data e horário disponíveis** do exame antes de adicioná-lo à lista.
    - Filtro de **Período** na landing (`MANHA`, `TARDE`, `NOITE`); cada item recebe somente data e horário do período escolhido.
    - Modalidade de Pagamento: seleção entre Particular e convênios efetivamente oferecidos pela clínica para o serviço; elegibilidade do beneficiário será validada pela futura API.
    - Exibição destacada das **Orientações de Preparo (`descriptionPrep`)**.
    - O botão "Adicionar Exame" exibe carregamento e confirmação de salvo; após salvar, fecha a lateral e retorna à landing.
*  [x] Após login ou cadastro iniciado na revisão final, submeter os exames preservados e direcionar à área do paciente; a lista só é limpa após envio bem-sucedido.

##### 2.2 Busca Geolocalizada para Terceiros (`LocationSearchInput.jsx`)
*  [x] **Seleção Manual de Região de Referência (mock):** O paciente escolhe entre as regiões locais disponíveis em `LocationSearchInput.jsx`; coordenadas aproximadas ficam em `src/data/locationCatalog.js`. Geocodificação de endereço/CEP arbitrário permanece futura conforme SPEC-06.
*  [x] **Reordenação Dinâmica (mock):** Reordena clínicas e exames por distância de Haversine e desempata por maior avaliação da clínica.

##### 2.3 Resumo Consolidado (`OrderSummaryModal.jsx`)
*  [x] **Tabela Resumo do Lote:** `OrderSummaryModal.jsx` exibe exames agendados, clínicas responsáveis, datas, horários e valores; soma somente itens particulares.
*  [x] **Guia Unificado de Preparo:** O resumo consolida as orientações de preparo sem duplicar textos iguais.
*  [x] **Envio em Lote:** `appointmentService.js` cria um `orderId`, persiste todos os agendamentos mock em lote com status inicial `SOLICITADO` e valida seleção/disponibilidade.

--------------------------------------------------------------------------------

#### 3) Canais Digitais e Autenticação (SPEC-07)
*  [ ] **Google Auth (`AuthModal.jsx`, EVOL-005):** Integração OAuth/OIDC futura, dependente de configuração de provedor e validação segura de tokens.
*  [ ] **Notificações via WhatsApp (EVOL-005):** Integração futura via WhatsApp Business Platform ou provedor oficial, dependente de credenciais, templates e webhooks.

--------------------------------------------------------------------------------

#### 4) Mapa de Status (Visão Executiva)
| Módulo / Funcionalidade | Status | Arquivo de Referência |
| ------ | ------ | ------ |
| **Wizard de Cadastro Paciente** | **Concluído** | `src/pages/PatientSignupPage.jsx` |
| **Página Boas-Vindas / Perfil** | **Concluído** | `src/pages/PatientWelcomePage.jsx` |
| **Carrinho de Exames (`useExamCart`)** | **Concluído (SPEC-06 web mock)** | `src/hooks/useExamCart.js` / `src/components/patient/ExamCartDrawer.jsx` |
| **Item do Carrinho (`ExamCartItem`)** | **Concluído (SPEC-06 web mock)** | `src/components/patient/ExamCartItem.jsx` |
| **Busca para Terceiros (`LocationSearchInput`)** | **Concluído (mock; API futura EVOL-002)** | `src/components/patient/LocationSearchInput.jsx` / `src/data/locationCatalog.js` |
| **Revisão e Resumo de Pedidos** | **Concluído (SPEC-06 web mock)** | `src/components/patient/ExamRequestReviewModal.jsx` / `src/components/patient/OrderSummaryModal.jsx` / `src/components/patient/PatientRecentOrdersCard.jsx` |
| **Consulta de Pedidos (`usePatientAppointments`)** | **Concluído (SPEC-06 web mock)** | `src/hooks/usePatientAppointments.js` / `src/pages/PatientWelcomePage.jsx` |
| **Google Auth (`AuthModal`)** | **Futuro (EVOL-005; integração externa)** | `src/components/landing/AuthModal.jsx` |
| **Notificações via WhatsApp** | **Futuro (EVOL-005; integração externa)** | Roadmap de evolução |
