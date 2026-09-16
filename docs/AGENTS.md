# AGENTS.md - Regras Operacionais e Diretrizes Globais do Projeto (Gerenciar Mais Saúde)

Este documento contém as **regras permanentes e inegociáveis** do projeto *Gerenciar Mais Saúde*. Ele é carregado como contexto mestre de governança técnica, design e arquitetura para qualquer sessão de desenvolvimento.

---

## 1. Visão do Projeto & Arquitetura Base
- **Domínio**: Marketplace de Saúde B2B2C conectando Clínicas/Profissionais de Saúde a Pacientes (foco inicial: polo de Lauro de Freitas e Região Metropolitana de Salvador).
- **Stack Tecnológica**: React 19, Vite, Tailwind CSS v4, `@tanstack/react-query`, `react-router-dom`, ícones via `lucide-react` e `@fortawesome/*`.
- **Fase Atual (Frontend & Mock First)**:
  - **NÃO crie backends reais**, servidores Express adicionais, contêineres ou integrações de banco de dados (PostgreSQL/Supabase/Firebase) a menos que explicitamente solicitado.
  - Toda persistência atual deve ser simulada localmente via `sessionStorage`, `localStorage` e serviços desacoplados em `src/services/*.js`.
  - Dados padrão devem residir em `src/data/*.js`.
  - **Sempre use TanStack Query**: Todas as operações assíncronas de leitura e mutação devem ser encapsuladas em hooks com TanStack Query (`useQuery`, `useMutation` com invalidação ou atualização otimista de cache via `queryKey`).

---

## 2. Reutilização Obrigatória de Componentes e Utilitários (DRY Rigoroso)
- **Componentes Comuns (`src/components/common/`)**:
  - **NUNCA** crie um novo componente de campo se puder reutilizar `FormField.jsx`.
  - **NUNCA** crie novos sistemas de alerta visual se puder disparar o `Toast.jsx`.
  - Reutilize `inputClassName` de `src/utils/formUtils.js` para manter consistência de foco, erro e borda.
- **Componentes de Domínio da Clínica (`src/components/clinic/`)**:
  - Métricas e KPIs numéricos: use `StatCard.jsx`.
  - Estados de agendamento: use `StatusBadge.jsx`.
  - Alertas operacionais e banners de onboarding/ação recomendada: use `ClinicActionBanner.jsx`.
  - Configuração de dias/horários: use `ClinicScheduleEditor.jsx`.
- **Filtros e Catálogo (`src/components/catalog/`)**:
  - Botões de seleção/pills de categorias e convênios: reutilize `FilterButtonGroup.jsx`.
  - Faixa de preço dupla: reutilize `PriceRangeFilter.jsx`.

---

## 3. Diretrizes Estritas de UI, UX e Design System
- **Proibição Estrita de Emojis na Interface (Zero Emojis na UI)**:
  - É **terminantemente proibido** o uso de emojis na interface do usuário (telas, cards, botões, modais, toasts, badges, opções de select).
  - Use exclusivamente ícones vetoriais de `lucide-react` ou `@fortawesome/*`.
- **Paleta de Cores e Identidade Visual**:
  - Aderência obrigatória ao `src/index.css` e às convenções Tailwind do projeto.
  - Ação Primária / Sucesso / Saúde: `emerald-600` (hover: `emerald-700`, foco: ring `emerald-200`).
  - Neutros: escala `slate` (`slate-900` para títulos, `slate-600` para corpo, `slate-200`/`slate-100` para divisores e fundos).
  - Fundo principal: `#f8fafc` (`slate-50`).

---

## 4. Máquina de Estados e Regras de Negócio de Agendamentos
- **Cores Oficiais dos Estados (Tailwind)**:
  - `SOLICITADO`: Azul (`blue-500` / `bg-blue-50 text-blue-700 border-blue-200`).
  - `CONFIRMADO_CLINICA`: Amarelo/Âmbar (`amber-500` / `bg-amber-50 text-amber-700 border-amber-200`).
  - `PAGO`: Verde Esmeralda (`emerald-600` / `bg-emerald-50 text-emerald-700 border-emerald-200`).
  - `CANCELADO`: Vermelho (`red-500` / `bg-red-50 text-red-700 border-red-200`).
- **Lógica de Transições**:
  - A ação **"Confirmar Agendamento"** só é permitida quando o status for `SOLICITADO`.
  - A ação **"Registrar Pagamento"** só é permitida após `CONFIRMADO_CLINICA`.
  - **NUNCA** permita registrar pagamento diretamente do estado `SOLICITADO`.
  - Estados `PAGO` e `CANCELADO` são terminais (não possuem ações de alteração posteriores).
  - Transições devem ser centralizadas em funções puras (ex.: `getAvailableActions(status)`).

---

## 5. Estrutura de Catálogo, Procedimentos e Convênios
- **Relacionamento N:N (Serviço x Convênio)**:
  - A seleção de convênios aceitos deve ser feita **por serviço** (`insuranceIds[]`), nunca como configuração genérica da clínica.
  - **Multi-select dinâmico**: Seleção deve sempre vincular IDs oficiais de `src/data/insurances.js` (ex.: `unimed`, `bradesco`, `cassi`, `particular`), nunca strings livres.
- **Campos Obrigatórios de Procedimento**:
  - `name`: Nome legível do exame/consulta.
  - `category`: Categoria padronizada de `catalogConstants.js` (`LAB`, `IMG`, `CARDIO`, `CONSULT`, `OUTROS`).
  - `privatePrice`: Valor particular (R$).
  - `descriptionPrep`: Instruções de preparo (ex.: "Jejum de 12h"). **Gatilho de UX crítico para evitar no-show**.
  - `tussCode`: Opcional, formato padrão ANS (6 a 8 dígitos numéricos).

---

## 6. Segregação de Perfis e Roteamento (Web vs. Mobile)
- **`ROLE_CLINICA` (Portal Administrativo Web)**:
  - Rota base: `/dashboard/*` envolvida por `ClinicShell.jsx`.
  - Contém: Visão Geral (`/dashboard`), Agenda (`/dashboard/agenda`), Meus Serviços (`/dashboard/servicos`), Financeiro (`/dashboard/financeiro`) e Perfil da Clínica (`/dashboard/perfil`).
- **`ROLE_USUARIO` / Paciente (Ponte Web-to-App)**:
  - Rota base: `/paciente/inicio` e `/cadastro-paciente`.
  - **Regra de Escopo da Web**: O agendamento real de consultas e o mapa geolocalizado de clínicas são **exclusivos do App Mobile**.
  - Na Web, exiba boas-vindas, confirmação de cadastro, perfil read-only e links diretos para download nas lojas (App Store e Google Play) com explicação clara. Bloqueie tentativas de agendamento web com aviso amigável.
- **Proteção Visual de Rotas**:
  - Mantenha guard mock verificando perfil ativo para evitar que paciente acesse `/dashboard` ou vice-versa.

---

## 7. Padrões de Formulários, Validação e Acessibilidade
- **Validação em Tempo Real**:
  - Valide campos `onBlur` com indicação de erro visual (`border-red-400`, foco vermelho).
  - Toda mensagem de erro deve estar em português claro e vinculada ao input via `aria-describedby` ou `FormField`.
- **Comportamento no Submit**:
  - Ao submeter com erros, bloqueie o envio e dê foco automático no primeiro campo inválido.
- **Campos Especiais**:
  - `PasswordInput`: Padrão de interação "pressionar/segurar para revelar" e "soltar para ocultar".
  - Máscaras: CNPJ (`00.000.000/0000-00`), CPF (`000.000.000-00`), Telefone BR (`(00) 00000-0000`).

---

## 8. Verificação Obrigatória Antes de Concluir Tarefas
Antes de considerar qualquer modificação de código concluída:
1. **Linter**: O comando de lint (`npm run lint` ou ferramenta `lint_applet`) deve rodar sem erros.
2. **Build**: A aplicação deve compilar com sucesso (`compile_applet` ou `npm run build`).
3. **Sem Quebras de Regressão**: Nenhuma rota ou componente existente deve ter suas props ou estilização quebradas.

---

## 9. Governança de Especificações, Matriz Template e Protocolo Gatekeeper (`docs/specs/`)
- **Natureza Imutável do `TEMPLATE_SPEC.md`**:
  - O arquivo `docs/specs/TEMPLATE_SPEC.md` é a **matriz/gabarito permanente**. Ele **NUNCA** deve ser sobrescrito ou editado para representar uma tarefa individual.
  - Toda nova tarefa de desenvolvimento **DEVE** nascer como um arquivo novo e independente nomeado como `docs/specs/SPEC-[NUMERO]-[slug-da-tarefa].md` (ex: `SPEC-01-cadastro-paciente.md`), clonando a estrutura de seções de `TEMPLATE_SPEC.md`.
- **Leitura Obrigatória Pré-Implementação**:
  - Antes de escrever ou alterar qualquer linha de código, o agente é **estritamente obrigado** a ler o arquivo da spec ativa (`docs/specs/SPEC-*.md`) utilizando a ferramenta de leitura de arquivos.
  - Se for solicitado a criar uma nova spec, o agente deve obrigatoriamente ler `docs/specs/TEMPLATE_SPEC.md` primeiro para reproduzir com exatidão sua estrutura de 8 seções.
- **Auditoria do Gatekeeper (Stop & Ask)**:
  - O agente deve auditar se a spec ativa cobre com clareza as seções obrigatórias (Rota, Contrato de Dados, Reuso DRY, Máquina de Estados, Anti-Escopo, Critérios de Aceite DoD).
  - Se houver termos vagos (ex: *"adicionar campos necessários"*, *"fazer da melhor forma"*), ausência de tipos de dados, payloads de mock indefinidos ou regras omitidas: **NÃO ASSUMA E NÃO IMPLEMENTE POR ABSTRAÇÃO**.
  - O agente DEVE parar imediatamente e listar no chat exatamente quais definições estão pendentes antes de prosseguir.
- **Respeito Estrito ao Anti-Escopo**:
  - Todo item listado na seção "Anti-Escopo" da spec ativa é uma restrição absoluta. A inclusão de qualquer item do anti-escopo constitui falha crítica de entrega.

---

## 10. Protocolo de Fechamento de Ciclo e Rastreabilidade (Done & Sync)
Ao concluir com sucesso a implementação de qualquer tarefa (após validação positiva de linter e build):
1. **Atualização da Spec Ativa (`docs/specs/SPEC-*.md`)**:
   - Marcar todos os checkboxes dos Critérios de Aceite (DoD - Seção 6) implementados como concluídos: `- [x]`.
   - Atualizar o status do cabeçalho da spec para `Status: CONCLUÍDO` e preencher a data de conclusão.
   - Marcar os itens de fechamento da Seção 8 da spec como `[x]`.
2. **Sincronização com o Documento PRD (`docs/prd/*.md`)**:
   - Localizar a seção, tabela ou checklist correspondente no documento da pasta `docs/prd/` indicado no cabeçalho da spec (ex: `docs/prd/checklist-home-patiente.md`, `docs/prd/checklist-home-clinicle.md`, etc.).
   - Marcar os itens entregues como concluídos `[x]`, atualizar tabelas de status e o mapa de status executivo.
3. **Garantia de Não-Regressão de Estado**:
   - **NUNCA** finalize um turno sem sincronizar a documentação após alterar código funcional. Isso assegura que a próxima sessão do agente saiba exatamente em qual passo o projeto está, sem leituras redundantes ou retrabalho.


