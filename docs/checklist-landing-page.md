# Checklist - Landing Page Hub (Clínicas + Pacientes)

Base de comparação: regras atualizadas em `docs/.cursorrulesIndexPage` e roadmap do projeto.

---

## 1) O que foi feito e continua atendendo

- [x] Estrutura base da landing em React criada (`src/pages/LandingPage.jsx`; `src/App.jsx` concentra o roteador).
- [x] Estilização com Tailwind aplicada e arquivo de estilo global existente (`src/index.css`).
- [x] Header, Hero, seções de benefícios, métricas, depoimentos e CTA final implementados.
- [x] Modal de acesso existente com abertura/fechamento por estado local e seleção de perfil (Clínica vs Paciente).
- [x] Campos de login (e-mail/senha) com validação básica de formulário e direcionamento por perfil.
- [x] Responsividade completa com breakpoints (`sm`, `md`, `lg`).

---

## 2) Implementações e Ajustes Recentes (Atualizado)

### 2.1 Faixa de Destaque: Passo a Passo da Plataforma (Jornada em 4 Etapas)
- [x] **Container Verde de Alto Destaque:** Faixa posicionada logo após a seção Hero, proporcionando clareza imediata sobre o funcionamento da plataforma para clínicas e pacientes.
- [x] **Processo Intuitivo em 4 Passos:**
  1. *01. Encontre especialistas & serviços:* Busca por região, convênios, especialidades e exames.
  2. *02. Marque consultas & exames:* Escolha simplificada de dia, horário e clínica sem burocracia.
  3. *03. Receba lembretes & preparo:* Confirmações instantâneas e orientações automáticas de preparo via WhatsApp e e-mail.
  4. *04. Atendimento & avaliação:* Atendimento ágil e avaliação pós-serviço para fortalecer a rede.
- [x] **Ícones Vetoriais FontAwesome:** Integração com `@fortawesome/free-solid-svg-icons` (MagnifyingGlass, CalendarCheck, Bell, ThumbsUp) para reforço visual imediato.

### 2.2 Vitrine Pública de Catálogo & Busca Interativa com Múltiplos Filtros
- [x] **Vitrine de Procedimentos e Exames:** Integrada na landing page acima dos depoimentos.
- [x] **Componente Reutilizável de Botões/Pills (`FilterButtonGroup`):**
  - Botões de seleção destacados em verde esmeralda quando ativos (`bg-emerald-600 text-white`) e neutros quando inativos (`bg-slate-100 text-slate-600`), aplicados tanto para Categorias quanto para Convênios.
- [x] **Filtros por Categoria:** Abas/botões interativos (Todos, Laboratório, Imagem, Cardiologia, Consultas) com contadores em tempo real.
- [x] **Filtro por Convênio em Botões/Pills:** Seleção dedicada em botões de marcar (Todos os Planos, Bradesco Saúde, Unimed, Cassi, SulAmérica, Amil, Hapvida, Particular) com contadores dinâmicos.
- [x] **Filtro de Faixa de Valor Interativo (`PriceRangeFilter`):**
  - Faixa calculada dinamicamente a partir dos valores mínimos e máximos da base (R$ 25 a R$ 650).
  - Controle duplo: permite arrastar a barra de faixa (*slider duplo com preenchimento em tempo real*) e também digitar diretamente nos campos numéricos (*De R$ [min] até R$ [max]*).
- [x] **Botão Minimalista de Limpar Filtros:** Botão discreto e perfeitamente alinhado no cabeçalho dos filtros com ícone `RotateCcw` e tipografia sutil.
- [x] **Busca Instantânea:** Filtro em tempo real por nome do exame, código TUSS e instruções de preparo (ex: Jejum).
- [x] **Dados Padronizados:** Exibição de valor de referência (R$), duração média (min), badges de preparo/orientações e convênios aceitos.
- [x] **Paginação Progressiva:** Exibição inicial de 9 procedimentos com botão de expansão progressiva ("Carregar mais") até esgotar os itens da categoria, com reset automático ao filtrar.

### 2.3 Rodapé Responsivo de Alto Contraste (Estilo Capão Domo / Dark Theme)
- [x] **Identidade Visual e Logo em Contraste:** Badge estilizado com a logo da marca em fundo branco e texto descritivo institucional.
- [x] **Canais de Contato:** Telefone fixo, WhatsApp comercial direto, e-mail institucional e localização física (Lauro de Freitas e Salvador - BA).
- [x] **Navegação Rápida:** Links internos para as seções da página (Início, Benefícios, Catálogo, Métricas, Credenciamento e Portal do Paciente).
- [x] **Canais e Redes Sociais:** Ícones padronizados para canais digitais (Site/Web, E-mail, WhatsApp, LinkedIn) sem incluir área restrita separada (utilizando o fluxo nativo de credenciamento).
- [x] **Linha de Créditos & Termos:** Copyright 2026, links de Termos de Uso / Políticas de Privacidade e razão social / CNPJ.

### 2.4 Limpeza e Organização de Arquitetura
- [x] **Remoção de Arquivos Mortos:** Exclusão de `src/pages/DashboardPage.jsx` (arquivo vazio obsoleto) e `src/data/catalogData.js` (substituído pelo catálogo padronizado `standardCatalog.js`).
- [x] **Preservação de Assets:** Manutenção integral dos arquivos de imagem e logotipos em `src/assets/`.
- [x] **Imagens Otimizadas:** Uso de fotografia moderna de saúde digital na seção Hero e nos cards de benefícios.

---

## 3) O que está em preparação & Análise de Novas Funcionalidades

### 3.1 Próximos Passos Imediatos
- [ ] Integração do formulário de acesso com backend de autenticação real (JWT / Token).
- [x] Evolução do fluxo de entrada para direcionar usuário por perfil (`ROLE_CLINICA` → `/dashboard`, `ROLE_USUARIO` → `/paciente/inicio`).
- [ ] Cadastro básico web de paciente (Nome, CPF, E-mail, Telefone).

### 3.2 Expansão para Profissionais Individuais / Autônomos de Saúde (A Ser Analisado e Planejado)
- [ ] **Mapeamento de Requisitos para Profissionais Individuais:**
  - *Contexto:* Atender não apenas Clínicas/PJs estruturadas, mas também profissionais liberais autônomos de saúde (ex: médicos com consultório individual, psicólogos, nutricionistas, fisioterapeutas, fonoaudiólogos).
  - *Pontos a definir:*
    - Tipo de credenciamento: CPF vs CNPJ individual (MEI/SLU), registro em conselho de classe profissional (CRM, CRP, CRN, CREFITO).
    - Modelo de catálogo de serviços simplificado para profissional único vs equipe multiprofissional.
    - Configuração de agenda personalizada individual (locais de atendimento, teleconsulta e consultório próprio).
    - Ajustes futuros no Hero, CTAs ("Sou Profissional de Saúde") e telas de onboarding quando o escopo for definido.

---

## 4) Mapa rápido de status

- **Atende:** Base visual e conversão dual, CTAs duplos, modal inteligente, faixa passo a passo em 4 etapas, catálogo público com busca multi-critério (Categoria + Convênio + Faixa de Valor) e paginação progressiva, rodapé responsivo completo em Dark Theme, rotas `/`, `/dashboard/*`, `/paciente/inicio`, `/cadastro-clinica`.
- **Parcial:** Fluxo por perfil (UX e rotas mockadas prontas; integração com endpoints de token a ser implementada na fase backend).
- **Próximos passos:** Integração de API real para autenticação e cadastro web, e planejamento da entrada de profissionais individuais de saúde.
