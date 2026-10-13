### SPEC-05: Credenciamento Completo da Clínica e Moderação Administrativa

* **Status**: EM ANDAMENTO
* **Data**: 2026-10-07
* **Última revisão**: 2026-10-12 (etapas 1–5 concluídas; EVOL-006 adiado)
* **Documento PRD de Referência**: `docs/prd/checklist-home-clinicle.md`
* **Especificação Mestre**: Reformulação do Credenciamento B2B e Trava de Aprovacao Admin (Item 2 do Mapeamento)

---

### Diagnóstico: Como está vs. O que será ajustado

| Aspecto | Como está Hoje (`src/pages/ClinicSignupPage.jsx` / `checklist-home-clinicle.md`) | O que será Ajustado (SPEC-05) |
| :--- | :--- | :--- |
| **Identificação Jurídica** | Possui campo único de "Razão Social / Nome da Clínica". | **Separação Explícita**: Exige obrigatoriamente os campos distintos de **Razão Social** (Nome jurídico formal) e **Nome Fantasia** (Nome comercial exibido aos pacientes na vitrine). |
| **Campos do Credenciamento** | O wizard mantém sua estrutura atual; fotos ficam no perfil. | **Alteração desta SPEC**: separar Razão Social e Nome Fantasia, sem mover endereço, coordenadas ou galeria para o wizard. |
| **Status Pós-Credenciamento** | A clínica se cadastra e fica imediatamente ativa e disponível para visualização pública. | **Trava de Moderação Administrativa (`PENDENTE_APROVACAO_ADMIN`)**: Ao concluir o credenciamento e o catálogo de exames, o perfil da clínica entra no status de moderação. |
| **Visibilidade na Vitrine** | A clínica aparece imediatamente nos resultados de busca do aplicativo e site. | **Bloqueio de Vitrine**: A clínica **NÃO é exibida** na busca pública de exames até que o administrador da plataforma (desenvolvedor/gestor do app) altere seu status para `APROVADO`. |
| **Acesso ao Portal da Clínica** | Permite navegação completa no `/dashboard`. | **Navegação Restrita com Banner Explicativo**: A clínica acessa o portal (`/dashboard`), visualiza suas telas e cadastra seus exames, mas um banner informativo permanente alerta que a publicação pública depende de aprovação admin. |

---

#### 1. Contexto, Rota e Arquivos Alvo

* **Objetivo da Tarefa**: Separar Razão Social e Nome Fantasia no wizard vigente, registrar clínicas para moderação mock e controlar sua publicação pública por status; endereço/coordenadas e fotos mantêm as áreas e comportamentos atuais.
* **Rota(s) da Aplicação**: 
  * `/cadastro-clinica` (Wizard público de credenciamento B2B).
  * `/dashboard/*` (Portal administrativo da clínica logada).
* **Arquivo(s) Alvo**:
  * **Página / View**: `src/pages/ClinicSignupPage.jsx`, `src/pages/clinic/ClinicDashboardPage.jsx` e `src/pages/clinic/ClinicProfilePage.jsx`
  * **Componentes**:
    * `src/components/clinic/ClinicSignupStepper.jsx` (Ajustado para 4 etapas com ícones e rótulos limpos).
    * `src/components/clinic/ClinicActionBanner.jsx` (Banner de alerta no topo do Dashboard com o estado de moderação).
    * `src/components/common/PasswordInput.jsx` (Reutilizado no formulário de senha da clínica).
  * **Utilitários de Validação**: `src/utils/clinicSignupValidation.js` (Inclusão de validação individual para Razão Social e Nome Fantasia, algoritmo de DV para CNPJ, e-mail e telefone).
  * **Serviços / Storage**: `src/services/clinicService.js` (Gerenciamento do estado `statusAprovacao`, perfil e persistência mock); a sessão credenciada usa a chave `gms:clinic:registered`, definida em `src/constants/clinicStorage.js`.

---

#### 2. Ação e Regras de Negócio (Especificação Detalhada)

##### 2.1 Mapeamento de Campos e Regras de Validação (`/cadastro-clinica`)

| Etapa | Campo | Obrigatoriedade | Regra de Validação / Máscara |
| :--- | :--- | :--- | :--- |
| **1. Jurídico** | **Razão Social** | Sim | Mínimo 3 e máximo 200 caracteres, deve conter letras e representar o nome jurídico formal. |
| **1. Jurídico** | **Nome Fantasia** | Sim | Mínimo 3 e máximo 200 caracteres. Este será o nome exibido nos cards da vitrine pública de exames. |
| **1. Jurídico** | **CNPJ** | Sim | 14 dígitos brutos. Sanitiza, valida o algoritmo de Dígitos Verificadores (DV) e aplica a máscara `00.000.000/0000-00`. |
| **2. Acesso** | **E-mail Administrativo** | Sim | Formato de e-mail RFC válido, máximo 254 caracteres. |
| **2. Acesso** | **Senha / Confirmação** | Sim | Mínimo 8 caracteres contendo letras e números. Utiliza o `PasswordInput.jsx` (segurar ícone do olho para revelar). |
| **3. Contato** | **Nome do Responsável** | Sim | Nome completo (mínimo 2 palavras: Nome + Sobrenome), apenas letras e espaços. |
| **3. Contato** | **Telefone / WhatsApp** | Sim | DDD válido (Brasil) + telefone fixo (10 dígitos) ou celular (11 dígitos), com máscara `(00) 00000-0000`. |
| **3. Contato** | **Código de Indicação** | Opcional | 4 a 30 caracteres alfanuméricos + hífen. |
| **Perfil** | **Endereço e coordenadas** | Conforme fluxo vigente | Manter comportamento atual; não adicionar novas exigências ao wizard nesta SPEC. |
| **Perfil** | **Galeria de Fotos** | Conforme perfil vigente | Gerenciar em `/dashboard/perfil`; não mover para o wizard. |
| **4. Aceite** | **Termos & LGPD** | Sim | Checkbox obrigatório de consentimento. |

##### 2.2 Fluxo de Moderação e Ciclo de Vida da Aprovação

```text
       Formulário /cadastro-clinica Concluído
                          │
                          ▼
        statusAprovacao = 'PENDENTE_APROVACAO_ADMIN'
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
Acesso ao Portal /dashboard       Busca Pública de Exames
Permitido (com banner de alerta)   BLOQUEADO (Invisível na vitrine)
         │                                 │
         └────────────────┬────────────────┘
                          │
         Aprovação pelo Administrador do App
                          │
                          ▼
          statusAprovacao = 'APROVADO'
      (Aparece na vitrine pública de exames)
```

1. **Estado Inicial**: Toda clínica recém-cadastrada recebe automaticamente o campo `statusAprovacao: 'PENDENTE_APROVACAO_ADMIN'`.
2. **Experiência Interna (Portal `/dashboard`)**:
   * O gestor consegue navegar por todas as rotas do portal: `/dashboard/agenda`, `/dashboard/servicos`, `/dashboard/financeiro` e `/dashboard/perfil`.
   * Um banner fixo `ClinicActionBanner` é renderizado no topo do painel:  
     *"Cadastro em análise: Sua clínica e catálogo de exames estão sob verificação da administração da plataforma. Os exames ficarão visíveis para agendamento dos pacientes assim que o credenciamento for aprovado."*
3. **Regra de Filtro da Vitrine Pública**:
   * Quando a busca consumir serviços vinculados a cadastros de clínicas, deve retornar somente serviços de clínicas com `statusAprovacao === 'APROVADO'`.
   * Enquanto a vitrine usar o catálogo mock demonstrativo sem vínculo com cadastros, preservar essas ofertas; o filtro por moderação está adiado em EVOL-006.

---

#### 3. Fluxo, Navegação e Matriz de Casos Excepcionais

##### 3.1 Fluxo de Navegação do Usuário
1. O gestor acessa `/cadastro-clinica` (seja por link direto ou via botão "Credenciar Minha Clínica" na Landing Page B2B).
2. Preenche os dados jurídicos informando **Razão Social** e **Nome Fantasia** separadamente.
3. Preenche as etapas atuais de acesso, contato e aceite; endereço/coordenadas e fotos continuam nas áreas vigentes, incluindo o perfil autenticado.
4. Ao clicar em "Concluir Credenciamento":
   * Os dados são armazenados via `clinicService.js`.
   * O status de aprovação é definido como `PENDENTE_APROVACAO_ADMIN`.
   * O sistema dispara notificação via `Toast.jsx`: *"Credenciamento enviado com sucesso! Seu cadastro está em análise."*
   * O gestor é direcionado para a rota `/dashboard`, onde visualiza o banner de moderação pendente.

##### 3.2 Matriz de Tratamento de Erros e Casos Excepcionais

| Cenário Excepcional | Causa / Condição | Comportamento Esperado do Sistema |
| :--- | :--- | :--- |
| **Razão Social igual ao Nome Fantasia** | O usuário digita o mesmo texto nos dois campos. | O sistema aceita sem erros, mas mantém a gravação de ambas as chaves de forma independente. |
| **CNPJ duplicado** | Não haverá checagem de unicidade na fase mock. | Adiar a consulta de duplicidade à futura base de dados; manter validação local do formato e DV. |
| **Tentativa de Forçar Exibição Pública sem Aprovação** | Chamada de busca de exames tenta consultar IDs de clínica pendente. | O hook/filtro de serviços descarta os resultados de clínicas não aprovadas, retornando array vazio de exames para o paciente. |
| **Rejeição pelo Administrador** | Administrador marca `statusAprovacao = 'REJEITADO'`. | O banner do dashboard atualiza a mensagem: *"Credenciamento não aprovado. Entre em contato com o suporte para regularizar suas pendências cadastrais."* |

---

#### 4. Critérios de Aceite (Definition of Done)

* [x] O formulário em `/cadastro-clinica` possui os campos distintos de **Razão Social** e **Nome Fantasia**, ambos com validação de obrigatoriedade.
* [ ] As etapas e os campos atuais do wizard permanecem funcionais; endereço/coordenadas seguem no fluxo vigente e as fotos continuam no perfil `/dashboard/perfil`, sem inclusão de novos campos dessas áreas no wizard.
* [x] A submissão do credenciamento grava a clínica com o status `statusAprovacao: 'PENDENTE_APROVACAO_ADMIN'`.
* [x] Ao acessar `/dashboard`, a clínica pendente visualiza o banner `ClinicActionBanner` informando que o cadastro está sob análise administrativa.
* [ ] **Adiado (EVOL-006):** quando a busca consumir serviços vinculados a cadastros de clínicas, descartar clínicas sem status `APROVADO`, preservando as ofertas mock demonstrativas atuais.
* [x] O utilitário `clinicSignupValidation.js` valida o CNPJ por algoritmo de DV e mascara telefone e CNPJ adequadamente.
* [x] O componente `PasswordInput.jsx` é reutilizado nos campos de senha do credenciamento.
* [ ] Nenhum emoji é utilizado na interface dos formulários ou modais, mantendo ícones vetoriais profissionais.

---


---

#### Adendo de decisões do Gatekeeper e plano de execução

Este adendo consolida decisões posteriores e prevalece sobre trechos anteriores desta SPEC que indiquem regras divergentes.

##### Decisões de escopo confirmadas

* O wizard mantém suas etapas e comportamento atuais. Nesta SPEC, a alteração cadastral obrigatória é separar Razão Social (`legalName`) e Nome Fantasia (`tradeName`), ambos obrigatórios. O Nome Fantasia é o nome público da clínica.
* Endereço e coordenadas mantêm o fluxo/fallback já existente; não adicionar novas exigências de endereço ou geolocalização ao wizard nesta etapa. A galeria de fotos continua no perfil autenticado da clínica (`/dashboard/perfil`).
* A verificação de CNPJ duplicado fica fora do mock e será implementada com a futura base de dados. O CNPJ continua sujeito à validação local de formato e dígitos verificadores.
* O cadastro novo inicia como `PENDENTE_APROVACAO_ADMIN`. Enquanto pendente, suspenso (`SUSPENSO`) ou rejeitado (`REJEITADO`), a clínica pode acessar o dashboard, mas seus serviços não aparecem na vitrine. Somente `APROVADO` publica serviços.
* A entrada administrativa será um link simples em Navegação Rápida, no rodapé da landing page, que abre o modal de credenciais.
* Este escopo não cria backend nem banco de dados; status e sessão administrativa usam armazenamento mock conforme a arquitetura do projeto.

##### Plano de execução por etapas

1. Fechar o contrato do acesso administrativo mock e as transições de moderação nesta SPEC.
2. Adicionar o link administrativo em Navegação Rápida no rodapé da landing, abrir o modal de credenciais e proteger a rota/página `/admin/clinicas`.
3. Separar Razão Social e Nome Fantasia no wizard, validação, resumo e persistência do cadastro, preservando as etapas e os demais fluxos existentes.
4. Persistir o estado de moderação no serviço/hook de clínica e exibir banners coerentes para pendente, suspenso e rejeitado.
5. Implementar listagem e ações administrativas para aprovar, suspender e rejeitar clínicas.
6. **Adiada:** filtrar serviços de clínicas cadastradas pelo status quando houver uma fonte de catálogo vinculada a esses cadastros; preservar as ofertas mock demonstrativas atuais até lá (EVOL-006).
7. Sincronizar este DoD e `docs/prd/checklist-home-clinicle.md`; executar lint e build e conferir os fluxos ponta a ponta.

##### Critérios de aceite adicionais

* [x] O rodapé da landing oferece o link simples "Acesso administrativo" em Navegação Rápida, abrindo o modal de credenciais.
* [x] A rota `/admin/clinicas` é acessível somente com sessão mock administrativa.
* [x] O painel lista clínicas cadastradas e permite aprovar, suspender e rejeitar cada uma, persistindo as mudanças mock.
* [ ] Quando a busca consumir serviços de clínicas cadastradas, somente clínicas com `statusAprovacao: 'APROVADO'` terão seus serviços exibidos; o catálogo demonstrativo atual deve continuar disponível para apresentações.
* [x] Cadastro pendente e estados suspenso/rejeitado mantêm acesso ao portal e exibem aviso apropriado.
* [x] A checagem de CNPJ duplicado permanece explicitamente adiada à integração com a base persistida.

##### Contrato definido para o acesso administrativo mock

Contrato definido: o modal da landing valida o usuario `gerir_e_confiar` e a senha `admin500!`; em sucesso grava `gms_admin_authenticated` em `sessionStorage` e navega para `/admin/clinicas`. A rota verifica a sessao e redireciona para `/` quando ausente. A validacao e demonstrativa no frontend, nao seguranca real; autenticacao protegida pertence a etapa backend.

#### Andamento

Etapas 1 (escopo), 2 (entrada admin), 3 (campos jurídicos separados), 4 (persistência do status e avisos no dashboard) e 5 (listagem e ações administrativas de moderação) concluídas. A etapa 6 está adiada: o catálogo público permanece com os dados mock para apresentações. O filtro será retomado quando os serviços públicos vierem de cadastros de clínicas, preservando as ofertas demonstrativas atuais (EVOL-006). Portanto, a SPEC-05 ainda não está concluída.

#### Status

A SPEC-05 permanece EM ANDAMENTO. As etapas 1–5 estão concluídas; a etapa 6 está adiada como EVOL-006 até que a busca use serviços vinculados a cadastros de clínicas. Os critérios de aceite de preservação do wizard e de interface sem emojis ainda exigem conferência final.

### Acompanhamento posterior (fora do escopo concluído)

- A refatoração de `ClinicSignupPage` para reutilizar `FormField` e `formUtils` está mapeada em EVOL-007; a padronização de chamadas assíncronas com TanStack Query está em EVOL-008.
- A mensagem de validação do nome fantasia e as alegações quantitativas da visão clínica estão em EVOL-009.
- Esses itens são débitos de manutenção posteriores e não reabrem os critérios funcionais concluídos desta SPEC. A implementação deverá ter SPEC própria quando priorizada.
