### SPEC-05: Credenciamento Completo da Clínica e Moderação Administrativa

* **Status**: PLANEJADO  
* **Data**: 2026-10-07  
* **Documento PRD de Referência**: `docs/prd/checklist-home-clinicle.md`  
* **Especificação Mestre**: Reformulação do Credenciamento B2B e Trava de Aprovacao Admin (Item 2 do Mapeamento)

---

### Diagnóstico: Como está vs. O que será ajustado

| Aspecto | Como está Hoje (`src/pages/ClinicSignupPage.jsx` / `checklist-home-clinicle.md`) | O que será Ajustado (SPEC-05) |
| :--- | :--- | :--- |
| **Identificação Jurídica** | Possui campo único de "Razão Social / Nome da Clínica". | **Separação Explícita**: Exige obrigatoriamente os campos distintos de **Razão Social** (Nome jurídico formal) e **Nome Fantasia** (Nome comercial exibido aos pacientes na vitrine). |
| **Campos do Credenciamento** | Formulário estruturado em etapas contendo CNPJ, e-mail, senha, responsável, telefone, endereço com geolocalização e fotos. | **Preservação Integral**: Todos os campos cadastrais originais são **mantidos em 100%**, garantindo que nenhuma informação técnica ou de contato seja perdida no fluxo. |
| **Status Pós-Credenciamento** | A clínica se cadastra e fica imediatamente ativa e disponível para visualização pública. | **Trava de Moderação Administrativa (`PENDENTE_APROVACAO_ADMIN`)**: Ao concluir o credenciamento e o catálogo de exames, o perfil da clínica entra no status de moderação. |
| **Visibilidade na Vitrine** | A clínica aparece imediatamente nos resultados de busca do aplicativo e site. | **Bloqueio de Vitrine**: A clínica **NÃO é exibida** na busca pública de exames até que o administrador da plataforma (desenvolvedor/gestor do app) altere seu status para `APROVADO`. |
| **Acesso ao Portal da Clínica** | Permite navegação completa no `/dashboard`. | **Navegação Restrita com Banner Explicativo**: A clínica acessa o portal (`/dashboard`), visualiza suas telas e cadastra seus exames, mas um banner informativo permanente alerta que a publicação pública depende de aprovação admin. |

---

#### 1. Contexto, Rota e Arquivos Alvo

* **Objetivo da Tarefa**: Implementar a separação explícita entre **Razão Social** e **Nome Fantasia** no formulário de credenciamento B2B, preservando a totalidade dos dados cadastrais já previstos, e aplicar a camada de **Moderação Administrativa à Parte** (`PENDENTE_APROVACAO_ADMIN`), que impede a publicação da clínica na busca pública antes da aprovação manual pelo administrador da plataforma.
* **Rota(s) da Aplicação**: 
  * `/cadastro-clinica` (Wizard público de credenciamento B2B).
  * `/dashboard/*` (Portal administrativo da clínica logada).
* **Arquivo(s) Alvo**:
  * **Página / View**: `src/pages/ClinicSignupPage.jsx` e `src/pages/ClinicDashboardPage.jsx`
  * **Componentes**:
    * `src/components/clinic/ClinicSignupStepper.jsx` (Ajustado para 4 etapas com ícones e rótulos limpos).
    * `src/components/clinic/ClinicActionBanner.jsx` (Banner de alerta no topo do Dashboard com o estado de moderação).
    * `src/components/common/PasswordInput.jsx` (Reutilizado no formulário de senha da clínica).
  * **Utilitários de Validação**: `src/utils/clinicSignupValidation.js` (Inclusão de validação individual para Razão Social e Nome Fantasia, algoritmo de DV para CNPJ, e-mail e telefone).
  * **Serviços / Storage**: `src/services/clinicService.js` (Gerenciamento do estado `statusAprovacao` e persistência em `gms_clinic_session`).
  * **Hooks**: `src/hooks/useClinicProfile.js` (Integração via TanStack Query sob a chave `['clinic', 'profile']`).

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
| **4. Local & Fotos**| **Endereço Completo** | Sim | Logradouro, número, bairro, cidade (foco Lauro de Freitas/RMS), CEP e coordenadas de geolocalização para o mapa. |
| **4. Local & Fotos**| **Galeria de Fotos** | Sim | Mínimo 1 foto em formato Base64 (Fachada/Capa, Recepção ou Instalações). |
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
   * A API/Mock de busca de exames (`serviceCatalog.js` / `useServices`) filtra estritamente os serviços pertencentes a clínicas cujo `statusAprovacao === 'APROVADO'`.
   * Se o status for `PENDENTE_APROVACAO_ADMIN` ou `REJEITADO`, os exames da clínica não são retornados nas consultas de busca por bairro, convênio ou categoria.

---

#### 3. Fluxo, Navegação e Matriz de Casos Excepcionais

##### 3.1 Fluxo de Navegação do Usuário
1. O gestor acessa `/cadastro-clinica` (seja por link direto ou via botão "Credenciar Minha Clínica" na Landing Page B2B).
2. Preenche os dados jurídicos informando **Razão Social** e **Nome Fantasia** separadamente.
3. Preenche as etapas de acesso, contato e endereço com upload de imagens.
4. Ao clicar em "Concluir Credenciamento":
   * Os dados são armazenados via `clinicService.js`.
   * O status de aprovação é definido como `PENDENTE_APROVACAO_ADMIN`.
   * O sistema dispara notificação via `Toast.jsx`: *"Credenciamento enviado com sucesso! Seu cadastro está em análise."*
   * O gestor é direcionado para a rota `/dashboard`, onde visualiza o banner de moderação pendente.

##### 3.2 Matriz de Tratamento de Erros e Casos Excepcionais

| Cenário Excepcional | Causa / Condição | Comportamento Esperado do Sistema |
| :--- | :--- | :--- |
| **Razão Social igual ao Nome Fantasia** | O usuário digita o mesmo texto nos dois campos. | O sistema aceita sem erros, mas mantém a gravação de ambas as chaves de forma independente. |
| **CNPJ Já Cadastrado** | Tentativa de credenciamento com CNPJ existente no mock/base. | Exibe borda vermelha no campo CNPJ e mensagem via `FormField.jsx`: *"Este CNPJ já está credenciado na plataforma."* |
| **Tentativa de Forçar Exibição Pública sem Aprovação** | Chamada de busca de exames tenta consultar IDs de clínica pendente. | O hook/filtro de serviços descarta os resultados de clínicas não aprovadas, retornando array vazio de exames para o paciente. |
| **Rejeição pelo Administrador** | Administrador marca `statusAprovacao = 'REJEITADO'`. | O banner do dashboard atualiza a mensagem: *"Credenciamento não aprovado. Entre em contato com o suporte para regularizar suas pendências cadastrais."* |

---

#### 4. Critérios de Aceite (Definition of Done)

* [ ] O formulário em `/cadastro-clinica` possui os campos distintos de **Razão Social** e **Nome Fantasia**, ambos com validação de obrigatoriedade.
* [ ] Todos os campos cadastrais originais (CNPJ, E-mail, Senha, Responsável, Telefone, Endereço com Geolocalização, Galeria de Fotos e Termos) permanecem 100% funcionais no wizard.
* [ ] A submissão do credenciamento grava a clínica com o status `statusAprovacao: 'PENDENTE_APROVACAO_ADMIN'`.
* [ ] Ao acessar `/dashboard`, a clínica pendente visualiza o banner `ClinicActionBanner` informando que o cadastro está sob análise administrativa.
* [ ] A busca pública de exames descarta clínicas com status `PENDENTE_APROVACAO_ADMIN`, exibindo na vitrine apenas exames de clínicas com status `APROVADO`.
* [ ] O utilitário `clinicSignupValidation.js` valida o CNPJ por algoritmo de DV e mascara telefone e CNPJ adequadamente.
* [ ] O componente `PasswordInput.jsx` é reutilizado no formulário de senha do credenciamento.
* [ ] Nenhum emoji é utilizado na interface dos formulários ou modais, mantendo ícones vetoriais profissionais.

---

Está pronta a especificação técnica e funcional da **SPEC-05**! Quando quiser, podemos avançar para o **Item 3** (ou para o próximo item da nossa sequência de especificações).