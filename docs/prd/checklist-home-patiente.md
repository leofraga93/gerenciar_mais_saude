# Checklist - Credenciamento do Paciente (Web & Ponte Mobile)

Base de comparação: `docs/checklist-landing-page.md`, `docs/checklist-home-clinicle.md` e requisitos de negócio B2B2C (`ROLE_USUARIO`).

**Escopo desta fase:** Front-end visual + Mock Data + Reaproveitamento de componentes e utilitários.  
**Fora de escopo agora:** Banco de dados PostgreSQL, `fetch`/`axios` real, integração com API Spring Boot, persistência de token backend.  
**Preparar desde já:** Contratos de dados, `src/data/patientProfile.js`, `src/services/patientService.js`, hooks compatíveis com TanStack Query (`usePatientProfile.js`).

**Última revisão:** Auditoria completa de status (o que já está pronto vs. a ser implementado) e padronização visual com o checklist da clínica.

**Fase atual:** Estrutura base de Landing e Boas-Vindas preliminar existente; Wizard `/cadastro-paciente`, contratos de mock do paciente e perfil read-only pendentes.  
**Próxima entrega:** Wizard de Credenciamento em 3 etapas (`/cadastro-paciente`) + Utilitários de CPF/Idade + Mocks e Hooks do Paciente (`patientService.js` / `usePatientProfile.js`).

---

## Visão do fluxo de entrada do paciente

```text
Landing (/) ──► Modal / CTA "Cadastre-se" ──► Wizard Paciente (/cadastro-paciente)
    [x]                     [ ]                               [ ]
                                                               │
                                                               ▼
App Mobile (Agendamento) ◄── Orientação / QR Code ◄── Boas-Vindas Web (/paciente/inicio)
          [x]                      [ ]                               [x]* (dados estáticos)
```

| Etapa | Objetivo | Status |
|---|---|---|
| **Landing Page** | Porta de entrada com modal/botões de acesso (`ROLE_USUARIO`). | **Concluído** (login mock existente; link para cadastro pendente) |
| **Cadastro Paciente** | Wizard em 3 etapas focado em alta conversão (`/cadastro-paciente`). | **Pendente** |
| **Boas-Vindas Web** | Recepção pós-cadastro com dados do perfil (`/paciente/inicio`). | **Parcial** (tela existe com texto estático; perfil dinâmico pendente) |
| **Ponte Mobile** | Direcionamento para download nas lojas e aviso de agendamento mobile. | **Concluído** (CTAs App Store / Play Store existentes; QR Code pendente) |

---

## 1) O que já temos (Reaproveitável da Estrutura Existente)

- [x] **Hub de Entrada Dual:** Landing page com modal de acesso por abas (Clínica vs. Paciente) e redirecionamento mock para `/paciente/inicio` (`src/pages/LandingPage.jsx`).
- [x] **Identidade Visual:** Padrão global de cores, tipografia e utilitários configurados em `src/index.css` (Tailwind CSS, paleta esmeralda, slate e estados visuais).
- [x] **Componente FormField:** Estrutura reutilizável para rótulos, mensagens de erro acessíveis e bordas vermelhas de alerta (`src/components/common/FormField.jsx`).
- [x] **Componente Toast:** Sistema de notificações flutuantes para sucesso e alertas (`src/components/common/Toast.jsx`).
- [x] **Catálogo Mestre de Convênios:** Base em `src/data/insurances.js` disponível para seleção multi-select de planos de saúde.
- [x] **Página de Boas-Vindas Preliminar:** Interface `src/pages/PatientWelcomePage.jsx` na rota `/paciente/inicio` com mensagens iniciais e CTAs para lojas de aplicativos.
- [x] **Bloqueio Explícito de Agendamento na Web:** Mensagem clara informando que a marcação de consultas e exames é realizada exclusivamente no aplicativo móvel.
- [ ] **Componente PasswordInput Reutilizável:** Atualmente embutido dentro de `ClinicSignupPage.jsx` — pendente extrair para `src/components/common/PasswordInput.jsx` para reaproveitamento direto no paciente.
- [ ] **Utilitários de Validação do Paciente:** Funções específicas de CPF (máscara + validação DV) e idade mínima (18+) a serem centralizadas em `src/utils/patientSignupValidation.js`.
- [ ] **CTA de Cadastro de Paciente na Landing:** Inclusão de botão ou link "Criar conta de paciente" na Landing Page e no modal de autenticação.

---

## 2) Wizard de Credenciamento do Paciente (`/cadastro-paciente`)

Wizard simplificado em 3 etapas, focado em alta taxa de conversão e baixa desistência.

### 2.1 Mapeamento de Campos e Regras de Validação

| Campo | Etapa | Obrigatório | Regras de Validação / Máscara | Status UI |
|---|---|:---:|---|:---:|
| **Nome Completo** | 1. Dados Pessoais | Sim | Nome + Sobrenome (mín. 2 palavras), apenas letras e espaços | [ ] |
| **CPF** | 1. Dados Pessoais | Sim | 11 dígitos com validação de algoritmo DV; máscara `formatCpf` (`000.000.000-00`) | [ ] |
| **Data de Nascimento** | 1. Dados Pessoais | Sim | Data válida; usuário deve ter pelo menos 18 anos (`>= 18 anos`) | [ ] |
| **E-mail** | 2. Acesso & Contato | Sim | Formato válido de e-mail (RFC), máximo 254 caracteres | [ ] |
| **Senha** | 2. Acesso & Contato | Sim | Mínimo 8 caracteres, contendo letras e números | [ ] |
| **Confirmação de Senha** | 2. Acesso & Contato | Sim | Deve ser idêntica ao campo Senha | [ ] |
| **Telefone / Celular** | 2. Acesso & Contato | Sim | DDD válido (BR) + 9 dígitos; máscara `formatPhone` (`(00) 90000-0000`) | [ ] |
| **Planos de Saúde** | 3. Saúde & Aceite | Opcional | Multi-select com a lista mestre de convênios (`src/data/insurances.js`) + opção "Particular" | [ ] |
| **Termos & Privacidade** | 3. Saúde & Aceite | Sim | Checkbox obrigatório de aceite dos termos LGPD e consentimento | [ ] |

### 2.2 Regras de UX e Navegação da Wizard

- [ ] **Indicador de Progresso:** Barra ou passos numerados no topo (`1. Dados Pessoais` ──► `2. Acesso & Contato` ──► `3. Saúde & Aceite`).
- [ ] **Validação onBlur:** Validar cada input assim que o usuário muda de campo, fornecendo feedback imediato.
- [ ] **Bloqueio por Etapa:** O botão "Continuar" só avança se a etapa atual estiver totalmente preenchida e válida.
- [ ] **Foco Automático:** Ao ocorrer erro ou ao avançar de etapa, posicionar o foco no primeiro campo da tela.
- [ ] **Revalidação no Submit:** Ao clicar em "Concluir Cadastro", revalidar todo o formulário e retornar à etapa correspondente se houver pendência.
- [ ] **Interação com PasswordInput:** Aplicar o padrão de segurar/pressionar o ícone do olho para revelar e soltar para ocultar a senha.

---

## 3) Contratos de Dados Mock & Gerenciamento de Estado

Assim como estruturado na clínica, preparar contratos de dados mock e hooks compatíveis com TanStack Query para consumo local.

### 3.1 Arquivos e Serviços Mock

- [ ] **`src/data/patientProfile.js`:** Objeto mock com dados padrão do paciente (Nome, CPF formatado/mascarado, e-mail, telefone, lista de `insuranceIds` vinculados).
- [ ] **`src/services/patientService.js`:**
  - `registerPatient(data)`: Simula o cadastro do paciente e salva no `sessionStorage` / `localStorage`.
  - `getPatientProfile()`: Recupera os dados do paciente cadastrado ou o mock padrão.
  - `clearPatientSession()`: Limpa a sessão ao realizar logout.
- [ ] **Hook `usePatientProfile` (`src/hooks/usePatientProfile.js`):**
  - Query gerenciada via `@tanstack/react-query` para carregar dados do paciente.
  - Mutation `useRegisterPatient` com atualização da sessão local e redirecionamento para `/paciente/inicio`.

---

## 4) Área do Paciente Pós-Credenciamento (`/paciente/inicio`)

Após concluir o cadastro na web, o paciente entra no ambiente de boas-vindas com o perfil pré-carregado.

### 4.1 Visualização e Conexão Mobile

- [ ] **Banner de Boas-Vindas Dinâmico:** Mensagem personalizada *"Olá, [Nome do Paciente]! Seu cadastro foi realizado com sucesso."* (lendo do `patientService`).
- [ ] **Perfil Read-Only (`PatientProfileCard.jsx`):** Card com a exibição dos dados cadastrados (Nome, CPF mascarado `***.456.789-**`, E-mail, Telefone e Convênios vinculados).
- [x] **Seção "Baixe o app" (Ponte Mobile):** Botões com CTAs para download na App Store e Google Play já implementados.
- [ ] **Destaque Visual "Sua Saúde no Bolso":** Bloco explicativo contextualizando que a busca de exames, o mapa interativo de clínicas e a taxa de agendamento via PIX (R$ 5,00) acontecem no app mobile.
- [ ] **QR Code Visual Dinâmico:** Imagem ou SVG de QR Code para escaneamento rápido direto pela câmera do celular.
- [ ] **Bloqueio Amigável com Modal/Aviso:** Ao interagir com qualquer link de agendamento na web, exibir modal ou toast explicativo orientando a abrir o app mobile.

---

## 5) Segurança, LGPD e Padrões de Código

- [ ] **Proteção de Dados Sensíveis (LGPD):** O CPF deve ser mascarado em exibições públicas (`***.456.789-**`) e a senha nunca deve ser armazenada em texto plano no estado local.
- [ ] **Segregação por Role (`ROLE_USUARIO`):** Se um paciente logado tentar acessar qualquer rota do portal da clínica (`/dashboard/*`), deve ser redirecionado para `/paciente/inicio`.
- [x] **Tratamento de Feedback (`Toast.jsx`):** Sistema pronto para exibição de alertas visuais para "Cadastro realizado com sucesso!", "Sessão encerrada" ou mensagens de validação.

---

## 6) Mapa de Status (Visão Executiva)

| Módulo / Funcionalidade | Status | Arquivo de Referência | Detalhes / Ação |
|---|:---:|---|---|
| **Rota `/cadastro-paciente`** | **Pendente** | `src/App.jsx` | Adicionar rota pública no roteador |
| **Wizard de Cadastro (3 etapas)** | **Pendente** | `src/pages/PatientSignupPage.jsx` | Criar página com stepper e validação por etapa |
| **Utilitários de CPF & Idade** | **Pendente** | `src/utils/patientSignupValidation.js` | Criar `formatCpf`, validação DV e `>= 18 anos` |
| **Componente `PasswordInput`** | **Pendente** | `src/components/common/PasswordInput.jsx` | Extrair de `ClinicSignupPage` para reuso |
| **Mock `patientProfile.js`** | **Pendente** | `src/data/patientProfile.js` | Dados iniciais do paciente |
| **Serviço `patientService.js`** | **Pendente** | `src/services/patientService.js` | `registerPatient`, `getPatientProfile`, `clearSession` |
| **Hook `usePatientProfile`** | **Pendente** | `src/hooks/usePatientProfile.js` | Query + Mutation TanStack Query |
| **Tela de Boas-Vindas (`/paciente/inicio`)** | **Parcial** | `src/pages/PatientWelcomePage.jsx` | Conectar aos dados do paciente cadastrado |
| **Card Perfil Read-Only** | **Pendente** | `src/components/patient/PatientProfileCard.jsx` | Exibir Nome, CPF mascarado, Telefone, Planos |
| **Ponte Mobile (Lojas)** | **Concluído** | `src/pages/PatientWelcomePage.jsx` | CTAs App Store e Google Play ativos |
| **QR Code para Download** | **Pendente** | `src/pages/PatientWelcomePage.jsx` | Adicionar elemento visual de escaneamento |
| **CTA Paciente na Landing** | **Pendente** | `src/pages/LandingPage.jsx` | Botão/link direto para `/cadastro-paciente` |

---

## 7) Ordem de Implementação Recomendada

```text
1. Componente comum PasswordInput.jsx (extrair para src/components/common)
2. Utilitários de validação (src/utils/patientSignupValidation.js com CPF e idade)
3. Contratos de dados (src/data/patientProfile.js + src/services/patientService.js)
4. Hook TanStack Query (src/hooks/usePatientProfile.js)
5. Wizard de Credenciamento (src/pages/PatientSignupPage.jsx em 3 etapas)
6. Roteamento em src/App.jsx (/cadastro-paciente) + CTA na LandingPage
7. Perfil Read-Only e QR Code na Boas-Vindas (src/pages/PatientWelcomePage.jsx)
8. Proteção de rotas mock (segregação ROLE_CLINICA vs ROLE_USUARIO)
```

---

## 8) Dicas do Tech Lead para Execução

1. **Reaproveitamento de Pills/Convênios:** Na Etapa 3 (Planos de Saúde), utilize os mesmos IDs de convênios definidos em `src/data/insurances.js` (ex: `unimed`, `bradesco`, `particular`). Quando o paciente for para o mobile, esses IDs já estarão salvos no perfil para filtragem automática da rede credenciada.
2. **Componente FormField:** Use o `src/components/common/FormField.jsx` para todos os campos do wizard, garantindo coerência visual e mensagens de erro no mesmo padrão da clínica.
3. **Máscaras Dinâmicas:** O campo de telefone deve reaproveitar `formatPhone` de `src/utils/clinicSignupValidation.js`, enquanto o CPF usará o novo `formatCpf`.
4. **Armazenamento de Sessão:** Ao submeter o cadastro do paciente, armazene os dados em `sessionStorage` com chave padronizada (ex: `gms_patient_session`), possibilitando que a tela `/paciente/inicio` recupere imediatamente o nome e dados preenchidos.

---

## 9) Referências Cruzadas

| Documento / Arquivo | Uso |
|---|---|
| `docs/checklist-landing-page.md` | Landing Page, vitrine e acesso |
| `docs/checklist-home-clinicle.md` | Padrão arquitetural, rotas e componentes compartilhados |
| `src/App.jsx` | Configuração de rotas web |
| `src/pages/LandingPage.jsx` | Porta de entrada e modal de login dual |
| `src/pages/PatientWelcomePage.jsx` | Destino pós-cadastro e ponte mobile |
| `src/data/insurances.js` | Lista mestre de convênios |
| `src/components/common/FormField.jsx` | Estrutura de campos com label e erros |
| `src/components/common/Toast.jsx` | Alertas e feedbacks flutuantes |