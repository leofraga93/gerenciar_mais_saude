# SPEC-01: Wizard de Credenciamento do Paciente

* **Status**: CONCLUÍDO
* **Data de Início**: 2026-09-17
* **Data de Conclusão**: 2026-09-17
* **Documento PRD de Referência**: `docs/prd/checklist-home-patiente.md` (Seção 2)



---

## 1. Contexto, Rota e Arquivos Alvo

* **Objetivo da Tarefa**: Implementar o fluxo de cadastro do paciente através de um wizard interativo em 3 etapas com validação instantânea (`onBlur`), entrada flexível de CPF, cálculo de idade mínima de 18 anos, reutilização da regra de senha do credenciamento da clínica, armazenamento mock em `sessionStorage` com sincronização no TanStack Query e redirecionamento automático para `/paciente/inicio` ao concluir.


* **Rota(s) da Aplicação**: `/cadastro-paciente` (rota pública no roteador `App.jsx`).


* **Arquivo(s) Alvo**:
* **Página / View**: `src/pages/PatientSignupPage.jsx` e `src/pages/PatientWelcomePage.jsx`

* **Componentes**:
* `src/components/common/PasswordInput.jsx` (componente reutilizável com comportamento segurar/revelar)
* `src/components/patient/PatientSignupStepper.jsx` (indicador de progresso em 3 etapas com ícones vetoriais, número do passo e título limpo, sem textos secundários redundantes)
* `src/components/clinic/ClinicActionBanner.jsx` (reutilizado em `/paciente/inicio` com slot flexível de botões de ação `actions` para App Store em preto e Google Play em verde esmeralda)




* **Utilitários**: `src/utils/patientSignupValidation.js` (Sanitização e validação de CPF por algoritmo DV, cálculo dinâmico de idade mínima 18+, validação de e-mail/senha/telefone)


* **Serviços / Storage**: `src/services/patientService.js` (gerenciamento da chave `gms_patient_session` no `sessionStorage`)


* **Hooks**: `src/hooks/usePatientProfile.js` (integração via TanStack Query com a chave `['patient', 'profile']`)


* **Roteamento**: `src/App.jsx` (registro da rota) e `src/pages/LandingPage.jsx` (vínculo do botão "Cadastre-se")





---

## 2. Ação e Regras de Negócio (Especificação Sucinta)

### 2.1 Mapeamento de Campos e Regras de Validação

| Etapa | Campo | Obrigatoriedade | Regra de Validação / Máscara |
| --- | --- | --- | --- |
| **1. Pessoal** | **Nome Completo** | Sim | Mínimo 2 palavras (Nome + Sobrenome), apenas letras e espaços.

 |
| **1. Pessoal** | **CPF** | Sim | Aceita entrada bruta com ou sem pontuação (ex: `12345678900` ou `123.456.789-00`). O utilitário deve sanitizar (remover caracteres não numéricos), validar o algoritmo de Dígitos Verificadores (DV) para 11 dígitos e aplicar a máscara `000.000.000-00` na UI.

 |
| **1. Pessoal** | **Data de Nascimento** | Sim | Formato de data válido. A idade mínima de **18 anos** deve ser calculada dinamicamente com base na data atual do sistema.

 |
| **2. Acesso** | **E-mail** | Sim | Formato de e-mail válido (RFC 5322), até 254 caracteres.

 |
| **2. Acesso** | **Senha** | Sim | Mínimo 8 caracteres, exigindo combinação de **letras e números** (alinhado exatamente às regras de validação da clínica). Usa o componente `PasswordInput.jsx`.

 |
| **2. Acesso** | **Confirmação de Senha** | Sim | Deve coincidir exatamente com o valor informado no campo **Senha**.

 |
| **2. Acesso** | **Telefone / Celular** | Sim | DDD válido (Brasil) + 9 dígitos, com máscara visual `(00) 90000-0000`.

 |
| **3. Saúde** | **Planos de Saúde** | Opcional | Multi-select via pills/padrão *FilterButtonGroup* alimentado por `src/data/insurances.js` mais a opção "Particular". Se nada for marcado, assume-se por padrão o array contendo o plano "Particular".

 |
| **3. Aceite** | **Termos & Privacidade** | Sim | Checkbox de aceite dos termos de uso e LGPD.

 |

---

## 3. Fluxo, Navegação e Estados Excepcionais

### 3.1 UX e Navegação da Wizard

1. **Prioridade Sequencial & Navegação Flexível**:
* O fluxo prioritário avança etapa a etapa via botão "Continuar" após preenchimento válido da etapa ativa.


* **Pular/Navegação Direta por Clique**: O usuário pode clicar nos passos do `PatientSignupStepper` para saltar de etapa.


* **Preservação de Dados**: Retornar ou navegar entre etapas **mantém intactos** todos os dados já digitados no estado local sem resetar as respostas.




2. **Gatilhos de Validação**:
* **`onBlur`**: Valida a integridade de cada input ao perder o foco.


* **Submit Final / Tentativa de Conclusão**: Se o usuário pular etapas ou clicar em "Concluir Cadastro" com pendências obrigatórias em etapas anteriores, o wizard interrompe o envio, redireciona o foco para a primeira etapa que contém erros e destaca visualmente os campos inválidos.




3. **Pós-Cadastro / Persistência**:
* Salva a estrutura normalizada do paciente no `sessionStorage` sob a chave `gms_patient_session`.


* Atualiza o cache do TanStack Query sob a chave `['patient', 'profile']`.


* Dispara notificação via `Toast.jsx`: *"Cadastro realizado com sucesso!"*.


* Executa o **redirecionamento automático** do usuário para a rota `/paciente/inicio`.





---

### 3.2 Matriz de Tratamento de Erros e Casos Excepcionais (Evitando Falhas)

| Cenário Excepcional | Causa / Condição | Comportamento Esperado do Sistema |
| --- | --- | --- |
| **CPF Inválido ou Formatado Incorretamente** | CPF com menos de 11 dígitos após sanitização ou com falha no cálculo do dígito verificador.

 | Borda vermelha no campo via `FormField.jsx` e mensagem: *"CPF inválido. Verifique os números digitados."*.

 |
| **Paciente Menor de Idade** | Data de nascimento resulta em idade < 18 anos na checagem dinâmica.

 | Bloqueia avanço e exibe a mensagem: *"Você deve ter pelo menos 18 anos para se cadastrar."*.

 |
| **Senha Fraca / Fora do Padrão** | Menos de 8 caracteres ou ausência de combinação de letras e números.

 | Exibe mensagem: *"A senha deve conter no mínimo 8 caracteres, com letras e números."*.

 |
| **Divergência de Senhas** | O campo `confirmPassword` difere de `password`.

 | Exibe mensagem: *"As senhas não coincidem."*.

 |
| **Pular Etapas Obrigatórias e Clicar em Concluir** | Usuário clica no botão final de submit estando na Etapa 3 sem preencher os campos da Etapa 1 ou 2.

 | Interrompe a submissão, faz o fallback automático para a etapa mais recuada com pendência, aplica bordas vermelhas e foca no primeiro campo com erro.

 |
| **Nenhum Convênio Selecionado** | Usuário desmarca todas as opções de planos de saúde na Etapa 3.

 | O sistema aceita sem erro (campo opcional) e grava automaticamente o fallback `['particular']`.

 |
| **Termos de Uso Não Aceitos** | Checkbox da LGPD/Termos desmarcado no submit.

 | Impede a submissão final e exibe alerta visual: *"Você deve aceitar os termos para prosseguir."*.

 |
| **Tentativa de Acesso Direto à Dashboard da Clínica (`/dashboard/*`)** | Usuário logado com `ROLE_USUARIO` (paciente) tenta acessar rotas administrativas.

 | O guard de rotas intercepta o acesso, bloqueia e redireciona para `/paciente/inicio` com notificação via Toast.

 |

---

## 4. Critérios de Aceite (Definition of Done)

* [x] A rota `/cadastro-paciente` renderiza o layout responsivo do wizard com as 3 etapas bem definidas.


* [x] O componente `PatientSignupStepper` permite a navegação interativa e indica visualmente a etapa ativa.


* [x] O CPF aceita entradas com ou sem símbolos, formata adequadamente e valida o algoritmo de DV.


* [x] A regra de idade mínima (18+) calcula a idade dinamicamente e bloqueia menores de idade.


* [x] O componente `PasswordInput.jsx` é reutilizado e aplica a mecânica de segurar para ver e soltar para ocultar a senha.


* [x] A validação da senha utiliza exatamente o mesmo padrão e utilitário do credenciamento de clínicas (mín. 8 caracteres com letras e números).


* [x] As respostas do formulário são mantidas no estado local durante toda a navegação entre etapas.


* [x] A Etapa 3 renderiza os convênios vindos de `src/data/insurances.js` em formato de pills clicáveis e lida corretamente com a opção "Particular".


* [x] A submissão com erros pendentes em etapas anteriores faz o fallback visual correto para a etapa problemática.


* [x] O cadastro finaliza salvando os dados no `sessionStorage`, notificando via `Toast.jsx` e redirecionando automaticamente para `/paciente/inicio`.

* [x] O indicador `PatientSignupStepper` exibe apenas ícones vetoriais, número e título da etapa, com remoção de textos secundários redundantes e alinhamento visual com a clínica.

* [x] Correção do balão de alerta/toast vazio que impedia o fechamento ou poluía a tela de boas-vindas do paciente pós-cadastro.

* [x] A tela `/paciente/inicio` integra os botões de download (App Store em preto e Google Play em verde esmeralda) dentro do banner de boas-vindas via `ClinicActionBanner`, eliminando botões redundantes no cabeçalho.



---

## 5. Checklist do Gatekeeper (Auto-auditoria)

* [x] Os campos de entrada e seus tipos estão 100% claros? **SIM** (mapeados na tabela da Seção 2.1).


* [x] Os tratamentos de erros excepcionais e fallbacks foram mapeados? **SIM** (definidos na Seção 3.2).


* [x] O reaproveitamento de componentes e utilitários da clínica foi garantido? **SIM** (`PasswordInput`, validação de senha e formulários).


* [x] Os contratos de mocks, sessão e TanStack Query estão informados? **SIM** (`gms_patient_session` e query key `['patient', 'profile']`).



---

## 6. Fechamento de Ciclo & Rastreabilidade (Done & Sync)

* [x] 1. Critérios de Aceite cumpridos e verificados via linter e build.
* [x] 2. Cabeçalho atualizado para `Status: CONCLUÍDO` com data de conclusão registrada.
* [x] 3. Sincronização executada com o documento PRD `docs/prd/checklist-home-patiente.md`.
