### Checklist - Portais Pós-Credenciamento (GerenciarSaúde)
Base de comparação: docs/.cursorrulesIndexHomeClinicle, SPEC-05, SPEC-07 e fluxo de negócio B2B2C.
Roadmap transversal de evolução: `docs/prd/roadmap-evolucao.md` (itens EVOL-001 a EVOL-004).
**Escopo desta fase:** front-end visual + mock data. **Fora de escopo agora:** banco de dados, fetch/axios real, persistência de token. **Preparar desde já:** contratos de dados, src/data/*.js, src/services/*.js, hooks compatíveis com TanStack Query.
**Última revisão:** SPEC-05 etapas 1–5: campos jurídicos separados, status e banners de moderação, listagem administrativa e ações mock; SPEC-07 (Badge `PENDENCIA_PAGAMENTO` e Notificações WhatsApp).

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
| **Telefone / WhatsApp comercial** | Sim | [x] Etapa 3 | DDD + Fixo ou Celular com máscara `(00) 00000-0000` |
| **Código de Indicação / Parceiro** | Não | [x] Etapa 3 | Alfanumérico opcional |
| **Endereço Completo & Geolocalização** | Sim | [x] Fluxo vigente | Manter comportamento atual; não adicionar novas exigências ao wizard nesta SPEC. |
| **Galeria de Fotos do Estabelecimento** | Sim | [x] Perfil da clínica | Gerenciada em `/dashboard/perfil`; não mover para o wizard. |
| **Aceite Termos & Privacidade** | Sim | [x] Etapa 4 | Consentimento LGPD obrigatório |

##### 2.2 Trava de Moderação Administrativa (`PENDENTE_APROVACAO_ADMIN`)
*  [x] **Status Pós-Credenciamento:** salvar clínicas novas como `PENDENTE_APROVACAO_ADMIN`; publicação condicionada a `APROVADO`.
*  [x] **Navegação com Alerta no Dashboard:** O gestor mantém acesso ao `/dashboard` e visualiza `ClinicActionBanner.jsx` com mensagens para clínica pendente, suspensa ou rejeitada.
*  [x] **Painel de Moderação:** `/admin/clinicas` lista os cadastros e persiste ações para aprovar, suspender e rejeitar.
*  [ ] **Bloqueio de Exibição na Vitrine Pública (EVOL-006, adiado):** quando os serviços da busca vierem de cadastros de clínicas, descartar clínicas sem status `APROVADO`. Até essa fonte existir, preservar as ofertas demonstrativas mock atuais na vitrine.

--------------------------------------------------------------------------------

#### 3) Operação, Máquina de Estados e Cobrança Flexível (SPEC-07)
##### 3.1 Máquina de Estados e Badge `PENDENCIA_PAGAMENTO`
| Status | Cor Tailwind | Descrição / Ação |
| ------ | ------ | ------ |
| **`SOLICITADO`** | Azul (`blue-500`) | Solicitação de exames recebida. Botão "Confirmar Agendamento" ativo. |
| **`CONFIRMADO_CLINICA`**| Amarelo (`amber-500`) | Horário e data confirmados pela clínica. |
| **`PENDENCIA_PAGAMENTO`**| Laranja/Âmbar (`orange-500`) | **Novo Estado (SPEC-07)**: Exame confirmado ou realizado sem compensação prévia da taxa/valor do app. |
| **`PAGO`** | Verde (`emerald-600`)| Taxa de reserva/intermediação compensada via aplicativo. |
| **`FINALIZADO`** | Cinza (`slate-600`)| Atendimento concluído com sucesso. |
| **`CANCELADO`** | Vermelho (`red-500`)| Agendamento cancelado. |

*  [ ] **Sinalização no Card de Agendamento:** O componente `StatusBadge.jsx` renderiza o alerta em laranja com ícone vetorial quando a cobrança estiver pendente.
*  [ ] **Regra "Não Cobramos Fora do App":** Todas as taxas de intermediação permanecem registradas no painel da plataforma.
*  [ ] **Integração WhatsApp (`WhatsAppNotificationModal.jsx`):** Ações no card do agendamento para disparo pré-formatado de confirmação de exame, orientações de preparo (`descriptionPrep`) e link/boleto de cobrança via WhatsApp.

--------------------------------------------------------------------------------

#### 4) Catálogo de Meus Serviços (/dashboard/servicos)
*  [x] **Listagem:** Cards com Foto do Procedimento/Equipamento, Nome do exame, Valor Particular (R$) e badges de convênios aceitos.
*  [x] **Cadastro e Edição (ServiceFormModal.jsx):** Modal completo com upload de foto Base64, código TUSS, categoria, valor particular, preparo do paciente e **multi-select de convênios** (`insurances.js`).
*  [x] **Filtro por Categoria:** Reuso de `FilterButtonGroup.jsx` para navegar por nichos de exames.

--------------------------------------------------------------------------------

#### 5) Financeiro e Perfil da Clínica
*  [x] **Financeiro (/dashboard/financeiro):** StatCards de Receita Realizada e Prevista, Bloco PIX com cópia de chave e histórico de pagamentos.
*  [ ] **Acompanhamento de Pendências Financeiras:** Exibição separada dos valores acumulados sob o estado `PENDENCIA_PAGAMENTO`.
*  [x] **Perfil & Vitrine de Fotos (/dashboard/perfil):** Upload categorizado de fotos (Fachada, Recepção, Consultórios), foto de capa principal e pré-visualização do card da clínica.

--------------------------------------------------------------------------------

#### 6) Mapa Rápido de Status (Visão Executiva)
| Área | Status |
| ------ | ------ |
| Landing + rotas base + modal por perfil | **Concluído** |
| Credenciamento B2B Completo | **Em andamento** (campos Razão Social e Nome Fantasia separados; moderação e demais critérios seguem na SPEC-05) |
| Trava de Moderação Admin | **Em andamento (`SPEC-05`, etapas 1–5 concluídas; filtro sobre cadastros reais adiado em EVOL-006)** |
| Dashboard + ClinicShell + Métricas | **Concluído** |
| Catálogo de Serviços + Fotos + Convênios | **Concluído** |
| Agenda + Máquina de Estados | **Concluído** |
| Badge `PENDENCIA_PAGAMENTO` + WhatsApp | **Em Implementação (`SPEC-07`)** |
| Financeiro PIX | **Concluído** |
