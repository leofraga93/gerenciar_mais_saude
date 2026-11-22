### Checklist - Portais Pós-Credenciamento (GerenciarSaúde)
Base de comparação: `docs/prd/.cursorrulesIndexHomeClinicle`, SPEC-05, SPEC-07, SPEC-09 e fluxo de negócio B2B2C.
Roadmap transversal de evolução: `docs/prd/roadmap-evolucao.md` (itens EVOL-001 a EVOL-021).
**Escopo desta fase:** front-end visual + mock data. **Fora de escopo agora:** banco de dados, fetch/axios real, gateway real de pagamento, disparo automático de e-mails e dashboards multi-clínica do admin (EVOL-019..021). **Preparar desde já:** contratos de dados, src/data/*.js, src/services/*.js, hooks compatíveis com TanStack Query.
**Última revisão:** 2026-11-18 (Revisão 2) — contato direto do gestor na Etapa 3 (10 ou 11 dígitos sem trava do 3º dígito, isolado do perfil público), trial gratuito de 90 dias após `APROVADO` + plano R$ 99,00/mês (`SUSPENSO` ao vencer), e Financeiro `/dashboard/financeiro` com cards `3 → 2 → 1` e gráfico filtrável por Ano e Mês.

--------------------------------------------------------------------------------

#### Visão do fluxo
```text
Landing (/) → Credenciamento (/cadastro-clinica) → Moderação (PENDENTE_APROVACAO_ADMIN) → Portal (/dashboard/*)
         [x]                              [x]                                [ ]                          [x]
                                                                              ↓
                                                       Perfil [x] + Serviços [x] + Agenda [x] + Financeiro [x]
```

--------------------------------------------------------------------------------

#### 1) O que já foi feito (Concluído)
##### 1.1 Entrada e infraestrutura compartilhada
*  [x] Hub de entrada único: Landing Page convertendo Clínicas e Pacientes (src/pages/LandingPage.jsx).
*  [x] Roteamento em src/App.jsx: /, /cadastro-clinica, /dashboard, /paciente/inicio.
*  [x] Identidade visual: src/index.css como referência de cores e estilos.
*  [x] Modal de acesso com abas: **Acesso Clínica** vs **Acesso Paciente**.
*  [x] Redirecionamento mock por perfil no submit: Clínica → /dashboard; Paciente → /paciente/inicio.
*  [x] CTA na landing/modal: navegação para credenciamento (navigate('/cadastro-clinica')).
*  [x] Link simples "Acesso administrativo" em Navegação Rápida no rodapé abre modal mock e, após validação, direciona para `/admin/clinicas` (SPEC-05).

##### 1.2 Portal da clínica — ClinicShell (§3.1)
*  [x] Layout **ClinicShell** envolvendo /dashboard/* (src/components/clinic/ClinicShell.jsx).
*  [x] Nome fantasia no top bar (getRegisteredClinic() + sessionStorage).
*  [x] Avatar placeholder (iniciais da clínica) em ClinicTopBar.jsx.
*  [x] Botão **Sair** com clearRegisteredClinic() + redirecionamento para /.
*  [x] Banner **“Complete seu perfil”** na home (ClinicDashboardPage.jsx).
*  [x] Rotas aninhadas: home, agenda, serviços, financeiro, perfil.

--------------------------------------------------------------------------------

#### 2) Credenciamento B2B e Moderação Administrativa (SPEC-05)
Wizard em 4 etapas para criar a conta da empresa e submeter para análise da administração da plataforma.
##### 2.1 Campos do Credenciamento B2B (Preservação Integral)
| Campo | Obrigatório | Status UI | Regra / Observação |
| ------ | ------ | ------ | ------ |
| **Razão Social** | Sim | [x] Etapa 1 | Campo obrigatório separado; nome jurídico formal completo (mín. 3 caracteres) |
| **Nome Fantasia** | Sim | [x] Etapa 1 | Campo obrigatório separado; nome exibido aos pacientes na vitrine |
| **CNPJ** | Sim | [x] Etapa 1 | 14 dígitos com validação de algoritmo de DV |
| **E-mail Administrativo (login)** | Sim | [x] Etapa 2 | Login de acesso ao portal |
| **Senha + Confirmação** | Sim | [x] Etapa 2 | Mínimo 8 caracteres (letras + números) via `PasswordInput.jsx` |
| **Nome do Responsável / Gestor** | Sim | [x] Etapa 3 | Nome completo (mínimo 2 palavras) |
| **Telefone / WhatsApp direto do responsável** | Sim | [x] Etapa 3 (revisão Item 5) | DDD válido + 10 ou 11 dígitos com máscara dinâmica (sem trava do 3º dígito); uso administrativo da plataforma, isolado do telefone comercial público de `/dashboard/perfil` |
| **Código de Indicação / Parceiro** | Não | [x] Etapa 3 | Alfanumérico opcional |
| **Endereço Completo & Geolocalização** | Sim | [x] Fluxo vigente | Manter comportamento atual; não adicionar novas exigências ao wizard nesta SPEC. |
| **Galeria de Fotos do Estabelecimento** | Sim | [x] Perfil da clínica | Gerenciada em `/dashboard/perfil`; não mover para o wizard. |
| **Aceite Termos, Privacidade & Ciência do Trial** | Sim | [x] Etapa 4 | Consentimento LGPD + aviso dos **3 meses (90 dias) gratuitos** após aprovação e assinatura posterior de **R$ 99,00/mês** |

##### 2.2 Trava de Moderação Administrativa (`PENDENTE_APROVACAO_ADMIN`) e Trial 90 Dias
*  [x] **Status Pós-Credenciamento:** salvar clínicas novas como `PENDENTE_APROVACAO_ADMIN`; publicação condicionada a `APROVADO`.
*  [x] **Período de Teste (90 dias) e Plano R$ 99,00/mês:** ao aprovar (`APROVADO`), iniciar 90 dias gratuitos ilimitados (`trialStartedAt`/`trialEndsAt`); vencido o prazo sem adesão a R$ 99,00/mês, suspender automaticamente (`SUSPENSO`) até regularização.
*  [x] **Navegação com Alerta no Dashboard:** O gestor mantém acesso ao `/dashboard` e visualiza `ClinicActionBanner.jsx` com mensagens para clínica pendente, em período gratuito de 90 dias, suspensa ou rejeitada.
*  [x] **Painel de Moderação:** `/admin/clinicas` lista os cadastros e persiste ações para aprovar, suspender e rejeitar. (Ordenação por vencimento de trial, disparo de e-mails automáticos e dashboards consolidados/individuais ficam reservados para `EVOL-019` a `EVOL-021`).
*  [ ] **Bloqueio de Exibição na Vitrine Pública (EVOL-006, adiado):** quando os serviços da busca vierem de cadastros de clínicas, descartar clínicas sem status `APROVADO`. Até essa fonte existir, preservar as ofertas demonstrativas mock atuais na vitrine.

--------------------------------------------------------------------------------

#### 3) Operação, Presença e Cobrança (SPEC-09) e canais (SPEC-07)
##### 3.1 Máquina de Estados Operacional (SPEC-09)
| Status | Cor Tailwind | Descrição / Ação |
| ------ | ------ | ------ |
| **`SOLICITADO`** | Azul (`blue-500`) | Solicitação de exames recebida. Botão "Confirmar Agendamento" ativo. |
| **`CONFIRMADO_CLINICA`**| Amarelo (`amber-500`) | Horário confirmado; token único do pedido (`orderId`) gerado na primeira confirmação e `orderFee` do paciente passa a `PENDENTE_PAGAMENTO`. |
| **`REALIZADO`** | Verde (`emerald-600`)| Check-in no guichê (token ou busca manual) seguido da ação explícita "Marcar realizado". |
| **`NAO_COMPARECEU`** | Cinza (`slate-600`)| Ausência registrada pela clínica; token continua válido para eventual prova de guichê (`MANUAL_REVERSAL`). |
| **`CANCELADO`** | Vermelho (`red-500`)| Agendamento cancelado. |

O status legado `PAGO` é eliminado do código em conformidade com a SPEC-09. `PAGO`, `PENDENCIA_PAGAMENTO`, `FINALIZADO`, `AGUARDANDO_PAGAMENTO` e `ESTORNO_SOLICITADO` **não** entram no enum de agendamento. O pagamento da taxa única de R$ 5,00 por `orderId` pertence exclusivamente ao paciente na Máquina 2 (`orderFee`: `AGUARDANDO_CONFIRMACAO`, `PENDENTE_PAGAMENTO`, `PAGA`, `ISENTA`).

*  [x] **Token de presença e check-in em duas etapas (SPEC-09):** um token por `orderId`; check-in por clínica registra chegada (`checkedInAt`) antes de habilitar "Marcar realizado"; sem cobrança de taxa à clínica.
*  [ ] **WhatsApp (`WhatsAppNotificationModal.jsx`, SPEC-07 / EVOL-005):** confirmação e lembrete de preparo.

--------------------------------------------------------------------------------

#### 4) Catálogo de Meus Serviços (/dashboard/servicos)
*  [x] **Listagem:** Cards com Foto do Procedimento/Equipamento, Nome do exame, Valor Particular (R$) e badges de convênios aceitos.
*  [x] **Cadastro e Edição (ServiceFormModal.jsx):** Modal completo com upload de foto Base64, código TUSS, categoria, valor particular, preparo do paciente e **multi-select de convênios** (`insurances.js`).
*  [x] **Filtro por Categoria:** Reuso de `FilterButtonGroup.jsx` para navegar por nichos de exames.

--------------------------------------------------------------------------------

#### 5) Financeiro e Perfil da Clínica
*  [x] **Financeiro (`/dashboard/financeiro`, SPEC-09):** Exibir os 3 cards na ordem **`3 → 2 → 1`** (**Receita pendente de validação** → **Receita confirmada** → **Exame realizado**) e **Gráfico de Progressão de Agendamento por Pagamento** filtrável por **Ano** e **Mês** (Realizados vs. Pendentes e Particular vs. Convênio), sem status `PAGO`, sem bloco de chave PIX da clínica e sem cobrança de taxa/boleto semanal contra a clínica.
*  [x] **Perfil & Vitrine de Fotos (/dashboard/perfil):** Upload categorizado de fotos (Fachada, Recepção, Consultórios), foto de capa principal e pré-visualização do card da clínica; telefone comercial independente do contato pessoal do gestor cadastrado na Etapa 3.

--------------------------------------------------------------------------------

#### 6) Mapa Rápido de Status (Visão Executiva)
| Área | Status |
| ------ | ------ |
| Landing + rotas base + modal por perfil | **Concluído** |
| Credenciamento B2B Completo | **Concluído (`SPEC-05`)** — campos jurídicos separados, telefone direto do gestor na Etapa 3 e ciência do trial 90 dias / R$ 99,00 mensais |
| Trava de Moderação Admin | **Etapas 1–5 concluídas (`SPEC-05`, incl. ciclo trial 90 dias / R$ 99,00; filtro sobre cadastros reais adiado em EVOL-006; e-mails e dashboards admin em EVOL-019..021)** |
| Dashboard + ClinicShell + Métricas | **Concluído** |
| Catálogo de Serviços + Fotos + Convênios | **Concluído** |
| Agenda + Máquina de Estados | **Concluído (`SPEC-09`: eliminação de `PAGO`, check-in em duas etapas e disparo da taxa única ao paciente)** |
| Google Auth + WhatsApp | **Planejado (`SPEC-07` / EVOL-005)** |
| Financeiro da Clínica | **Concluído (`SPEC-09`: cards `3 → 2 → 1` + gráfico Ano/Mês, sem taxa/PIX da clínica)** |
