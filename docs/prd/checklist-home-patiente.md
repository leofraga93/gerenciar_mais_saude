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
    [x]                     [x]                               [x]
                                                               │
                                                               ▼
App Mobile (Agendamento) ◄── Orientação / QR Code ◄── Boas-Vindas Web (/paciente/inicio)
          [x]                      [ ]                               [x]
```

| Etapa | Objetivo | Status |
|---|---|---|
| **Landing Page** | Porta de entrada com modal/botões de acesso (`ROLE_USUARIO`). | **Concluído** (login mock e botão para cadastro de paciente) |
| **Cadastro Paciente** | Wizard em 3 etapas focado em alta conversão (`/cadastro-paciente`). | **Concluído** |
| **Boas-Vindas Web** | Recepção pós-cadastro com dados do perfil (`/paciente/inicio`). | **Concluído** (perfil dinâmico conectado via TanStack Query) |
| **Ponte Mobile** | Direcionamento para download nas lojas e aviso de agendamento mobile. | **Concluído** (CTAs App Store / Play Store existentes) |

---

## 1) O que já temos (Reaproveitável da Estrutura Existente)

- [x] **Hub de Entrada Dual:** Landing page com modal de acesso por abas (Clínica vs. Paciente) e redirecionamento mock para `/paciente/inicio` (`src/pages/LandingPage.jsx`).
- [x] **Identidade Visual:** Padrão global de cores, tipografia e utilitários configurados em `src/index.css` (Tailwind CSS, paleta esmeralda, slate e estados visuais).
- [x] **Componente FormField:** Estrutura reutilizável para rótulos, mensagens de erro acessíveis e bordas vermelhas de alerta (`src/components/common/FormField.jsx`).
- [x] **Componente Toast:** Sistema de notificações flutuantes para sucesso e alertas (`src/components/common/Toast.jsx`).
- [x] **Catálogo Mestre de Convênios:** Base em `src/data/insurances.js` disponível para seleção multi-select de planos de saúde.
- [x] **Página de Boas-Vindas Preliminar:** Interface `src/pages/PatientWelcomePage.jsx` na rota `/paciente/inicio` com mensagens iniciais e CTAs para lojas de aplicativos.
- [x] **Bloqueio Explícito de Agendamento na Web:** Mensagem clara informando que a marcação de consultas e exames é realizada exclusivamente no aplicativo móvel.
- [x] **Componente PasswordInput Reutilizável:** Extraído para `src/components/common/PasswordInput.jsx` para reaproveitamento direto no paciente e na clínica.
- [x] **Utilitários de Validação do Paciente:** Funções específicas de CPF (máscara + validação DV) e idade mínima (18+) centralizadas em `src/utils/patientSignupValidation.js`.
- [x] **CTA de Cadastro de Paciente na Landing:** Inclusão de botão "Criar conta de paciente (Cadastre-se)" no modal de autenticação.

---

## 2) Wizard de Credenciamento do Paciente (`/cadastro-paciente`)

Wizard simplificado em 3 etapas, focado em alta taxa de conversão e baixa desistência.

### 2.1 Mapeamento de Campos e Regras de Validação

| Campo | Etapa | Obrigatório | Regras de Validação / Máscara | Status UI |
|---|---|:---:|---|:---:|
| **Nome Completo** | 1. Dados Pessoais | Sim | Nome + Sobrenome (mín. 2 palavras), apenas letras e espaços | [x] |
| **CPF** | 1. Dados Pessoais | Sim | 11 dígitos com validação de algoritmo DV; máscara `formatCpf` (`000.000.000-00`) | [x] |
| **Data de Nascimento** | 1. Dados Pessoais | Sim | Data válida; usuário deve ter pelo menos 18 anos (`>= 18 anos`) | [x] |
| **E-mail** | 2. Acesso & Contato | Sim | Formato válido de e-mail (RFC), máximo 254 caracteres | [x] |
| **Senha** | 2. Acesso & Contato | Sim | Mínimo 8 caracteres, contendo letras e números | [x] |
| **Confirmação de Senha** | 2. Acesso & Contato | Sim | Deve ser idêntica ao campo Senha | [x] |
| **Telefone / Celular** | 2. Acesso & Contato | Sim | DDD válido (BR) + 9 dígitos; máscara `formatPhone` (`(00) 90000-0000`) | [x] |
| **Planos de Saúde** | 3. Saúde & Aceite | Opcional | Multi-select com a lista mestre de convênios (`src/data/insurances.js`) + opção "Particular" | [x] |
| **Termos & Privacidade** | 3. Saúde & Aceite | Sim | Checkbox obrigatório de aceite dos termos LGPD e consentimento | [x] |

### 2.2 Regras de UX e Navegação da Wizard

- [x] **Indicador de Progresso Limpo e Objetivo:** Barra com passos interativos (`PatientSignupStepper.jsx`) contendo ícone vetorial da etapa, número do passo e título conciso (removendo textos secundários desnecessários como "Nome, CPF...", alinhando simetria com a clínica).
- [x] **Validação onBlur:** Validar cada input assim que o usuário muda de campo, fornecendo feedback imediato.
- [x] **Bloqueio por Etapa:** O botão "Continuar" só avança se a etapa atual estiver totalmente preenchida e válida.
- [x] **Foco Automático:** Ao ocorrer erro ou ao avançar de etapa, posicionar o foco no primeiro campo com erro.
- [x] **Revalidação no Submit:** Ao clicar em "Concluir Cadastro", revalidar todo o formulário e retornar à etapa correspondente se houver pendência.
- [x] **Transição Suave sem Bloqueios:** Correção do balão de alerta/toast que aparecia em branco e bloqueava a tela na transição pós-cadastro.
- [x] **Interação com PasswordInput:** Aplicar o padrão de segurar/pressionar o ícone do olho para revelar e soltar para ocultar a senha.

---

## 3) Contratos de Dados Mock & Gerenciamento de Estado

Assim como estruturado na clínica, preparar contratos de dados mock e hooks compatíveis com TanStack Query para consumo local.

### 3.1 Arquivos e Serviços Mock

- [x] **`src/data/patientProfile.js`:** Objeto mock com dados padrão do paciente (Nome, CPF formatado/mascarado, e-mail, telefone, lista de `insuranceIds` vinculados).
- [x] **`src/services/patientService.js`:**
  - `registerPatient(data)`: Simula o cadastro do paciente e salva no `sessionStorage` (`gms_patient_session`).
  - `getPatientProfile()`: Recupera os dados do paciente cadastrado ou o mock padrão.
  - `clearRegisteredPatient()`: Limpa a sessão ao realizar logout.
- [x] **Hook `usePatientProfile` (`src/hooks/usePatientProfile.js`):**
  - Query gerenciada via `@tanstack/react-query` para carregar dados do paciente (`['patient', 'profile']`).
  - Mutation `useRegisterPatient` com atualização da sessão local e redirecionamento para `/paciente/inicio`.

---

## 4) Área do Paciente Pós-Credenciamento (`/paciente/inicio`)

Após concluir o cadastro na web, o paciente entra no ambiente de boas-vindas com o perfil pré-carregado.

### 4.1 Visualização e Conexão Mobile

- [x] **Banner de Boas-Vindas com Ações Integradas:** Reutilização de `ClinicActionBanner.jsx` com prop flexível `actions`, exibindo mensagem personalizada e os botões oficiais das lojas integrados diretamente no banner à direita:
  - **App Store:** Destaque em preto sólido (`bg-black text-white hover:bg-slate-900 border border-black`).
  - **Google Play:** Em verde esmeralda primário (`bg-emerald-600 text-white hover:bg-emerald-700`).
- [x] **Eliminação de Redundâncias:** Remoção dos botões duplicados que ficavam ao lado do título "Meu Perfil", mantendo um layout limpo e direto.
- [x] **Perfil Read-Only:** Exibição dos dados cadastrados (Nome, CPF mascarado `***.456.789-**`, E-mail, Telefone e Convênios vinculados).
- [x] **Seção "Baixe o app" (Ponte Mobile):** Botões com CTAs para download na App Store e Google Play já implementados.
- [ ] **Destaque Visual "Sua Saúde no Bolso":** Bloco explicativo contextualizando que a busca de exames, o mapa interativo de clínicas e a taxa de agendamento via PIX (R$ 5,00) acontecem no app mobile.
- [ ] **QR Code Visual Dinâmico:** Imagem ou SVG de QR Code para escaneamento rápido direto pela câmera do celular.
- [x] **Bloqueio Amigável com Modal/Aviso:** Ao interagir ou acessar rotas da clínica com perfil de paciente, bloquear e redirecionar para `/paciente/inicio`.

---

## 5) Segurança, LGPD e Padrões de Código

- [x] **Proteção de Dados Sensíveis (LGPD):** O CPF é mascarado em exibições públicas (`***.456.789-**`) e a senha nunca é exposta.
- [x] **Segregação por Role (`ROLE_USUARIO`):** Se um paciente logado tentar acessar qualquer rota do portal da clínica (`/dashboard/*`), o guard em `ClinicShell.jsx` redireciona para `/paciente/inicio`.
- [x] **Tratamento de Feedback (`Toast.jsx`):** Sistema pronto para exibição de alertas visuais para "Cadastro realizado com sucesso!" e validações.

---

## 6) Mapa de Status (Visão Executiva)

| Módulo / Funcionalidade | Status | Arquivo de Referência | Detalhes / Ação |
|---|:---:|---|---|
| **Rota `/cadastro-paciente`** | **Concluído** | `src/App.jsx` | Rota registrada e ativa |
| **Wizard de Cadastro (3 etapas)** | **Concluído** | `src/pages/PatientSignupPage.jsx` | Stepper interativo, validação onBlur e fallback |
| **Utilitários de CPF & Idade** | **Concluído** | `src/utils/patientSignupValidation.js` | `formatCpf`, validação algorítmica DV e `>= 18 anos` |
| **Componente `PasswordInput`** | **Concluído** | `src/components/common/PasswordInput.jsx` | Reutilizado na clínica e no paciente |
| **Mock `patientProfile.js`** | **Concluído** | `src/data/patientProfile.js` | Dados iniciais do paciente |
| **Serviço `patientService.js`** | **Concluído** | `src/services/patientService.js` | `registerPatient`, `getPatientProfile`, `clearSession` |
| **Hook `usePatientProfile`** | **Concluído** | `src/hooks/usePatientProfile.js` | Query + Mutation TanStack Query com invalidação |
| **Tela de Boas-Vindas (`/paciente/inicio`)** | **Concluído** | `src/pages/PatientWelcomePage.jsx` | Padrão visual alinhado ao portal da clínica (TopBar com iniciais, ClinicActionBanner, badges e cards de perfil) |
| **Ponte Mobile (Lojas)** | **Concluído** | `src/pages/PatientWelcomePage.jsx` | CTAs App Store e Google Play ativos |
| **QR Code para Download** | **Concluído** | `src/pages/PatientWelcomePage.jsx` | Seção orientativa de download mobile e proteção de dados |
| **CTA Paciente na Landing** | **Concluído** | `src/pages/LandingPage.jsx` | Botão direto no modal de acesso para `/cadastro-paciente` |

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