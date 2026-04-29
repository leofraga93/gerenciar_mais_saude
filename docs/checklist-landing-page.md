# Checklist - Landing Page (Gerenciar Mais Saude)

## 1) O que ja foi feito (concluido)

- [x] Estrutura base da landing page criada em React (`src/App.jsx`).
- [x] Estilizacao com Tailwind CSS aplicada (`src/index.css` + classes utilitarias na tela).
- [x] Header com identidade visual da marca e CTA principal "Acessar sistema".
- [x] Secao Hero com proposta de valor e foco em clinicas.
- [x] Secao de beneficios com mensagens de escala, organizacao e reducao de no-show.
- [x] Secao de metricas de desempenho (cards com dados de exemplo).
- [x] Secao de depoimentos (cards com prova social).
- [x] Secao final de CTA ("Credenciar clinica").
- [x] Modal de credenciamento/login implementado (abertura e fechamento por estado local).
- [x] Campos de e-mail e senha com validacao basica de formulario no frontend (`required`, `type="email"`, `minLength`).
- [x] Link/acao para direcionar ao fluxo de cadastro da clinica (`/cadastro-clinica`).
- [x] Base responsiva inicial com uso de grid e breakpoints (`md`, `lg`, `sm`).

## 2) O que esta sendo feito / em preparacao

- [ ] Integracao real do formulario de login com backend de autenticacao.
- [ ] Estruturacao do fluxo de credenciamento completo da clinica.
- [ ] Refinamento de copia/textos com foco total no publico B2B (clinicas).
- [ ] Evolucao da LP para entrada no portal autenticado da clinica.

> Evidencia no codigo atual: texto no modal indica "Integracao com backend em preparacao" e o submit do formulario ainda nao dispara API.

## 3) O que ainda precisa ser atendido (proximas entregas)

### 3.1 Autenticacao e regras de negocio

- [ ] Implementar chamada ao endpoint de autenticacao no submit.
- [ ] Tratar estados de loading/sucesso/erro no envio do login.
- [ ] Armazenar JWT com estrategia definida (localStorage/cookie seguro).
- [ ] Validar role retornada pela API (permitir `ROLE_CLINICA`).
- [ ] Bloquear acesso web para `ROLE_USUARIO` e orientar para app mobile.
- [ ] Redirecionar para `/dashboard` apos login bem-sucedido.
- [ ] Exibir mensagens de erro amigaveis sem stack trace.

### 3.2 Arquitetura e qualidade de codigo

- [ ] Quebrar `App.jsx` em componentes menores (Header, Hero, Beneficios, Metricas, Depoimentos, CTA, ModalLogin).
- [ ] Padronizar dados mock em arquivos separados (ex.: `data/metrics.js`, `data/testimonials.js`).
- [ ] Preparar camada de servicos para API (ex.: `services/authService.js`).
- [ ] Adotar TanStack Query para chamadas assicronas de autenticacao.
- [ ] Incluir testes basicos de renderizacao e interacao dos CTAs/modais.

### 3.3 UX, acessibilidade e continuidade

- [ ] Garantir acessibilidade completa do modal (foco inicial, foco preso, `Esc`, retorno de foco ao fechar).
- [ ] Revisar microcopys e ortografia para consistencia da comunicacao.
- [ ] Validar rotas de destino (`/cadastro-clinica` e `/dashboard`) para evitar navegacao quebrada.
- [ ] Definir analytics/eventos para medir conversao dos CTAs da landing page.
- [ ] Documentar criterio de "pronto" da landing para transicao ao proximo modulo.

## 4) Mapa rapido de status (visao executiva)

- **Concluido:** estrutura visual da landing + modal de acesso.
- **Em andamento:** preparacao para integracao backend/autenticacao.
- **Pendente critico:** login real, controle por role, persistencia JWT e redirecionamento seguro.

## 5) Sugestao de uso deste checklist

- Atualizar semanalmente os itens com data e responsavel.
- Quando um item for finalizado, mover de `[ ]` para `[x]`.
- Se um item iniciar execucao, marcar como "em andamento" no titulo da secao ou com observacao.
- Manter este arquivo como referencia unica para continuidade da landing page.
