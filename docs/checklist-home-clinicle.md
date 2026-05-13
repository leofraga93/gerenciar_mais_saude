Checklist - Portais Pós-Credenciamento (GerenciarSaúde)
1) O que já foi feito (Concluído)
[x] Hub de Entrada Único: Landing Page convertendo simultaneamente Clínicas e Usuários
.
[x] Roteamento Base: Definição das rotas /dashboard (Clínica) e /paciente/inicio (Paciente) no App.jsx
.
[x] Identidade Visual: Arquivo src/index.css estabelecido como a "verdade única" para estilos e cores
.
[x] Seleção de Perfil: Modal de acesso com abas separando a lógica de entrada por Role
.
2) O que está sendo feito (Fase Visual & Mock Data)
[ ] Layout Shell (Dashboard): Criação da estrutura de navegação lateral (Sidebar) e barra superior para a Clínica
.
[ ] Mock Data Strategy: Criação de arquivos em src/data/ para simular agendamentos, serviços e convênios sem depender de banco de dados
.
[ ] Componentização de UI: Extração de componentes reutilizáveis como StatCard.jsx (métricas) e StatusBadge.jsx (estados de agendamento)
.
3) O que ainda precisa ser atendido (Próximas Entregas)
3.1 Portal da Clínica (Gestão Web)
[ ] Painel de Métricas: Implementar cards visuais exibindo: total de agendamentos, solicitações pendentes e estimativa de receita
.
[ ] Agenda Inteligente: Lista de agendamentos com exibição de Nome do Paciente, Exame, Horário Sugerido e Status
.
[ ] Máquina de Estados Visual: Garantir que as cores dos status sigam o padrão: SOLICITADO (Azul), CONFIRMADO (Amarelo) e PAGO (Verde)
.
[ ] Catálogo de Serviços: Tela de listagem de exames com campos para Valor Particular e lista de Convênios aceitos
.
[ ] Formulários de Cadastro: Modais para adicionar novos serviços e configurar convênios por procedimento
.
3.2 Área do Paciente (Ponte Mobile)
[ ] Página de Boas-Vindas: Interface confirmando o acesso e reforçando a identidade do paciente
.
[ ] Conversão para App: Seção de destaque com botões (CTAs) para download na App Store e Google Play Store
.
[ ] Perfil Read-Only: Visualização dos dados básicos cadastrados (Nome, CPF, Plano de Saúde) em formato de leitura
.
3.3 Qualidade Técnica e UX
[ ] Responsividade Administrativa: Garantir que o Dashboard seja operável em tablets e desktops de recepção
.
[ ] Feedback de Ação: Implementar transições e mensagens de sucesso ao "confirmar" ou "excluir" itens mockados
.
[ ] Preparação TanStack Query: Estruturar os hooks de busca de dados já prevendo a substituição dos mocks pela API futuramente
.
4) Mapa Rápido de Status (Visão Executiva)
Concluído: Landing Page dual e estrutura de rotas.
Em andamento: Construção do layout base do Dashboard e componentes de UI.
Pendente Crítico: Implementação visual da máquina de estados nos agendamentos e tela de gestão de serviços/preços.
5) Sugestão de Uso deste Checklist
Foco no Visual: Não gaste tempo com fetch ou axios agora; foque em deixar a interface idêntica ao que o cliente espera ver no produto final.
Validação de Negócio: Use este checklist para validar com o cliente se os campos de "Valor Particular" e "Lista de Convênios" estão visíveis o suficiente no portal da clínica
.
Transição de Role: Ao marcar um item como concluído, verifique se ele respeita a segregação de acesso (Ex: o paciente nunca deve conseguir visualizar a rota de gestão de serviços)
.