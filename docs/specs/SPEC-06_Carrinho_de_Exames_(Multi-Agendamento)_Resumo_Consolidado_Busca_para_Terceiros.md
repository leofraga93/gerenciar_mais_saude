### SPEC-06: Carrinho de Exames (Multi-Agendamento), Resumo Consolidado e Busca para Terceiros

* **Status**: PLANEJADO  
* **Data**: 2026-10-07  
* **Última revisão**: 2026-10-08 (agendamento web primeiro; app mobile em etapa posterior)  
* **Documento PRD de Referência**: `docs/prd/checklist-home-patiente.md` / `checklist-landing-page.md`  
* **Especificação Mestre**: Módulo de Seleção de Exames, Carrinho e Geolocalização (Item 3 do Mapeamento)

**Decisão de escopo:** o carrinho, a busca de localização para terceiros e a solicitação de agendamentos serão implementados primeiro no site, integrados à visão Paciente da landing. O app mobile receberá esse fluxo em etapa posterior. Esta spec é a única responsável por localização, seleção de itens/carrinho e submissão web; a SPEC-04 apenas prepara o ponto de integração do catálogo e a SPEC-07 acrescenta Google Auth ao modal usado quando o paciente precisar se autenticar.

---

### Diagnóstico: Como está vs. O que será ajustado

| Aspecto | Como está Hoje (`src/pages/LandingPage.jsx` / `checklist-home-patiente.md`) | O que será Ajustado (SPEC-06) |
| :--- | :--- | :--- |
| **Modelo de Agendamento** | O agendamento ocorre procedimento por procedimento, de forma isolada. | **Carrinho de Exames (Multi-Agendamento)**: O paciente adiciona múltiplos exames à sua "Lista de Exames" e finaliza a solicitação em lote. |
| **Configuração por Item** | Parâmetros de data e horário eram definidos globalmente na busca. | **Componente Individual por Exame (`ExamCartItem.jsx`)**: Cada exame no carrinho possui seletores próprios de **Data**, **Período (Manhã/Tarde/Noite)**, **Modalidade (Particular/Convênio)** e exibe as **Orientações de Preparo (`descriptionPrep`)**. |
| **Visualização Final** | Confirmação individual por procedimento. | **Resumo Consolidado (`OrderSummaryModal.jsx`)**: Modal com a tabela resumo de todos os exames agendados, valores, clínicas responsáveis e um guia unificado de preparo pré-atendimento. |
| **Localização de Busca** | Presume e fixa a localização atual obtida pelo GPS do dispositivo. | **Geolocalização Customizada para Terceiros (`LocationSearchInput.jsx`)**: O paciente pode digitar um endereço, bairro ou CEP específico para buscar e agendar exames para parentes ou terceiros em outras regiões (ex: agendar em Lauro de Freitas estando em Salvador). |

---

#### 1. Contexto, Rota e Arquivos Alvo

* **Objetivo da Tarefa**: Implementar a experiência estilo *e-commerce* para solicitação de exames médicos através do **Carrinho de Exames**, permitindo a configuração individual de datas e orientações por procedimento, a emissão do **Resumo Consolidado** e a **busca geolocalizada flexível** para atendimento de terceiros.
* **Rota(s) da Aplicação**: 
  * `/` (Vitrine B2C dentro da visão Paciente da Landing Page; ponto de entrada do fluxo web).
  * `/paciente/inicio` (Área de paciente e consulta do resultado/estado dos pedidos web, conforme o fluxo de cadastro existente).
  * **App Mobile**: integração futura, fora da entrega desta spec web.
* **Arquivo(s) Alvo**:
  * **Componentes**:
    * `src/components/patient/ExamCartDrawer.jsx` (Painel lateral/gaveta do Carrinho de Exames).
    * `src/components/patient/ExamCartItem.jsx` (Componente individual para cada exame com data, período, convênio e preparo).
    * `src/components/patient/OrderSummaryModal.jsx` (Modal de resumo consolidado pós-agendamento).
    * `src/components/patient/LocationSearchInput.jsx` (Input com autocompletar e busca manual de endereço/bairro para terceiros).
  * **Gerenciamento de Estado**: `src/data/cartStore.js` / `src/hooks/useExamCart.js` (Estado reativo para inserção, remoção, atualização de parâmetros e persistência temporária do carrinho em `sessionStorage`).
  * **Serviços / Data**: `src/data/services.js` (Catálogo de exames) e `src/services/appointmentService.js` (Submissão do lote de agendamentos).

**Dependências e limites:** SPEC-04 entrega o catálogo separado da visão neutra e expõe o ponto de ação de exame para esta spec conectar. SPEC-06 define o payload de carrinho/agendamento e o comportamento web completo; não duplicar componentes de nicho nem implementar Google Auth. A experiência mobile pode reutilizar o contrato mock posteriormente, sem bloquear o fluxo web.

---

#### 2. Ação e Regras de Negócio (Especificação Detalhada)

##### 2.1 Mapeamento de Estrutura de Dados do Carrinho (`useExamCart.js`)

Cada item adicionado ao **Carrinho de Exames** segue a estrutura de dados abaixo:

```javascript
{
  cartItemId: "cart-item-101",
  examId: "exam-01",
  examName: "Ultrassonografia Abdominal Total",
  category: "IMG",
  clinicId: "clinic-01",
  clinicName: "Clínica Diagnóstica Vilas",
  privatePrice: 180.00,
  tussCode: "40901203",
  descriptionPrep: "Jejum absoluto de 8 horas. Beber 4 copos de água 1 hora antes do exame.",
  // Campos configurados individualmente no ExamCartItem.jsx:
  selectedDate: "2026-10-15",
  selectedPeriod: "MANHA", // 'MANHA' | 'TARDE' | 'NOITE'
  paymentType: "CONVENIO", // 'PARTICULAR' | 'CONVENIO'
  selectedInsuranceId: "bradesco"
}
```

##### 2.2 Regras de Negócio e UX

```text
  Navegação na Vitrine de Exames
               │
               ▼
   [Adicionar ao Carrinho] ──► Atualiza Badge do Carrinho (Ex: "3 exames")
                                       │
                                       ▼
                       Abre ExamCartDrawer.jsx
                                       │
     ┌─────────────────────────────────┴─────────────────────────────────┐
     ▼                                                                   ▼
 Configuração Individual (ExamCartItem.jsx)               Busca para Terceiros
 - Data Desejada (date picker)                            - Digitar Endereço/CEP do parente
 - Período (Pills: Manhã, Tarde, Noite)                   - Reordenar clínicas por proximidade
 - Tipo (Particular vs Convênio)
 - Card de Preparo (descriptionPrep)
     │
     └─────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
                        Clique [Finalizar Agendamento]
                                       │
                                       ▼
                   OrderSummaryModal.jsx (Resumo Consolidado)
```

1. **Adição ao Carrinho**: Clicar em "Adicionar ao Carrinho" em qualquer exame da vitrine insere o item na `cartStore` sem remover o paciente da navegação. O contador do carrinho no cabeçalho atualiza instantaneamente.
2. **Configuração Individual por Exame (`ExamCartItem.jsx`)**:
   * **Data**: Seletor de data obrigatório (impede escolha de datas passadas).
   * **Período Preferencial**: Botões no padrão *pills* (`MANHA`, `TARDE`, `NOITE`).
   * **Modalidade de Pagamento**: Seleção entre "Particular" (exibe o valor em R\$) ou "Convênio" (filtra apenas os convênios aceitos para aquele exame específico vindo de `insuranceIds[]`).
   * **Visualização do Preparo**: Bloco de destaque com ícone de atenção exibindo as orientações de preparo (`descriptionPrep`).
3. **Busca Geolocalizada para Terceiros (`LocationSearchInput.jsx`)**:
   * Por padrão, a busca pode utilizar a posição do dispositivo.
   * O paciente pode clicar no campo de localização e digitar o endereço de um terceiro (ex: *"Avenida Praia de Pajussara, Vilas do Atlântico, Lauro de Freitas"*).
   * As clínicas e exames listados são reordenados dinamicamente com base na nova coordenada informada.
4. **Resumo Consolidado (`OrderSummaryModal.jsx`)**:
   * Tabela resumida listando todos os exames do carrinho, clínicas, datas e horários solicitados.
   * Totalizador com o valor total estimado (se particular) ou relação de guias de convênio necessárias.
   * Bloco de **Orientações Unificadas de Atendimento** consolidando todas as recomendações de preparo do lote de exames para o dia da consulta.

---

#### 3. Fluxo, Navegação e Matriz de Casos Excepcionais

##### 3.1 Fluxo de Navegação do Usuário
1. O paciente navega pela vitrine de exames na visão Paciente da Landing Page.
2. Define o endereço do beneficiário no `LocationSearchInput` (ex: bairro do parente em Lauro de Freitas).
3. Seleciona os exames desejados (ex: *Eletrocardiograma* e *Hemograma Completo*) e clica em "Adicionar ao Carrinho".
4. Abre o painel do carrinho (`ExamCartDrawer`), ajusta a data e período para cada um dos exames e revisa o preparo.
5. Clica em "Solicitar Agendamentos" no site:
   * Se o paciente não estiver logado, o sistema abre o `AuthModal` no modo Paciente.
   * Após a autenticação/cadastro, exibe o `OrderSummaryModal` com o resumo consolidado e envia o lote via `appointmentService.js`.
6. A experiência equivalente no app mobile será definida e implementada em uma etapa posterior; não redirecionar o usuário web para o app para concluir este fluxo.

##### 3.2 Matriz de Tratamento de Erros e Casos Excepcionais

| Cenário Excepcional | Causa / Condição | Comportamento Esperado do Sistema |
| :--- | :--- | :--- |
| **Exame sem Data ou Período Selecionado** | Paciente tenta clicar em "Solicitar Agendamentos" deixando algum exame no carrinho sem data definida. | O drawer bloqueia o avanço, destaca a borda do `ExamCartItem` pendente em vermelho e exibe mensagem: *"Defina a data e o período para este exame."* |
| **Convênio Escolhido Não Aceito pelo Exame** | O paciente troca para o modo "Convênio", mas o plano selecionado não está na lista `insuranceIds[]` do procedimento. | O componente `ExamCartItem` exibe alerta: *"Este exame não atende ao convênio selecionado. Selecione 'Particular' ou altere o plano."* |
| **Tentativa de Agendar Exame em Clínica Pendente** | Um exame foi adicionado ao carrinho antes de a clínica ter seu status alterado para moderação/inativo. | A submissão valida a clínica e alerta: *"O exame [Nome] não está mais disponível para agendamento no momento."* |
| **Solicitar Agendamento sem Sessão de Paciente** | Visitante tenta enviar o carrinho sem cadastro/sessão mock ativa. | Preservar o carrinho, abrir o `AuthModal` no contexto Paciente e, após o fluxo mock de acesso/cadastro, retomar o pedido pendente antes de exibir o resumo e submeter a solicitação web. Google Auth é acrescentado pela SPEC-07. |
| **Esvaziar Carrinho** | Paciente clica em "Remover Todos" no carrinho. | Limpa o estado local `cartStore`, fecha o drawer e atualiza o badge do cabeçalho para zero. |

---

#### 4. Critérios de Aceite (Definition of Done)

* [ ] O hook `useExamCart.js` e a `cartStore.js` gerenciam o estado reativo da **Lista de Exames** com persistência no `sessionStorage`.
* [ ] A vitrine permite adicionar múltiplos exames ao carrinho sem interromper a navegação do paciente.
* [ ] O componente `ExamCartItem.jsx` possui seletores independentes de **Data**, **Período**, **Modalidade (Particular/Convênio)** e exibe as orientações do campo `descriptionPrep`.
* [ ] O componente `LocationSearchInput.jsx` permite alterar manualmente o endereço/bairro de busca para o agendamento de terceiros.
* [ ] O modal `OrderSummaryModal.jsx` exibe a tabela consolidada com a relação dos exames, datas, horários e orientações unificadas.
* [ ] O envio do carrinho gera as solicitações em lote com o status inicial `SOLICITADO` via `appointmentService.js`.
* [ ] Nenhum emoji é utilizado nos cards do carrinho ou nos modais, mantendo a consistência com o design system do `AGENTS.md`.

---

**Status desta spec: PLANEJADO.** A SPEC-06 implementará o fluxo web de busca para terceiros, carrinho e agendamento; a experiência mobile fica para uma etapa posterior.
