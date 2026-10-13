### Checklist - Landing Page Hub (Clínicas + Pacientes)
Base de comparação: `docs/AGENTS.md`, SPEC-04 e roadmap do projeto.
Roadmap transversal de evolução: `docs/prd/roadmap-evolucao.md` (itens EVOL-001 a EVOL-013; Google Auth e integrações via WhatsApp aguardam EVOL-005 junto à API/backend).

**Decisão de experiência:** a rota `/` inicia neutra e convidativa, com promessa institucional, escolha explícita entre Paciente e Clínica e elementos globais compartilhados. A escolha troca a área principal por uma experiência B2C ou B2B dedicada. Busca para terceiros e agendamento no site pertencem à SPEC-06; Google Auth pertence à SPEC-07; credenciamento da clínica pertence à SPEC-05.

--------------------------------------------------------------------------------

#### 1) O que foi feito e continua atendendo
*  [x] Estrutura base da landing em React criada (src/pages/LandingPage.jsx; src/App.jsx concentra o roteador).
*  [x] Estilização com Tailwind aplicada e arquivo de estilo global existente (src/index.css).
*  [x] Header, Hero, seções de benefícios, métricas, depoimentos e CTA final implementados.
*  [x] Modal de acesso existente com abertura/fechamento por estado local e seleção de perfil (Clínica vs Paciente).
*  [x] Campos de login (e-mail/senha) com validação básica de formulário e direcionamento por perfil.
*  [x] Responsividade completa com breakpoints (sm, md, lg).

--------------------------------------------------------------------------------

#### 2) Reformulação da Entrada Dual & Seleção de Nicho (SPEC-04)
##### 2.1 Hub Neutro de Decisão Fluída (`activeNiche = 'NONE'`)
*  [x] **Hero Selector Neutro (`NeutralHeroSelector.jsx`):** Tela inicial limpa e fluída apresentando a proposta de valor unificada e dois cards de decisão explícita: **"Sou Paciente"** vs **"Sou Clínica"**.
*  [x] **Conteúdo neutro compartilhado:** Cabeçalho fixo e translúcido, marca clicável para a página inicial, hero com imagem ampla, promessa unificada, dois cards de escolha e métricas demonstrativas com aviso de atualização futura. Não exibir catálogo, preços, depoimentos segmentados ou chamadas de agendamento antes da escolha.
*  [x] **Métricas da landing neutra:** Apresenta `120+`, `94%` e `4.8/5` como valores ilustrativos; inclui aviso de que serão atualizados quando houver base consolidada. A integração de dados fica para etapa posterior. As alegações numéricas na visão clínica são acompanhadas em EVOL-009.
*  [x] **Imagens de cada audiência:** Hero neutro em imagem Unsplash ampla, e heros próprios com imagens contextuais para Paciente e Clínica, com sobreposição para preservar legibilidade.
*  [x] **Marca no cabeçalho:** Logo, nome e assinatura institucional compõem um único link para `/`; ao clicar, limpa o nicho salvo e retorna ao estado neutro, sem query `nicho`.
*  [x] **Títulos das seções:** As visões neutra, de paciente e de clínica e o modal de acesso não usam eyebrows decorativos; os títulos descrevem diretamente o conteúdo.
*  [x] **Ativação Dinâmica de Nicho:** O estado `activeNiche` (`'NONE'` | `'PATIENT'` | `'CLINIC'`) transita a interface sem recarregar a página.
*  [x] **Chave Seletora no Cabeçalho (`NicheSegmentedControl.jsx`):** Permite alternar entre as visões de Paciente e Clínica a qualquer momento no topo da página.
*  [x] **Suporte a Parâmetros de URL & Persistência:** Leitura automática de `?nicho=paciente` ou `?nicho=clinica` e persistência temporária da escolha no `sessionStorage` (`gms_selected_niche`).

##### 2.2 Visão Segmentada B2C — Paciente (`activeNiche = 'PATIENT'`)
*  [x] **Busca de Exames por Nome e Código TUSS:** Campo de busca direta na vitrine B2C.
*  [x] **Localização Customizada para Terceiros (`LocationSearchInput.jsx`, SPEC-06, Etapa 5):** Permite escolher região de referência em lista local para buscar e agendar exames para parentes em outras regiões. Coordenadas são demonstrativas; geocodificação de endereço/CEP é futura.
*  [x] **Vitrine B2C de Exames & Filtros Multi-critério:** Filtros por categoria, convênios (pills esmeralda) e faixa de valor interativa (`PriceRangeFilter.jsx`).
*  [x] **CTAs Contextualizados B2C:** Botão primário **"Cadastre-se"** (`/cadastro-paciente`) e botão secundário **"Entrar"** (abre `AuthModal` no contexto Paciente). O botão Google é acrescentado na SPEC-07. Os destinos dos links de privacidade são acompanhados em EVOL-011.

##### 2.3 Visão Segmentada B2B — Clínica (`activeNiche = 'CLINIC'`)
*  [x] **Proposta de Valor B2B:** Foco em redução de *no-show*, gestão de agenda e liquidação digital.
*  [x] **Benefícios Operacionais:** Cards qualitativos sobre agenda, redução de faltas e recebimento. Métricas demonstrativas aparecem somente no estado neutro e são claramente identificadas como ilustrativas; não incluir calculadora de ROI nesta etapa.
*  [x] **CTAs Contextualizados B2B:** Botão primário **"Credenciar Minha Clínica"** (`/cadastro-clinica`, fluxo da SPEC-05) e botão secundário **"Acessar Portal"** (abre `AuthModal` no contexto Clínica).

--------------------------------------------------------------------------------

#### 3) Implementações e Componentes da Landing Page
##### 3.1 Jornada do Paciente: Passo a Passo (visível somente em `PATIENT`)
Na SPEC-04, esta jornada deixa de aparecer na entrada neutra. Seu conteúdo atual trata de encontrar e agendar exames, então fica dentro da visão Paciente. A visão Clínica terá jornada própria de credenciamento/gestão; não reutilizar estes passos B2C como comunicação B2B.
*  [x] **Container Verde de Alto Destaque:** Faixa atualmente existente; na SPEC-04 fica dentro da jornada da visão Paciente e deixa de ser apresentada como mensagem comum para clínicas e pacientes.
*  [x] **Processo Intuitivo em 4 Passos:**
    1. *01. Encontre especialistas & exames:* Busca por região, convênios, especialidades e exames.
    2. *02. Marque consultas & exames:* Escolha simplificada de dia, horário e clínica sem burocracia.
    3. *03. Receba lembretes & preparo:* Confirmações instantâneas e orientações automáticas de preparo via WhatsApp e e-mail.
    4. *04. Atendimento & avaliação:* Atendimento ágil e avaliação pós-serviço para fortalecer a rede.
*  [x] **Ícones Vetoriais FontAwesome:** Integração com @fortawesome/free-solid-svg-icons (MagnifyingGlass, CalendarCheck, Bell, ThumbsUp) para reforço visual imediato.

##### 3.2 Vitrine Pública de Catálogo & Busca Interativa com Múltiplos Filtros
*  [x] **Vitrine de Procedimentos e Exames:** Integrada na landing page acima dos depoimentos.
*  [x] **Componente Reutilizável de Botões/Pills (FilterButtonGroup):** Botões em verde esmeralda quando ativos (`bg-emerald-600 text-white`) e neutros quando inativos (`bg-slate-100 text-slate-600`).
*  [x] **Filtros por Categoria:** Abas/botões interativos (Todos, Laboratório, Imagem, Cardiologia, Consultas) com contadores em tempo real.
*  [x] **Filtro por Convênio em Botões/Pills:** Seleção dedicada em botões de marcar (Todos os Planos, Bradesco Saúde, Unimed, Cassi, SulAmérica, Amil, Hapvida, Particular).
*  [x] **Filtro de Faixa de Valor Interativo (PriceRangeFilter):** Faixa calculada dinamicamente com slider duplo e campos numéricos (De R$ [min] até R$ [max]).
*  [x] **Botão Minimalista de Limpar Filtros:** Botão discreto com ícone RotateCcw.
*  [x] **Busca Instantânea:** Filtro em tempo real por nome do exame, código TUSS e instruções de preparo (ex: Jejum).
*  [x] **Paginação Progressiva:** Exibição inicial de 9 procedimentos com botão "Carregar mais".

##### 3.3 Rodapé Responsivo de Alto Contraste (Dark Theme)
*  [x] **Identidade Visual e Logo em Contraste:** Badge estilizado com a logo da marca em fundo branco e texto descritivo institucional.
*  [x] **Canais de Contato:** Telefone fixo, WhatsApp comercial direto, e-mail institucional e localização física (Lauro de Freitas e Salvador - BA).
*  [x] **Navegação Rápida:** Links internos para as seções da página.
*  [x] **Linha de Créditos & Termos:** Copyright 2026, links de Termos de Uso / Políticas de Privacidade e razão social / CNPJ.

##### 3.4 Carrossel Interativo de Depoimentos (visível após escolha de nicho)
Na SPEC-04, o carrossel não aparece no estado neutro. A visão Paciente exibe apenas depoimentos `patient`, e a visão Clínica apenas `clinic`; manter o carrossel e sua navegação, adaptando-o para receber a audiência ativa em vez de permitir uma aba que misture os públicos.
*  [x] **Componente Dedicado (TestimonialsCarousel.jsx):** Substituição de bloco de texto puro por carrossel interativo.
*  [x] **Filtros por Audiência no componente atual:** O carrossel existente já filtra os públicos. Na SPEC-04, a visão segmentada determina a audiência exibida, sem opção "Todos" que misture pacientes e clínicas.
*  [x] **Zero Emojis na UI:** Aderência estrita à regra global de design com ícones 100% vetoriais da biblioteca lucide-react.

--------------------------------------------------------------------------------

#### 4) O que está em preparação & Análise de Novas Funcionalidades
##### 4.1 Próximos Passos Imediatos
*  [x] Implementação do Hub Neutro e Seleção de Nicho (`SPEC-04`).
*  [x] Integração do agendamento web e busca para terceiros (`SPEC-06`), conectada ao ponto de extensão do catálogo B2C.
*  [ ] Integração com botão **"Entrar com o Google"** (`SPEC-07`) no `AuthModal` contextual criado/adaptado pela SPEC-04.
*  [ ] Integração do formulário de acesso com backend de autenticação real (JWT / Token).

--------------------------------------------------------------------------------

#### 5) Mapa Rápido de Status (Visão Executiva)
*   **Atende:** Base visual e conversão dual, CTAs duplos, modal inteligente, faixa passo a passo em 4 etapas, catálogo público com busca multi-critério (Categoria + Convênio + Faixa de Valor), carrossel de depoimentos e rodapé Dark Theme.
*   **Concluído:** Hub neutro e visões segmentadas (`SPEC-04`).
*   **Planejado:** credenciamento (`SPEC-05`) e integrações externas Google Auth e WhatsApp em EVOL-005, depois do planejamento de API/backend em EVOL-002. O fluxo web da SPEC-06 está concluído; pendências de copy, dados e manutenção estão rastreadas em EVOL-007..013.
*   **Fora desta sequência mock-first:** API real de autenticação.
