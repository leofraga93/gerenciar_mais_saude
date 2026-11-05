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
  - Frentes transversais futuras (expansão de tipos de organização, evolução para backend e melhoria de bundle) ficam rastreadas em `docs/prd/roadmap-evolucao.md`; esse roadmap não altera o escopo da SPEC ativa nem autoriza backend.

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
- **Proibição de Eyebrows/Sobretítulos Decorativos**:
  - **Não utilizar eyebrows** (rótulos curtos, geralmente em caixa alta ou letras espaçadas, posicionados imediatamente acima de um título) em páginas, seções, cards ou formulários. Exemplos a evitar: "Cuidado com mais clareza" antes de um título e "Uma operação mais organizada" antes da descrição da seção.
  - O próprio título deve identificar com clareza o conteúdo, objetivo ou ação da seção. Evite rótulos genéricos, slogans e textos decorativos que apenas repetem ou antecipam o título.
  - Não substituir o eyebrow por badge, etiqueta, kicker ou outro elemento visual equivalente. Use texto auxiliar somente quando acrescentar informação concreta que não esteja repetida no título e for necessária para a compreensão ou execução da tarefa.
- **Paleta de Cores e Identidade Visual**:
  - Aderência obrigatória ao `src/index.css` e às convenções Tailwind do projeto.
  - Ação Primária / Sucesso / Saúde: `emerald-600` (hover: `emerald-700`, foco: ring `emerald-200`).
  - Neutros: escala `slate` (`slate-900` para títulos, `slate-600` para corpo, `slate-200`/`slate-100` para divisores e fundos).
  - Fundo principal: `#f8fafc` (`slate-50`).

---

## 4. Máquina de Estados e Regras de Negócio de Agendamentos
- **Contrato de negócio aprovado**: `docs/specs/SPEC-09_Modelo_de_Cobranca_e_Maquinas_de_Estado.md`. A SPEC-08 foi substituída pela SPEC-09; não referenciar a SPEC-08 como fonte de regras.
- **Duas máquinas independentes**: Agendamento (Máquina 1) e Lançamento da taxa / `feeLedger` (Máquina 2). Nunca misturar status de pagamento no enum do agendamento.
- **Status operacional do agendamento** — compartilhado entre paciente, clínica e admin (mesmo enum nas três pontas): `SOLICITADO`, `CONFIRMADO_CLINICA`, `REALIZADO`, `NAO_COMPARECEU`, `CANCELADO`. Código novo não deve acrescentar `PAGO`, `PENDENCIA_PAGAMENTO`, `FINALIZADO`, `AGUARDANDO_PAGAMENTO` nem `ESTORNO_SOLICITADO` como status de agendamento.
- **Status do lançamento da taxa (`feeLedger`)**: `EM_ANALISE`, `DEVIDA`, `COBRANCA_GERADA`, `PAGA`, `EM_ATRASO`, `ISENTA`.
- **Cores Oficiais dos Estados do Agendamento (Tailwind)**:
  - `SOLICITADO`: Azul (`blue-500` / `bg-blue-50 text-blue-700 border-blue-200`).
  - `CONFIRMADO_CLINICA`: Amarelo/Âmbar (`amber-500` / `bg-amber-50 text-amber-700 border-amber-200`).
  - `REALIZADO`: Verde Esmeralda (`emerald-600` / `bg-emerald-50 text-emerald-700 border-emerald-200`).
  - `NAO_COMPARECEU`: Cinza (`slate-600` / `bg-slate-100 text-slate-700 border-slate-300`).
  - `CANCELADO`: Vermelho (`red-500` / `bg-red-50 text-red-700 border-red-200`).
- **Lógica de Transições** (SPEC-09 §4.1):
  - A ação **"Confirmar Agendamento"** só é permitida quando o status for `SOLICITADO`.
  - **Check-in e conclusão são etapas separadas**: o check-in por token grava `checkedInAt` e habilita "Marcar realizado"; a transição para `REALIZADO` é uma ação explícita posterior da clínica.
  - `REALIZADO` exige `checkedInAt` preenchido. Busca manual registrada como `checkInMethod: MANUAL`.
  - Reversão `NAO_COMPARECEU` → `REALIZADO` permitida apenas por token (prova de guichê), registrada como `checkInMethod: MANUAL_REVERSAL` + `attendanceDispute: true`.
  - **NUNCA** registre pagamento PIX do paciente nem transite agendamento para `PAGO`.
  - `CANCELADO` é terminal no agendamento. `REALIZADO` e `NAO_COMPARECEU` não recebem estorno no próprio status.
  - Transições devem ser centralizadas em funções puras (`getAvailableActions(status, role)` e `canTransition(from, to, role)`).
  - **Confirmação do paciente** (`patientAttendance`): solicitada apenas para agendamentos com data passada que ainda estejam em `CONFIRMADO_CLINICA`. Se a clínica já marcou `REALIZADO`, o paciente não é questionado.
  - Taxa da plataforma: R$ 5,00 por par `orderId` + `clinicId` ao atingir estado cobrável (`REALIZADO` por padrão). Cobrada à clínica via boleto semanal emitido pela admin em `/admin/cobrancas`. Convênio não isenta a taxa. Estorno pertence ao boleto semanal e somente no modo `FULL_AMOUNT` (Fase B).
- Google Auth e WhatsApp continuam na SPEC-07 / EVOL-005 e não fazem parte da máquina de agendamento.
---

## 5. Estrutura de Catálogo, Procedimentos e Convênios
- **Relacionamento N:N (Serviço x Convênio)**:
  - A seleção de convênios aceitos deve ser feita **por serviço** (`insuranceIds[]`), nunca como configuração genérica da clínica.
  - **Multi-select dinâmico**: `insuranceIds[]` usa os IDs oficiais de `src/data/insurances.js` (ex.: `ins-unimed`, `ins-bradesco`, `ins-cassi`, `ins-particular`), nunca strings livres. Fixtures legadas com IDs sem prefixo devem ser normalizadas na fronteira de leitura antes de chegarem ao serviço, carrinho ou pedido.
- **Campos Obrigatórios de Procedimento**:
  - `name`: Nome legível do exame/consulta.
  - `category` do serviço/catálogo usa os IDs de `SERVICE_CATEGORIES` em `src/constants/catalogConstants.js`: `laboratorio`, `imagem`, `cardiologia`, `consultas`, `outros`. O snapshot de item do carrinho converte para os códigos `LAB`, `IMG`, `CARDIO`, `CONSULT`, `OUTROS`; converta de volta ao domínio de serviço ao criar o agendamento.
  - `privatePrice`: Valor particular (R$).
  - `descriptionPrep`: Instruções de preparo (ex.: "Jejum de 12h"). **Gatilho de UX crítico para evitar no-show**.
  - `tussCode`: Opcional, formato padrão ANS (6 a 8 dígitos numéricos).

---

## 6. Segregação de Perfis e Roteamento (Web vs. Mobile)
- **`ROLE_CLINICA` (Portal Administrativo Web)**:
  - Rota base: `/dashboard/*` envolvida por `ClinicShell.jsx`.
  - Contém: Visão Geral (`/dashboard`), Agenda (`/dashboard/agenda`), Meus Serviços (`/dashboard/servicos`), Financeiro (`/dashboard/financeiro`) e Perfil da Clínica (`/dashboard/perfil`).
- **`ROLE_USUARIO` / Paciente (Fluxo Web e evolução Mobile)**:
  - Rota base: `/paciente/inicio` e `/cadastro-paciente`.
  - **Agendamento**: O fluxo de busca, carrinho e solicitação de agendamentos será implementado primeiro no site (Landing Page / visão Paciente e rotas necessárias), com persistência mock conforme as specs. A experiência equivalente será incorporada ao App Mobile em etapa posterior.
  - A localização customizada para terceiros e o agendamento web são detalhados na SPEC-06. A Landing Page neutra e a separação dos nichos são detalhadas na SPEC-04. Não bloquear um fluxo de agendamento web definido por essas specs com aviso de uso exclusivo do app.
  - A página `/paciente/inicio` mantém boas-vindas, confirmação de cadastro e perfil conforme seu escopo; links para lojas podem apresentar a etapa mobile futura sem substituir nem interromper o fluxo web.
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

- **Fonte da Verdade da API (`docs/api/openapi.yaml`)**:
  - O arquivo `docs/api/openapi.yaml` é a **fonte da verdade da API** entre frontend e backend. Toda e qualquer alteração de endpoints, contratos, payloads ou códigos de erro deve começar obrigatoriamente por ele antes de ser refletida no código ou em specs técnicas (como a SPEC-10). Enquanto o backend não residir em repositório próprio, o arquivo permanece versionado neste repositório do front; caso o backend seja movido no futuro, uma única cópia deve permanecer como fonte da verdade e a outra deve apenas referenciá-la.
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


