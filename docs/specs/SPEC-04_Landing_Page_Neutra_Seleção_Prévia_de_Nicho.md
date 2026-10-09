### SPEC-04: Landing Page Neutra e Seleção Prévia de Nicho

* **Status**: CONCLUÍDO
* **Data**: 2026-10-07
* **Última revisão**: 2026-10-08 (hierarquia direta de títulos, sem eyebrows decorativos)
* **Data de Conclusão**: 2026-10-08
* **Documento PRD de Referência**: `docs/prd/checklist-landing-page.md`
* **Especificação Mestre**: Reformulação da Entrada Dual (Item 1 do Mapeamento)
* **Perfil de Acesso (Role)**: `PUBLICO`

---

### Diagnóstico: Como está vs. O que será ajustado

| Aspecto | Como está Hoje (`src/pages/LandingPage.jsx`) | O que será Ajustado (SPEC-04) |
| :--- | :--- | :--- |
| **Arquitetura de Entrada** | A página renderiza simultaneamente informações misturadas para clínicas e pacientes em uma única rolagem densa. | **Hub Neutro de Entrada Dual**: A tela inicial é limpa e fluída. Antes de expor cadastros ou buscas densas, apresenta uma escolha explícita de nicho: **"Sou Paciente"** vs **"Sou Clínica"**. |
| **Gerenciamento de Estado** | Estado estático com modais de acesso chamados por botões secundários no cabeçalho. | Estado reativo `activeNiche` (`'NONE'` \| `'PATIENT'` \| `'CLINIC'`). A interface reage dinamicamente ao nicho selecionado sem recarregar a página. |
| **Experiência do Paciente (B2C)** | Busca de exames genérica misturada na página principal. | Ao selecionar **"Sou Paciente"**, a tela renderiza a proposta B2C, busca por nome/código TUSS, vitrine, jornada e depoimentos de pacientes. Localização, carrinho e solicitação de agendamento são responsabilidade da SPEC-06. |
| **Experiência da Clínica (B2B)** | Bloco institucional de clínicas posicionado no meio da página. | Ao selecionar **"Sou Clínica"**, a tela renderiza a proposta B2B focada na gestão da agenda, organização dos atendimentos, recebimento e depoimentos de gestores. Não apresentar métricas comerciais como resultados validados nesta visão; usar benefícios qualitativos. Calculadora de ROI não faz parte desta spec. |
| **Ações de Login / Cadastro** | Botão de login genérico que abre modal com abas manuais. | Botões contextualizados por nicho: no modo Paciente, abre acesso mock ou direciona para `/cadastro-paciente`; no modo Clínica, abre acesso mock ou direciona para `/cadastro-clinica`. Google Auth pertence à SPEC-07. |

#### Decisão de experiência e distribuição do conteúdo

| Estado da página | Conteúdo que aparece | Conteúdo que não aparece neste estado |
| :--- | :--- | :--- |
| **Neutro (`NONE`)** | Cabeçalho institucional fixo e translúcido, marca clicável para `/`, hero institucional com foto Unsplash em tela ampla e camada de contraste, dois cards de escolha, seção de métricas demonstrativas compartilhadas e rodapé institucional comum. | Catálogo, filtros, preços, depoimentos segmentados, formulários extensos e chamadas de agendamento. O primeiro contato deve ser convidativo e não privilegiar um nicho. Métricas devem estar identificadas como ilustrativas até integração com dados consolidados. |
| **Paciente (`PATIENT`)** | Hero B2C com foto Unsplash contextual, busca por nome/código TUSS; catálogo público existente com filtros de categoria, convênio e preço; preparo e valores de referência; passos da jornada do paciente; depoimentos de pacientes; CTAs de cadastro e acesso. A seção do catálogo fica modular para receber a integração da SPEC-06. | Benefícios e depoimentos exclusivos de clínicas. Localização, carrinho e solicitação de agendamento pertencem à SPEC-06. |
| **Clínica (`CLINIC`)** | Hero B2B com foto Unsplash de equipe de saúde; benefícios qualitativos sobre agenda, organização dos atendimentos e recebimento; passos de credenciamento/uso; depoimentos de clínicas; CTA para cadastro e acesso. | Catálogo e filtros de exames, orientação ao paciente e depoimentos exclusivos de pacientes. O credenciamento continua na rota e na SPEC-05. |

Cabeçalho, identidade visual e rodapé são compartilhados. Ao selecionar um nicho, o hero neutro é substituído pela visão correspondente sem recarga; o controle no cabeçalho permite alternar entre as visões.

### Diretrizes visuais desta revisão

* O cabeçalho permanece visível durante a rolagem com `position: sticky`, fundo translúcido e desfoque; o conjunto logo, nome e assinatura institucional é um único link para `/`. Ao clicar, limpa o nicho da URL e de `gms_selected_niche`, retornando ao estado neutro.
* O hero neutro usa uma imagem Unsplash de cuidado em saúde em toda a área, overlay escuro para contraste e cards claros de seleção. A seção de métricas fica logo abaixo do hero.
* Paciente e Clínica recebem imagens Unsplash distintas nos próprios heros, mantendo títulos, descrição e CTAs sobre overlay de contraste.
* Referências usadas: neutro `photo-1576091160399-112ba8d25d1d`; paciente `photo-1559839734-2b71ea197ec2`; clínica `photo-1622253692010-333f2da6031d`. As três imagens vêm do Unsplash e são carregadas por URL.
* Os valores `120+`, `94%` e `4.8/5` são conteúdo demonstrativo estático, não alegações verificadas. Exibir nota explícita informando que serão atualizados após existir base consolidada. A futura fonte de dados será conectada posteriormente, sem backend nesta spec.
* As seções da landing usam títulos diretos, sem eyebrows, slogans ou etiquetas decorativas acima deles. Textos auxiliares permanecem somente quando acrescentam informação concreta.

**Preparação para specs seguintes:** a visão do paciente encapsula o catálogo em uma seção/componente que a SPEC-06 possa conectar ao carrinho. Nesta etapa não criar localização, carrinho, estados de pedido ou fluxo de agendamento. A SPEC-06 define o contrato e o payload do item selecionado. O modal contextual é criado/adaptado nesta SPEC-04 sem Google Auth; a SPEC-07 adiciona a opção Google sem duplicar o modal. O cadastro de clínica é responsabilidade da SPEC-05.

---

#### 1. Contexto, Rota e Arquivos Alvo

* **Objetivo da Tarefa**: Reestruturar a Landing Page como um hub de entrada neutro e convidativo. Primeiro apresenta uma promessa institucional comum e deixa explícita a escolha entre Paciente e Clínica. Após a escolha, substitui o conteúdo inicial por uma experiência dedicada, sem misturar catálogo B2C e benefícios B2B.
* **Rota(s) da Aplicação**: `/` (Rota pública inicial em `App.jsx`).
* **Arquivo(s) Alvo**:
  * **Página Principal**: `src/pages/LandingPage.jsx`
  * **Novos Componentes de Nicho**:
    * `src/components/landing/NeutralHeroSelector.jsx` (Hero neutro, promessa institucional e cards de decisão).
    * `src/components/landing/PatientNicheView.jsx` (Visão B2C: busca por nome/TUSS, vitrine/filtros existentes, jornada e depoimentos; ponto de extensão para SPEC-06).
    * `src/components/landing/ClinicNicheView.jsx` (Visão B2B: proposta de valor, benefícios de gestão/agenda, jornada e depoimentos; sem calculadora de ROI nesta spec).
    * `src/components/landing/NicheSegmentedControl.jsx` (Seletor rápido/mudar de perfil no topo da página).
  * **Componentes Existentes Adaptados**:
    * `src/components/landing/AuthModal.jsx` (Abre no contexto de nicho correto; Google Auth é acrescentado na SPEC-07).
    * `src/components/landing/TestimonialsCarousel.jsx` (Recebe a audiência ativa e mostra somente depoimentos daquele público).
    * `src/components/catalog/PriceRangeFilter.jsx` e `FilterButtonGroup.jsx` (Reutilizados na visão do paciente).
  * **Roteamento & Hooks**: `src/App.jsx`, `src/hooks/useNicheSelection.js` (gerenciamento e persistência temporária da escolha no `sessionStorage`).

---

## 2. Contrato de Dados & Persistência (Mock First)

* **Fonte do catálogo**: `STANDARD_PROCEDURES_CATALOG` em `src/data/standardCatalog.js`; leitura estática, sem chamada de API.
* **Item apresentado no card**: `{ id: string, name: string, category: string, tussCode?: string, suggestedPrivatePrice?: number, suggestedInsuranceIds?: string[], suggestedDuration?: number, suggestedPrep?: string }`.
* **Estado da seleção**: `activeNiche: 'NONE' | 'PATIENT' | 'CLINIC'`; persistência de `'PATIENT' | 'CLINIC'` na chave `gms_selected_niche` do `sessionStorage`.
* **Leitura de cadastros**: `getRegisteredPatient()` e `getRegisteredClinic()`; `useQuery` com chave `['landing', 'registered-profiles']`. A seleção de nicho é síncrona e não exige mutation/query.
* **Modal de acesso**: `AuthModal` recebe `audience: 'patient' | 'clinic'`, `onClose`, `onGoToSignup` e `onSubmit({ email: string, password: string })`. A autenticação segue mock.

### 2.1 Mapeamento de Estados da Tela e Exibição Condicional

##### 2.1 Mapeamento de Estados da Tela e Exibição Condicional

```text
                                     Landing Page (/)
                                            │
                       ┌────────────────────┴────────────────────┐
                       ▼                                         ▼
            Estado: activeNiche = 'NONE'               Nicho Ativo Selecionado
            Exibe NeutralHeroSelector                  Exibe NicheSegmentedControl
            ("Sou Paciente" vs "Sou Clínica")          (Permite alternar a qualquer momento)
                                                                 │
                                       ┌─────────────────────────┴─────────────────────────┐
                                       ▼                                                   ▼
                           activeNiche = 'PATIENT'                             activeNiche = 'CLINIC'
                           Renderiza PatientNicheView                          Renderiza ClinicNicheView
```

| Estado (`activeNiche`) | Componente Principal Renderizado | Conteúdo e Funcionalidades Expostas | Ações de Entrada (CTAs) |
| :--- | :--- | :--- | :--- |
| **`'NONE'`** | `NeutralHeroSelector.jsx` | Promessa institucional unificada sobre imagem de fundo, dois cards de decisão e seção compartilhada de métricas demonstrativas. Sem catálogo ou depoimentos segmentados. | **"Sou Paciente"** e **"Sou Clínica"**, que selecionam o respectivo nicho. |
| **`'PATIENT'`** | `PatientNicheView.jsx` | Busca por nome/TUSS; catálogo e filtros existentes de categoria, convênio e preço; preparo e valores de referência; jornada e depoimentos de pacientes. Catálogo modular para integração futura da SPEC-06. | **"Cadastre-se"** (`/cadastro-paciente`) e **"Entrar"** (abre `AuthModal` no contexto Paciente). Google Auth é SPEC-07; localização, carrinho e agendamento web são SPEC-06. |
| **`'CLINIC'`** | `ClinicNicheView.jsx` | Proposta B2B, benefícios qualitativos sobre agenda/no-show/recebimento, jornada de credenciamento e depoimentos de clínicas. Não exibir números sem fonte nem calculadora de ROI. | **"Credenciar Minha Clínica"** (`/cadastro-clinica`, fluxo SPEC-05) e **"Acessar Portal"** (abre `AuthModal` no contexto Clínica). |

### 2.2 Regras de Negócio da Interface
1. **Persistência de Escolha**: Ao selecionar um nicho, o valor (`PATIENT` ou `CLINIC`) é salvo no `sessionStorage` sob a chave `gms_selected_niche`. Na entrada, um parâmetro de URL válido (`paciente` ou `clinica`) tem precedência e atualiza a sessão; sem parâmetro válido, restaura-se a sessão; sem ambos, inicia em `NONE`. Valores inválidos de URL/storage são ignorados. Se retornar do cadastro, o nicho previamente escolhido é mantido.
2. **Alternância Fluída**: No topo do cabeçalho, quando um nicho estiver ativo, o componente `NicheSegmentedControl` exibirá uma chave seletora discreta: `[ Paciente | Clínica ]`, permitindo que o usuário mude de visão instantaneamente sem precisar voltar ao estado neutro inicial.
3. **Harmonia Visual (`index.css`)**: Rigorosa observância da paleta institucional — verde esmeralda (`emerald-600`) para destaques de saúde/ações primárias do paciente e azul cobalto/slate (`slate-800` / `blue-600`) para ações corporativas da clínica. Proibição estrita de emojis na interface.

### 2.3 Contrato de Estado e Componentes

* `activeNiche`: string restrita a `'NONE' | 'PATIENT' | 'CLINIC'`.
* URL: `?nicho=paciente` mapeia para `PATIENT`; `?nicho=clinica` mapeia para `CLINIC`. A comparação não diferencia maiúsculas/minúsculas. Query válida prevalece sobre `sessionStorage`; sem query válida, usar valor válido de `gms_selected_niche`; sem valor válido, usar `NONE`. Valor inválido não deve causar erro nem alterar a URL.
* Persistência: toda seleção explícita de `PATIENT` ou `CLINIC` atualiza `gms_selected_niche`. `NONE` não é persistido; o link da marca remove a chave, remove o parâmetro `nicho` ao navegar para `/` e retorna à entrada neutra.
* `NeutralHeroSelector`: recebe `onSelectNiche(niche)` e só pode emitir `PATIENT` ou `CLINIC`.
* `NicheSegmentedControl`: recebe `value` (`PATIENT | CLINIC`) e `onChange(niche)`; permite alternar entre os dois nichos. Não oferece uma terceira aba neutra.
* `PatientNicheView` e `ClinicNicheView`: recebem apenas callbacks de navegação/abertura necessários e não leem nem escrevem `sessionStorage` diretamente.
* `TestimonialsCarousel`: recebe `audience` (`'patient' | 'clinic'`) e renderiza apenas registros daquele `type`; não mostra a opção `all` quando usado nas visões segmentadas.
* `AuthModal`: instância única, recebe `audience` (`'patient' | 'clinic'`), `onClose` e `onSubmit({ email: string, password: string })`. Ao abrir, o formulário e o destino mock correspondem à audiência; paciente continua para `/paciente/inicio` com e-mail no `location.state`, e clínica para `/dashboard`. O submit permanece mock nesta spec; Google é SPEC-07.
* Atalho de sessão/cadastro mock: consumir `getRegisteredPatient()` e `getRegisteredClinic()` dos serviços existentes. Nome do paciente vem de `fullName`; nome da clínica de `tradeName`. Destinos: `/paciente/inicio` e `/dashboard`. O texto deve dizer "Continue como [nome]" e não alegar autenticação real. Sem registro, não renderizar o bloco. Com ambos, apresentar as duas ações no mesmo bloco, sem redirecionar automaticamente.

## 3. Reuso Mandatório de Componentes (DRY)

* Reutilizar `CatalogFilters` e os componentes existentes `PriceRangeFilter`/`FilterButtonGroup` do diretório `src/components/catalog/` na visão Paciente; manter fonte e formato do catálogo `STANDARD_PROCEDURES_CATALOG`.
* Reutilizar `TestimonialsCarousel` com a prop `audience`; não criar uma segunda implementação de carrossel nem duplicar os dados de depoimentos.
* Reutilizar `Toast.jsx` para feedback visual necessário; não criar sistema paralelo de notificação.
* Não criar componentes de campo nesta spec: a busca de nome/TUSS integra o catálogo existente. Se surgir campo com validação, reutilizar `FormField` e `inputClassName`.

## 4. Máquina de Estados & Regras de Interação

| Estado atual | Evento | Próximo estado | Efeito |
| :--- | :--- | :--- | :--- |
| `NONE` | Selecionar "Sou Paciente" | `PATIENT` | Atualiza estado e `gms_selected_niche`; renderiza a visão Paciente. |
| `NONE` | Selecionar "Sou Clínica" | `CLINIC` | Atualiza estado e `gms_selected_niche`; renderiza a visão Clínica. |
| `PATIENT` | Escolher Clínica no seletor | `CLINIC` | Atualiza estado e storage sem recarga. |
| `CLINIC` | Escolher Paciente no seletor | `PATIENT` | Atualiza estado e storage sem recarga. |
| Qualquer estado | A URL muda para um valor válido | Nicho da URL | URL prevalece e a seleção é persistida. |
| Qualquer estado | URL/storage inválido ou ausente | Valor válido já resolvido; senão `NONE` | Ignora valor inválido; sem seleção válida, mantém a entrada neutra. |

O clique na marca é a transição explícita de qualquer nicho para `NONE`: limpa o valor persistido e navega para `/` sem query de nicho. A página não autentica usuários nem submete agendamentos.

---

### 4.1 Fluxo, Navegação e Matriz de Casos Excepcionais

#### 4.1.1 Fluxo de Navegação do Usuário
1. O usuário acessa a raiz do sistema (`/`).
2. Se não houver nicho no `sessionStorage`, a página carrega no estado neutro (`'NONE'`).
3. O usuário clica em **"Sou Paciente"**:
   * O estado transita suavemente para `'PATIENT'`.
   * A tela exibe busca por nome/TUSS, vitrine/filtros existentes, jornada e depoimentos B2C.
   * Se o paciente clicar em "Cadastre-se", é direcionado para a rota `/cadastro-paciente`.
   * A localização, o carrinho e o agendamento no site serão ligados na SPEC-06; o catálogo permanece encapsulado para essa integração.
4. O usuário clica em **"Sou Clínica"**:
   * O estado transita suavemente para `'CLINIC'`.
   * A tela exibe os benefícios operacionais qualitativos B2B, sem os números sem fonte definida.
   * Se o gestor clicar em "Credenciar Minha Clínica", é direcionado para a rota `/cadastro-clinica`.

#### 4.1.2 Matriz de Tratamento de Erros e Casos Excepcionais

| Cenário Excepcional | Causa / Condição | Comportamento Esperado do Sistema |
| :--- | :--- | :--- |
| **Navegação Direta com Parâmetro na URL** | Usuário acessa `/?nicho=paciente` ou `/?nicho=clinica` vindo de um link externo ou campanha de marketing. | O hook `useNicheSelection` lê a *query string*, valida o valor e define automaticamente o estado `activeNiche` correspondente, ignorando a tela neutra. |
| **Alternância de Nicho com Modal Aberto** | Usuário troca de nicho no `NicheSegmentedControl` enquanto o modal de login está visível. | O modal atualiza dinamicamente sua aba interna para corresponder ao novo nicho selecionado. |
| **Cadastro/Sessão Mock Existente** | Existe registro em `gms:clinic:registered` ou `gms_patient_session`. | A Landing Page lê os registros existentes por `getRegisteredClinic()` e `getRegisteredPatient()`. Se houver um registro, mostra atalho "Continue como [nome]" com destino correspondente (`/dashboard` ou `/paciente/inicio`), sem afirmar que houve autenticação real. Se houver ambos, mostra as duas opções em um bloco compacto, sem escolher uma conta automaticamente. A ausência de registro não impede a navegação pública. |

## 5. Anti-Escopo (O que NÃO fazer nesta tarefa)

* Não implementar localização/autocomplete para terceiros, geolocalização, ranking por distância, carrinho, seleção de datas/períodos, submissão ou confirmação de agendamento. Esses itens pertencem à SPEC-06; o fluxo será no site, com evolução mobile posterior.
* Não adicionar Google Auth nesta etapa; pertence à SPEC-07 e será conectado ao mesmo `AuthModal`.
* Não implementar autenticação real, API, backend, banco de dados ou calculadora/claims de ROI.
* Não mover o credenciamento para dentro da landing; o CTA navega para `/cadastro-clinica`, cujo fluxo pertence à SPEC-05.
* Não exibir simultaneamente conteúdo de Paciente e Clínica após a escolha, nem catálogo/depoimentos segmentados no estado neutro.

---

## 6. Critérios de Aceite Fechados (DoD - Definition of Done)

* [x] A rota `/` renderiza a tela neutra inicial quando nenhum nicho está selecionado.
* [x] O componente `NeutralHeroSelector.jsx` exibe os dois cards fluídos ("Sou Paciente" e "Sou Clínica") sem poluição visual e sem emojis.
* [x] O estado neutro contém promessa institucional, escolhas de perfil, métricas demonstrativas identificadas como ilustrativas e elementos globais compartilhados; não exibe catálogo ou depoimentos segmentados.
* [x] Clicar em "Sou Paciente" carrega a visão B2C (`PatientNicheView.jsx`) com busca por nome/TUSS, vitrine/filtros existentes, jornada e depoimentos de pacientes.
* [x] Clicar em "Sou Clínica" carrega a visão B2B (`ClinicNicheView.jsx`) com benefícios de gestão, jornada e depoimentos de clínicas, sem calculadora de ROI.
* [x] O componente `NicheSegmentedControl.jsx` permite alternar entre as duas visões a qualquer momento no cabeçalho.
* [x] O parâmetro `?nicho=paciente` ou `?nicho=clinica` na URL força o carregamento direto do nicho correspondente.
* [x] O botão "Cadastre-se" no modo Paciente redireciona corretamente para `/cadastro-paciente`.
* [x] O botão "Credenciar Minha Clínica" no modo Clínica redireciona corretamente para `/cadastro-clinica`.
* [x] A seleção do nicho é salva no `sessionStorage` e mantida durante a navegação do usuário.
* [x] Um parâmetro de nicho válido na URL prevalece sobre a sessão; sem parâmetro válido, a seleção salva é restaurada e valores inválidos são ignorados.
* [x] O modal de autenticação (`AuthModal.jsx`) abre automaticamente na aba correspondente ao nicho ativo na tela.
* [x] Sessões mock de clínica/paciente são reconhecidas pelas funções/chaves existentes e exibem atalhos para os destinos corretos; quando ambas existem, ambas as opções permanecem disponíveis.
* [x] Cabeçalho e rodapé são compartilhados, enquanto alternar o nicho substitui a área principal sem misturar conteúdo B2B e B2C.
* [x] O catálogo do paciente permanece modular para a SPEC-06, sem localização, carrinho ou submissão de agendamento nesta spec.
* [x] Google Auth (SPEC-07) e credenciamento da clínica (SPEC-05) não são duplicados nesta implementação.
* [x] O cabeçalho permanece fixo e translúcido durante a rolagem; logo, nome e assinatura formam um único link para `/`.
* [x] Clicar no link da marca a partir de qualquer nicho limpa a seleção persistida e retorna à landing neutra, removendo o parâmetro `nicho` da URL.
* [x] O hero neutro ocupa uma área ampla com imagem Unsplash, texto e cards de escolha legíveis; paciente e clínica têm imagens contextuais em seus heros.
* [x] A seção neutra apresenta `120+`, `94%` e `4.8/5` como valores demonstrativos e informa que a fonte será substituída após a integração de dados reais.
* [x] A landing neutra e a visão de Clínica não usam eyebrows decorativos; os títulos identificam diretamente a seção e sua finalidade.

## 7. Checklist do Gatekeeper (Auto-auditoria antes de codificar)

1. Campos e tipos da interface/props estão definidos: **Sim** — nicho, audience, props do modal e campos do catálogo estão descritos na Seção 2.
2. Erros e estados vazios estão especificados: **Sim** — valores de URL/storage inválidos, catálogo sem resultados, validação do modal e sessões mock estão cobertos.
3. Fonte mock e query key estão definidas: **Sim** — catálogo estático e `['landing', 'registered-profiles']` na Seção 2.
4. O escopo evita expressões vagas para regras críticas: **Sim** — responsabilidades das SPEC-04/05/06/07 e anti-escopo estão separados.

## 8. Fechamento de Ciclo & Rastreabilidade

* [x] 1. Após lint e build positivos, marcar os critérios verificados da Seção 6 como concluídos.
* [x] 2. Atualizar este cabeçalho para `Status: CONCLUÍDO` e preencher a data de conclusão.
* [x] 3. Sincronizar o checklist e mapa executivo em `docs/prd/checklist-landing-page.md`.
