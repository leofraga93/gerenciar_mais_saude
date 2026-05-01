# Checklist - Landing Page Hub (Clinicas + Pacientes)

Base de comparacao: regras atualizadas em `docs/.cursorrulesIndexPage`.

## 1) O que foi feito e continua atendendo

- [x] Estrutura base da landing em React criada (`src/pages/LandingPage.jsx`; `src/App.jsx` concentra o roteador).
- [x] Estilizacao com Tailwind aplicada e arquivo de estilo global existente (`src/index.css`).
- [x] Header, Hero, secoes de beneficios, metricas, depoimentos e CTA final implementados.
- [x] Modal de acesso existente com abertura/fechamento por estado local.
- [x] Campos de login (e-mail/senha) com validacao basica de formulario.
- [x] Responsividade inicial com breakpoints (`sm`, `md`, `lg`).

## 2) O que foi feito, mas precisa reavaliacao (mudanca de escopo)

- [x] Posicionamento da pagina ainda esta orientado principalmente para clinicas. (reavaliado e ajustado para Clinicas + Pacientes)
- [x] Texto de proposta de valor nao reflete ainda a frase unificada definida pelo cliente. (ajustado no Hero)
- [x] CTAs atuais nao estao separados em "Sou Clinica" (primario) e "Sou Paciente" (secundario). (ajustado no Header/Hero/CTA final)
- [x] Modal atual nao diferencia claramente entrada de clinica versus paciente. (ajustado com selecao por perfil)
- [x] Fluxo de acesso atual nao contempla jornada web inicial do paciente (boas-vindas + links para app). (ajustado no modal do paciente)
- [x] CTA de credenciamento atual reforca apenas clinica e precisa balanceamento para os dois publicos. (ajustado com dupla entrada)

## 3) O que esta em preparacao (ja sinalizado no projeto)

- [ ] Integracao do formulario de acesso com backend de autenticacao.
- [x] Evolucao do fluxo de entrada para direcionar usuario por perfil (role).

> Evidencia atual: integracao backend segue em preparacao; o submit do modal navega por perfil escolhido na aba (mock): Clinica → `/dashboard`, Paciente → `/paciente/inicio`. Quando houver API, o destino deve seguir `role` retornado pelo token, mantendo essas rotas como padrao.

## 4) Novos ajustes necessarios para aderir ao documento atualizado

### 4.1 Conversao dual (clinica + paciente)

- [x] Atualizar proposta de valor para: "Saude sem burocracia para quem cuida e para quem precisa."
- [x] Criar comunicacao equilibrada entre beneficios de clinicas e beneficios de pacientes.
- [x] Incluir secao/estrutura dedicada ao publico paciente (agendamento facil, transparencia de preco, busca por convenio).
- [x] Manter secao/estrutura dedicada ao publico clinica (no-show, agenda, recebimento via PIX).

> Observacao 4.1: beneficios dos dois publicos estao na mesma secao do Hero (`Beneficios para os dois publicos`, dois cards). Se quiser aderencia literal a "secoes" separadas mais abaixo na pagina, evoluir com blocos dedicados adicionais.

### 4.2 CTAs e entrada

- [x] Implementar dois CTAs distintos no Header/Hero (`LandingPage.jsx`: header + hero).
- [x] Botao primario "Sou Clinica" (fundo esmeralda).
- [x] Botao secundario/contorno "Sou Paciente" (contorno / CTA final em contorno).
- [x] Revisar CTA final para nao direcionar somente um publico (dois botoes na faixa final).

### 4.3 Modal inteligente e cadastro paciente

- [x] Evoluir para modal unico com selecao clara: "Acesso Clinica" vs "Acesso Paciente" (abas no modal em `LandingPage.jsx`).
- [ ] Adicionar cadastro basico de paciente na web (Nome, CPF, E-mail, Telefone) — hoje so login e-mail/senha.
- [ ] Manter validacoes de campos e mensagens de erro amigaveis — hoje apenas `required` / `minLength` nativos do HTML, sem mensagens customizadas.

### 4.4 Fluxo por role e continuidade da jornada

- [ ] Implementar autenticacao via API (e-mail/senha).
- [x] Se `ROLE_CLINICA`: redirecionar para `/dashboard` — **mock:** aba clínica + submit → `DashboardPage.jsx` (papel real virá da API).
- [x] Se `ROLE_USUARIO`: exibir boas-vindas + links App Store/Play Store — **mock:** `PatientWelcomePage.jsx`.
- [x] Se `ROLE_USUARIO`: permitir visualizacao basica de perfil no web e bloquear agendamento (somente app) — **mock:** mesma pagina (perfil basico + aviso de agendamento só no app).
- [ ] Definir persistencia de token e estados de loading/sucesso/erro.

### 4.5 Arquitetura e padrao tecnico

- [ ] Componentizar conforme diretriz: `HeroClinic.jsx`, `HeroPatient.jsx`, `AuthModal.jsx` (landing e modal ainda em `LandingPage.jsx`).
- [x] Quebrar `App.jsx` para reduzir acoplamento — `App.jsx` só com `BrowserRouter` + rotas; landing em `pages/LandingPage.jsx`, areas logadas em `pages/DashboardPage.jsx` e `pages/PatientWelcomePage.jsx`.
- [ ] Preparar camada de servicos de autenticacao e adotar TanStack Query (dependencia ainda nao no `package.json`).
- [x] Garantir aderencia visual as definicoes de `src/index.css` em todos os estados (hover/active) — uso coerente de classes Tailwind com `hover:` / `transition` no fluxo atual (revisar quando novos componentes forem extraidos).

## 5) Mapa rapido de status (apos comparacao com novas regras)

- **Atende:** base visual da landing, secoes (beneficios dual, metricas, depoimentos, CTA final), CTAs duplos, modal com abas clinica/paciente, responsividade inicial, rotas `/`, `/dashboard`, `/paciente/inicio`, proposta de valor e conversao dual (4.1), itens 4.2, parte da 4.5 (`App` enxuto + paginas).
- **Parcial:** fluxo por role (UX e rotas mock; sem token nem `role` da API), validacao de formulario (só nativa), aderencia visual/index.css (ok no codigo atual; validacao fina quando extrair componentes).
- **Nao atende ainda:** integracao com backend e autenticacao real (secao 3 e 4.4 item API), cadastro web de paciente com Nome/CPF/Telefone (4.3), servico de auth + TanStack Query (4.5), arquivos `HeroClinic.jsx` / `HeroPatient.jsx` / `AuthModal.jsx`.

## 6) Rotina de acompanhamento

- Atualizar este checklist a cada ajuste concluido.
- Marcar `[x]` apenas quando houver evidencia em codigo/teste.
- Manter os itens de "reavaliacao" visiveis ate a migracao completa para a Landing Page Hub.
