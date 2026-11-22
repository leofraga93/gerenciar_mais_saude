# SPEC-12: Página Quem Somos (/sobre), Identidade Institucional e Jornada do Paciente

- **Status**: CONCLUÍDO
- **Data de Início**: 2026-11-18
- **Data de Conclusão**: 2026-11-18
- **Documento PRD de Referência**: `docs/prd/checklist-landing-page.md` (Seções 2.1, 3.1 e 3.3) e `docs/prd/roadmap-evolucao.md` (EVOL-018)

> **Instrução para a IA/Agente:** Antes de iniciar a implementação, audite este documento contra o checklist da Seção 7. Se houver qualquer campo com `[A DEFINIR]` ou ambiguidade em regras críticas, **NÃO assuma nem implemente**. Questione o desenvolvedor pontualmente no chat.

---

## 1. Contexto, Rota e Localização

- **Objetivo da Tarefa**: Criar a página institucional dedicada `/sobre` (*Quem Somos*, *Nossa História*, *Nosso Compromisso*, propósito e *3 Pilares*), adicionar o acesso *"Quem Somos"* na extremidade direita do cabeçalho e no rodapé da Landing Page, prover retorno direto ao início e atalhos proporcionais para **Paciente** e **Clínica** dentro de `/sobre`, e atualizar os textos da seção *"Informação clara em cada etapa!"* na visão Paciente (`#jornada-paciente`).
- **Rota(s) da Aplicação**:
  - `/sobre` (nova rota pública em `src/App.jsx`)
  - `/` (cabeçalho e rodapé da Landing Page + seção `#jornada-paciente` em `PatientNicheView.jsx`)
- **Arquivo(s) Alvo**:
  - Página / View nova: `src/pages/AboutPage.jsx`
  - Página / View editada: `src/App.jsx`, `src/pages/LandingPage.jsx`
  - Componentes editados: `src/components/landing/PatientNicheView.jsx`
- **Perfil de Acesso (Role)**: `PUBLICO`

---

## 2. Contrato de Dados & Persistência (Mock First)

- **Fonte de Dados Inicial**: Conteúdo institucional estático na própria camada de apresentação (`src/pages/AboutPage.jsx` / `src/components/landing/PatientNicheView.jsx`), sem chamada de API ou persistência local.
- **Query / Mutation Hook**: Não se aplica (conteúdo estático; nenhuma mutação ou estado assíncrono).
- **Query Key**: Não se aplica.
- **Conteúdo Mapeado — Item 1 (`#jornada-paciente` em `PatientNicheView.jsx`)**:
  - Título da seção: `Informação clara em cada etapa!` (sem eyebrow acima do título e sem subtítulo decorativo extra).
  - Passo `01`: **Título**: `Encontre exames e especialistas.` | **Texto**: `Busque por região, convênio, especialidade ou tipo de exame.`
  - Passo `02`: **Título**: `Escolha como e onde quer ser atendido.` | **Texto**: `Compare valores e conheça outras opções de referência para fazer a melhor escolha.`
  - Passo `03`: **Título**: `Prepare-se com tranquilidade.` | **Texto**: `Consulte todas as orientações necessárias para o seu atendimento.`
  - Passo `04`: **Título**: `Pague a taxa de agendamento e acompanhe sua jornada` | **Texto**: `com acesso a todas as informações necessárias para realizar o procedimento escolhido com mais facilidade, tranquilidade, cuidado e segurança que a Gerenciar Mais Saúde oferece.`
  - Frase de encerramento na base da seção (abaixo dos 4 cards): `Viu como é simples e rápido?`
- **Conteúdo Mapeado — Itens 3 e 4 (`/sobre` em `AboutPage.jsx`)**:
  - **Cabeçalho de `/sobre`**: Marca clicável à esquerda retornando para `/` (limpando nicho para entrada neutra via `gms_selected_niche`) + dois botões compactos e proporcionais à direita: **"Sou Paciente"** (`/?nicho=paciente`) e **"Sou Clínica"** (`/?nicho=clinica`).
  - **Bloco 1 — Quem Somos**:
    - Título: `Quem Somos`
    - Subtítulo/chamada de abertura: `Conectando pessoas, facilitando cuidados e transformando a maneira de agendar exames no Brasil.`
    - Texto já confirmado:
      - `A Gerenciar Mais Saúde é uma empresa brasileira que nasceu com um propósito claro: simplificar o acesso aos exames de saúde, aproximando pacientes e clínicas por meio da tecnologia, da praticidade e do cuidado.`
      - `Sabemos que encontrar uma clínica, comparar valores e agendar um exame nem sempre é uma tarefa simples. Muitas vezes, esse processo envolve inúmeras ligações, pesquisas demoradas e dificuldades que geram preocupação, estresse e desgaste emocional, especialmente em momentos em que a saúde exige atenção e agilidade.`
      - `Foi pensando nessa realidade que decidimos transformar uma dificuldade em solução.`
  - **Bloco 2 — Nossa História**:
    - Texto confirmado:
      - `A Gerenciar Mais Saúde surgiu de uma experiência vivida por dois colegas que, ao enfrentarem dificuldades para agendar exames para si mesmos e para familiares próximos, perceberam que aquele problema não era apenas deles, mas uma realidade compartilhada por milhões de brasileiros.`
      - `Dessa experiência nasceu uma pergunta:`
      - `"E se fosse possível encontrar, comparar e agendar exames em diferentes clínicas, de maneira simples, rápida e em um só lugar?"`
      - `Foi assim que uma necessidade real se transformou em uma ideia, e essa ideia deu origem à Gerenciar Mais Saúde.`
      - `Mais do que desenvolver uma plataforma tecnológica, assumimos o compromisso de criar uma solução capaz de facilitar a vida das pessoas, reduzir dificuldades e tornar a jornada de cuidados com a saúde mais tranquila e acessível.`
  - **Bloco 3 — Nosso Compromisso**:
    - Texto introdutório:
      - `Acreditamos que a tecnologia deve aproximar pessoas, simplificar processos e contribuir para uma experiência de cuidado mais humana.`
      - `Por isso, nossa plataforma foi idealizada com base em valores que orientam cada etapa do nosso trabalho:`
    - 4 Valores oficiais (renderizados com ícones `lucide-react`, sem emojis):
      - **Respeito e empatia**: `compreender as necessidades de pacientes e clínicas, valorizando cada pessoa e sua realidade.`
      - **Ética e transparência**: `construir relações baseadas na confiança, na clareza das informações e na responsabilidade.`
      - **Compromisso e segurança**: `oferecer uma experiência de agendamento organizada, confiável e cuidadosa.`
      - **Inovação e praticidade**: `utilizar a tecnologia para reduzir burocracias, economizar tempo e facilitar o acesso aos serviços de saúde.`
    - Missão final do bloco: `Nossa missão é conectar pacientes às clínicas de sua preferência, permitindo consultar opções, comparar informações e realizar agendamentos com mais autonomia e tranquilidade.`
  - **Bloco 4 — Propósito e 3 Pilares (Item 4)**:
    - Frases-chave confirmadas: `Gerenciar Mais Saúde — Conectando pessoas. Simplificando cuidados. Valorizando vidas.` e `Tecnologia para simplificar. Humanidade para cuidar.`
    - **3 Pilares** (apresentados em grid editorial limpo):
      - **Para os pacientes**: `menos burocracia, mais praticidade e tranquilidade.`
      - **Para as clínicas**: `mais visibilidade, novas oportunidades e conexão com pacientes.`
      - **Para a sociedade**: `tecnologia aproximando pessoas e facilitando o acesso aos cuidados com a saúde.`
  - **Rodapé de `/sobre`**: Botão/link com a logo para voltar ao início (`/`) + botões pequenos e proporcionais para **Paciente** (`/?nicho=paciente`) e **Clínica** (`/?nicho=clinica`).

---

## 3. Reuso Mandatório de Componentes (DRY)

- [ ] `FormField.jsx` (não aplicável nesta página de leitura)
- [ ] `Toast.jsx` (não aplicável sem ações assíncronas)
- [ ] `inputClassName` de `src/utils/formUtils.js` (não aplicável)
- [ ] Ícones: exclusivamente `lucide-react` ou `@fortawesome/*` (**zero emojis** — substituir eventuais corações ou marcações do texto do cliente por ícones vetoriais ou texto limpo)
- [ ] Outros: Reaproveitar `brandLogo` (`src/assets/logo-500-sem-fundo.png`) e paleta `emerald-600` / `slate` conforme `AGENTS.md` §3

---

## 4. Máquina de Estados & Regras de Interação

- **Estado Inicial**:
  - Na Landing Page (`/`), o cabeçalho fixo exibe na extremidade direita o link **"Quem Somos"** (`/sobre`) tanto no estado neutro (`NONE`) quanto nos nichos ativos (`PATIENT` e `CLINIC`). O rodapé também exibe **"Quem Somos"** na seção *Navegação Rápida*.
  - Ao abrir `/sobre`, a página renderiza integralmente o conteúdo institucional sem depender de `activeNiche`.
- **Transições Permitidas**:
  - Landing (`/`) — clique em **"Quem Somos"** (cabeçalho ou rodapé) → navega para `/sobre` com rolagem ao topo.
  - `/sobre` — clique na marca/logo (cabeçalho ou rodapé) → limpa `gms_selected_niche` e navega para `/` (entrada neutra).
  - `/sobre` — clique em **"Paciente"** (ou **"Sou Paciente"**) → navega para `/?nicho=paciente`.
  - `/sobre` — clique em **"Clínica"** (ou **"Sou Clínica"**) → navega para `/?nicho=clinica`.
- **Transições Proibidas**:
  - Proibido incluir eyebrows decorativos acima de títulos ou emojis no corpo do texto.
  - Proibido implementar chatbot ou assistente de IA do mascote **Zelo** nesta spec (pertence exclusivamente ao registro futuro `EVOL-018`).
- **Comportamento em Erro / Exceção**:
  - Rotas de navegação diretas funcionam sem dependência de sessão ativa; se nenhuma sessão existir, os botões direcionam normalmente às visões públicas.
- **Feedback Visual**: Estados `hover` e `focus-visible` consistentes com `emerald-600`/`slate-900`.

---

## 5. Anti-Escopo (O que NÃO fazer nesta tarefa)

- [ ] **NÃO** criar endpoint ou backend real.
- [ ] **NÃO** alterar rotas fora de `/sobre` e `/` (`LandingPage.jsx`).
- [ ] **NÃO** utilizar emojis na interface (ex.: remover `💚`, `💙` dos textos originais do cliente).
- [ ] **NÃO** utilizar eyebrows ou subtítulos decorativos repetitivos acima de títulos.
- [ ] **NÃO** implementar o mascote ou chatbot **Zelo** nesta entrega (somente documentado em `EVOL-018`).

---

## 6. Critérios de Aceite Fechados (DoD - Definition of Done)

- [x] A Landing Page (`/`) exibe o link **"Quem Somos"** na extremidade direita do cabeçalho (em todos os estados de nicho) e na seção *Navegação Rápida* do rodapé.
- [x] A rota `/sobre` está registrada em `src/App.jsx` e renderiza `AboutPage.jsx` com o conteúdo completo aprovado (*Quem Somos*, *Nossa História*, *Nosso Compromisso*, propósito e *3 Pilares*).
- [x] Cabeçalho e rodapé de `/sobre` possuem logo clicável para retornar ao início neutro (`/`) e botões compactos proporcionais para **Paciente** (`/?nicho=paciente`) e **Clínica** (`/?nicho=clinica`).
- [x] A seção `#jornada-paciente` em `PatientNicheView.jsx` exibe exatamente o título *"Informação clara em cada etapa!"*, os 4 passos atualizados e a frase de encerramento *"Viu como é simples e rápido?"*, sem emojis e sem eyebrows.
- [x] Nenhum chatbot ou assistente do mascote Zelo é adicionado ao código.
- [x] Linter roda 100% limpo (`lint_applet`).
- [x] Build da aplicação compila com sucesso (`compile_applet`).

---

## 7. Checklist do Gatekeeper (Auto-auditoria da IA antes de codificar)

1. *Os campos de entrada e seus tipos estão 100% claros?* **SIM** — página institucional estática sem inputs de formulário.
2. *As mensagens de erro e estados vazios foram especificados?* **SIM** — navegação pública direta sem estados vazios.
3. *A fonte do mock e chaves de cache do TanStack Query foram informadas?* **SIM** — conteúdo estático sem necessidade de query/cache.
4. *O escopo está livre de termos vagos?* **SIM** — todos os trechos literais da história, dos 4 valores do compromisso, da missão, do propósito e dos 3 pilares estão explicitados na Seção 2.

---

## 8. Fechamento de Ciclo & Rastreabilidade (Obrigatório ao Concluir)

- [x] 1. Marcar todos os checkboxes de Critérios de Aceite (Seção 6) como `[x]`.
- [x] 2. Alterar o cabeçalho desta spec para `Status: CONCLUÍDO` com a data atual.
- [x] 3. Sincronizar `docs/prd/checklist-landing-page.md` (Seções 2.1, 3.1, 3.3 e Mapa Rápido de Status).
