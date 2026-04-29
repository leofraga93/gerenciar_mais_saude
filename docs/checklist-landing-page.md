# Checklist - Landing Page Hub (Clinicas + Pacientes)

Base de comparacao: regras atualizadas em `docs/.cursorrulesIndexPage`.

## 1) O que foi feito e continua atendendo

- [x] Estrutura base da landing em React criada (`src/App.jsx`).
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
- [ ] Evolucao do fluxo de entrada para direcionar usuario por perfil (role).

> Evidencia atual: o modal indica que a integracao backend esta em preparacao e o submit ainda nao chama API.

## 4) Novos ajustes necessarios para aderir ao documento atualizado

### 4.1 Conversao dual (clinica + paciente)

- [ ] Atualizar proposta de valor para: "Saude sem burocracia para quem cuida e para quem precisa."
- [ ] Criar comunicacao equilibrada entre beneficios de clinicas e beneficios de pacientes.
- [ ] Incluir secao/estrutura dedicada ao publico paciente (agendamento facil, transparencia de preco, busca por convenio).
- [ ] Manter secao/estrutura dedicada ao publico clinica (no-show, agenda, recebimento via PIX).

### 4.2 CTAs e entrada

- [ ] Implementar dois CTAs distintos no Header/Hero:
- [ ] Botao primario "Sou Clinica".
- [ ] Botao secundario/contorno "Sou Paciente".
- [ ] Revisar CTA final para nao direcionar somente um publico.

### 4.3 Modal inteligente e cadastro paciente

- [ ] Evoluir para modal unico com selecao clara: "Acesso Clinica" vs "Acesso Paciente".
- [ ] Adicionar cadastro basico de paciente na web (Nome, CPF, E-mail, Telefone).
- [ ] Manter validacoes de campos e mensagens de erro amigaveis.

### 4.4 Fluxo por role e continuidade da jornada

- [ ] Implementar autenticacao via API (e-mail/senha).
- [ ] Se `ROLE_CLINICA`: redirecionar para `/dashboard`.
- [ ] Se `ROLE_USUARIO`: exibir boas-vindas + links App Store/Play Store.
- [ ] Se `ROLE_USUARIO`: permitir visualizacao basica de perfil no web e bloquear agendamento (somente app).
- [ ] Definir persistencia de token e estados de loading/sucesso/erro.

### 4.5 Arquitetura e padrao tecnico

- [ ] Componentizar conforme diretriz: `HeroClinic.jsx`, `HeroPatient.jsx`, `AuthModal.jsx`.
- [ ] Quebrar `App.jsx` para reduzir acoplamento e facilitar manutencao.
- [ ] Preparar camada de servicos de autenticacao e adotar TanStack Query.
- [ ] Garantir aderencia visual as definicoes de `src/index.css` em todos os estados (hover/active).

## 5) Mapa rapido de status (apos comparacao com novas regras)

- **Atende:** base visual da landing, estrutura geral de secoes, modal inicial e responsividade de partida.
- **Parcial:** autenticacao (estrutura existe, mas sem integracao real e sem roteamento por role).
- **Nao atende ainda:** cadastro web completo de paciente, autenticacao real via API e fluxo completo por `ROLE_USUARIO`.

## 6) Rotina de acompanhamento

- Atualizar este checklist a cada ajuste concluido.
- Marcar `[x]` apenas quando houver evidencia em codigo/teste.
- Manter os itens de "reavaliacao" visiveis ate a migracao completa para a Landing Page Hub.
