### SPEC-06: Carrinho de Exames (Multi-Agendamento), Resumo Consolidado e Busca para Terceiros

* **Status**: CONCLUÍDO
* **Data**: 2026-10-07
* **Data de Conclusão**: 2026-10-10
* **Última revisão**: 2026-10-10 (lista múltipla, filtro de período e convênios alinhados à oferta da clínica; API e app mobile permanecem futuros)
* **Documento PRD de Referência**: `docs/prd/checklist-home-patiente.md` / `checklist-landing-page.md`
* **Especificação Mestre**: Módulo de Seleção de Exames, Carrinho e Geolocalização (Item 3 do Mapeamento)

**Decisão de escopo:** a lista de exames, a busca de localização para terceiros e a solicitação de agendamentos serão implementados primeiro no site, integrados à visão Paciente da landing. O app mobile receberá esse fluxo em etapa posterior. Esta spec é a única responsável por localização, seleção de itens/lista e submissão web. Google Auth e notificações via WhatsApp são integrações externas adiadas para EVOL-005, planejadas junto à API/backend; o acesso desta spec permanece mock.

**Nomenclatura da interface:** a lista de itens é apresentada como **Lista de exames**, com ícone de lista (`ListChecks`) para não sugerir compra. `cartStore`, `useExamCart` e outros nomes técnicos permanecem por compatibilidade interna.

---

### Diagnóstico: Como está vs. O que será ajustado

| Aspecto | Como está Hoje (`src/pages/LandingPage.jsx` / `checklist-home-patiente.md`) | O que será Ajustado (SPEC-06) |
| :--- | :--- | :--- |
| **Modelo de Agendamento** | O agendamento ocorre procedimento por procedimento, de forma isolada. | **Carrinho de Exames (Multi-Agendamento)**: O paciente adiciona múltiplos exames à sua "Lista de Exames" e finaliza a solicitação em lote. |
| **Configuração por Item** | Período e horário eram solicitados individualmente no painel. | **Filtros na vitrine e configuração individual**: o período é filtrado na landing; cada item na lista recebe sua data e horário e exibe as **Orientações de Preparo (`descriptionPrep`)** e os meios de pagamento oferecidos pela clínica. |
| **Visualização Final** | Confirmação individual por procedimento. | **Resumo Consolidado (`OrderSummaryModal.jsx`)**: Modal com a tabela resumo de todos os exames agendados, valores, clínicas responsáveis e um guia unificado de preparo pré-atendimento. |
| **Localização de Busca** | Presume e fixa a localização atual obtida pelo GPS do dispositivo. | **Geolocalização Customizada para Terceiros (`LocationSearchInput.jsx`)**: O paciente pode digitar um endereço, bairro ou CEP específico para buscar e agendar exames para parentes ou terceiros em outras regiões (ex: agendar em Lauro de Freitas estando em Salvador). |

---

#### 1. Contexto, Rota e Arquivos Alvo

* **Objetivo da Tarefa**: Implementar a experiência de **Lista de Exames** para solicitações médicas, com inclusão contínua de múltiplos itens, configuração individual de datas e orientações por procedimento, emissão do **Resumo Consolidado** e **busca de localização flexível** para atendimento de terceiros.
* **Rota(s) da Aplicação**: 
  * `/` (Vitrine B2C dentro da visão Paciente da Landing Page; ponto de entrada do fluxo web).
  * `/paciente/inicio` (Área de paciente e consulta do resultado/estado dos pedidos web, conforme o fluxo de cadastro existente).
  * **App Mobile**: integração futura, fora da entrega desta spec web.
* **Perfil de Acesso**: `PUBLICO` para catálogo e carrinho local; sessão mock de `ROLE_USUARIO` obrigatória para submeter e consultar pedidos.
* **Arquivo(s) Alvo**:
  * **Componentes**:
     * `src/components/patient/ExamCartDrawer.jsx` (Painel lateral da Lista de Exames).
     * `src/components/patient/ExamCartItem.jsx` (Componente individual para cada exame com data, horário, convênio e preparo).
    * `src/components/patient/OrderSummaryModal.jsx` (Modal de resumo consolidado pós-agendamento).
    * `src/components/patient/LocationSearchInput.jsx` (Input com autocompletar e busca manual de endereço/bairro para terceiros).
  * **Gerenciamento de Estado**: `src/data/cartStore.js` / `src/hooks/useExamCart.js` (Estado reativo para inserção, remoção, atualização de parâmetros e persistência temporária do carrinho em `sessionStorage`).
  * **Serviços / Data**: `src/data/services.js` e `src/data/catalogData.js` (Catálogo e associações mock entre exames e clínicas) e `src/services/appointmentService.js` (Submissão do lote de agendamentos).
  * **Agenda e disponibilidade**: `src/data/clinicProfileData.js` (dias e slots operacionais, status de aprovação e atividade da clínica).
  * **Slots mock por clínica**: `src/data/clinicAvailability.js` (horários específicos oferecidos por clínica, limitados aos dias ativos em `clinicProfileData.js`).
  * **Consulta dos pedidos**: hook `usePatientAppointments` e componente `PatientRecentOrdersCard.jsx` na área `/paciente/inicio`.

**Dependências e limites:** SPEC-04 entrega o catálogo separado da visão neutra e expõe o ponto de ação de exame para esta spec conectar. SPEC-06 define o payload de lista/agendamento e o comportamento web completo; não duplicar componentes de nicho nem implementar integração de autenticação externa. A experiência mobile pode reutilizar o contrato mock posteriormente, sem bloquear o fluxo web.

---

#### 2. Ação e Regras de Negócio (Especificação Detalhada)

##### 2.1 Mapeamento de Estrutura de Dados do Carrinho (`useExamCart.js`)

Cada item adicionado à **Lista de Exames** segue a estrutura de dados abaixo:

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
  selectedTimeSlot: "08:00",
  selectedPeriod: "MANHA", // 'MANHA' | 'TARDE' | 'NOITE'
  paymentType: "CONVENIO", // 'PARTICULAR' | 'CONVENIO'
  selectedInsuranceId: "ins-bradesco"
}
```

##### 2.2 Regras de Negócio e UX

```text
  Navegação na Vitrine de Exames
               │
               ▼
   [Solicitar agendamento] ──► Abre a lateral para configurar o exame
                                       │
            Data, horário e pagamento; botão [Adicionar Exame]
                                       │
                 Mostra carregamento e confirmação de salvo
                                       │
                    Fecha a lateral e retorna à vitrine
                                       │
            A pessoa pode escolher e configurar outros exames
                                       │
           Ícone com contador abre a lista para revisar o lote
                                       │
                       Clique [Concluir solicitação]
                                       │
                   OrderSummaryModal.jsx (Resumo Consolidado)
```

1. **Configuração e inclusão na Lista de Exames**: Clicar em "Solicitar agendamento" no card abre a lateral com o exame escolhido, ainda sem gravá-lo na lista. Depois de configurar data, horário e forma de pagamento, clicar em "Adicionar Exame" grava o item em `cartStore`, mostra carregamento e confirmação visual de conclusão e fecha a lateral para retornar à landing. O contador vermelho do ícone no cabeçalho aumenta. Quando não houver associação de clínica no mock, a ação fica indisponível; não criar vínculo fictício.
2. **Configuração Individual por Exame (`ExamCartItem.jsx`)**:
   * **Data e horário**: A pessoa escolhe somente datas e horários disponibilizados pela clínica para aquele exame; datas passadas e slots indisponíveis não podem ser selecionados.
   * **Período**: Filtro opcional na landing (`MANHA`: 00:00–11:59; `TARDE`: 12:00–17:59; `NOITE`: 18:00–23:59). Os itens da lista só oferecem datas/horários dentro do período escolhido para o item.
   * **Modalidade de Pagamento**: A pessoa pode escolher Particular ou qualquer convênio oferecido pelo serviço da clínica (`insuranceIds[]`). No mock, a elegibilidade do paciente/beneficiário será validada futuramente pela API.
   * **Visualização do Preparo**: Bloco de destaque com ícone de atenção exibindo as orientações de preparo (`descriptionPrep`).
3. **Busca Geolocalizada para Terceiros (`LocationSearchInput.jsx`)**:
   * Por padrão, a busca utiliza uma região mock selecionada; GPS e geocodificação por API ficam para EVOL-002.
   * O paciente pode clicar no campo de localização e digitar o endereço de um terceiro (ex: *"Avenida Praia de Pajussara, Vilas do Atlântico, Lauro de Freitas"*).
   * As clínicas e exames listados são reordenados dinamicamente com base na nova coordenada informada.
4. **Resumo Consolidado (`OrderSummaryModal.jsx`)**:
   * Tabela resumida listando todos os exames do carrinho, clínicas, datas e horários solicitados.
   * Totalizador com o valor total estimado (se particular) ou relação de guias de convênio necessárias.
   * Bloco de **Orientações Unificadas de Atendimento** consolidando todas as recomendações de preparo do lote de exames para o dia da consulta.

##### 2.3 Localização mock e ordenação por proximidade

* A base local conterá bairros/regiões da Região Metropolitana de Salvador e Lauro de Freitas com coordenadas numéricas de latitude e longitude, incluindo Vilas do Atlântico, Centro de Lauro de Freitas, Estrada do Coco, Pituba e Salvador.
* `LocationSearchInput.jsx` oferece autocompletar usando essa lista local. Enquanto não houver geocodificação, a busca resolve somente as regiões e aliases cadastrados; endereços e CEPs arbitrários não são convertidos em coordenadas. Incluir no código a anotação `// TODO: Substituir lista local por integração com API gratuita de geocodificação/banco de dados`.
* O ponto inicial é Centro - Lauro de Freitas, sem solicitar geolocalização do dispositivo nesta etapa. As coordenadas são aproximadas, apenas para demonstração, e ficam em `src/data/locationCatalog.js`.
* Clínicas e exames são ordenados por distância calculada pela fórmula de Haversine. Menor distância vem primeiro; em distâncias equivalentes (diferença inferior a 1 metro), maior `rating` da clínica vem primeiro.

##### 2.4 Contrato de submissão do lote e leitura na área do paciente

* Uma submissão cria um pedido único identificado por `orderId` (exemplo: `ORD-2026-101`) e associa a ele todos os agendamentos daquele carrinho.
* Cada agendamento enviado por `appointmentService.js` contém: `appointmentId`, `orderId`, `patientId`, `patientName`, `clinicId`, `clinicName`, `examId`, `examName`, `selectedDate`, `selectedTimeSlot`, `selectedPeriod`, `paymentType`, `insuranceId`, `price`, `status` e `createdAt`.
* Todos os itens do lote recebem o status inicial `SOLICITADO`. Persistir os pedidos mock no armazenamento local já consumido pela agenda administrativa e disponibilizá-los por `usePatientAppointments`; cada item mantém também aliases do modelo legado (`id`, `serviceName`, `date`, `time`) para compatibilidade com essa agenda.
* `PatientRecentOrdersCard.jsx`, em `/paciente/inicio`, agrupa por `orderId`, mostra a síntese do lote (data, horário, exame e clínica) e permite expandir forma de pagamento e orientações de preparo.
* As ofertas presentes em `MOCK_SERVICES_CATALOG` representam, nesta fase, serviços publicados por clínicas ativas e aprovadas. A submissão revalida a existência da oferta e a disponibilidade da data/slot mock; não há reserva concorrente real.

##### 2.8 Estado do pedido

* O pedido e todos os seus agendamentos são criados em `SOLICITADO`.
* Esta SPEC não adiciona transições de status; confirmações, pagamentos e cancelamentos continuam sob a máquina de estados e ações existentes do portal da clínica, respeitando `docs/AGENTS.md`.

##### 2.5 Convênios e totalização

* A modalidade pode ser escolhida individualmente em cada item, limitada à oferta associada ao serviço no catálogo da clínica.
* O filtro de convênio da landing e o seletor da lista usam os mesmos `service.insuranceIds`; selecionar um plano aceito inicia o item com Convênio e esse plano selecionado. No mock, não cruzar com `patientProfile.insuranceIds`, pois a solicitação pode ser para terceiro. A elegibilidade do beneficiário será validada na futura integração de API/backend (EVOL-002).
* O resumo soma em BRL apenas os itens Particulares. Itens de Convênio contribuem com R$ 0,00 e exibem `Via Convênio [Nome do Plano]`.

##### 2.6 Datas, períodos, horários e disponibilidade operacional

* O período (`MANHA`, `TARDE`, `NOITE`) é um filtro opcional da landing. Faixas mock: manhã 00:00–11:59, tarde 12:00–17:59 e noite 18:00–23:59. Ao adicionar o exame, o período escolhido acompanha o item e limita as datas e horários exibidos. Sem período escolhido, todos os slots mock são considerados.
* Data e horário são escolhidos individualmente na lista, respeitando os dias ativos em `clinicProfileData.js` e os slots mock por clínica em `clinicAvailability.js` nos próximos 30 dias. A integração com agenda em banco ocorrerá futuramente.
* Validar a clínica ao carregar o item na lista e novamente ao enviar; a oferta deve estar aprovada e ativa.
* Se ficar indisponível, mostrar aviso no item e bloquear envio até regularização ou remoção.

##### 2.7 Retomada após autenticação

* Preservar a lista em `sessionStorage`, chave `gms_exam_cart`, quando o visitante iniciar a solicitacao sem sessao.
* Após login mock iniciado na revisão final, submeter o lote revisado e direcionar para `/paciente/inicio`; os exames solicitados aparecem em `PatientRecentOrdersCard.jsx`.
* Após cadastro em `/cadastro-paciente` iniciado na revisão final, retornar internamente à landing para submeter o lote preservado e seguir para `/paciente/inicio`. A lista só é limpa após submissão bem-sucedida.


---

#### 3. Fluxo e casos excepcionais

1. A pessoa navega pela vitrine Paciente e combina localização mock, categoria, convênio, faixa de preço e período.
2. O filtro de convênio usa a oferta da clínica associada ao serviço. Um plano só aparece quando a clínica oferece aquele serviço por esse plano.
3. Ao clicar em "Solicitar agendamento" no card, configura o exame na lateral e clica em "Adicionar Exame". O sistema confirma a inclusão e retorna automaticamente à landing.
4. O ícone da Lista de exames abre a lateral em modo de resumo, mostrando os dados de cada item e controles de editar/remover. Editar abre a configuração existente; salvar atualiza o mesmo item sem duplicá-lo e retorna ao resumo da lateral.
5. Na lateral, "Concluir solicitação" abre a revisão final. "Concluir" exige login/cadastro; depois da autenticação o lote preservado é submetido e a pessoa segue para `/paciente/inicio`, onde vê os exames em `PatientRecentOrdersCard.jsx`.
6. Após a confirmação explícita por pessoa autenticada, `appointmentService.js` cria o lote e `OrderSummaryModal.jsx` exibe o resultado. A lista só é limpa após sucesso.

| Caso | Comportamento |
| --- | --- |
| Item sem data ou horário | Bloquear solicitação e destacar o item pendente. |
| Convênio não oferecido | Não exibir a oferta para esse filtro; no item, oferecer somente planos cadastrados pela clínica. |
| Clínica indisponível | Mostrar aviso e bloquear o envio do item. |
| Sem sessão | Preservar a lista, abrir acesso/cadastro e retornar sem submeter automaticamente. |
| Período sem slots | Não exibir serviços sem horários mock na faixa escolhida. |
| Remover todos | Limpar a lista e atualizar o contador para zero. |

#### 4. Critérios de Aceite (Definition of Done)

* [x] `useExamCart.js` e `cartStore.js` gerenciam a Lista de Exames com persistência em `sessionStorage`.
* [x] O card abre a configuração do exame; "Adicionar Exame" mostra carregamento e confirmação, grava o item e retorna automaticamente à landing.
* [x] A configuração permite escolher data e horário dentro da disponibilidade e mostra preparo e opções de pagamento da clínica.
* [x] A lateral mostra resumo dos itens com ações de editar/remover; salvar edição atualiza o mesmo item. A revisão final antecede acesso/cadastro, e a lista só é limpa após submissão bem-sucedida.
* [x] Filtro de convênio e pagamento usam a mesma oferta `MOCK_SERVICES_CATALOG`; o perfil pessoal não restringe a busca mock para terceiros.
* [x] Filtro de período fica na landing e restringe os slots do item.
* [x] Após login ou cadastro mock iniciado na revisão, submeter o lote preservado e direcionar para `/paciente/inicio`; limpar a lista somente após sucesso.
* [x] Busca de localização mock ordena por Haversine; endereços/CEPs arbitrários aguardam integração futura.
* [x] Resumo consolidado mostra lote, valores particulares e preparo.
* [x] Submissão cria lote com `orderId`, status `SOLICITADO` e consulta em `/paciente/inicio`.
* [x] Nenhum emoji é utilizado na interface da lista e dos modais.

#### 5. Reuso Mandatório de Componentes (DRY)

* [x] Os hooks usam TanStack Query para leitura e mutação mock; a submissão invalida as consultas compartilhadas de agendamento.
* [x] O portal usa o `StatusBadge.jsx` existente; os ícones novos vêm de `lucide-react`, sem emojis.
* [x] A busca de localização é um autocomplete local; não duplica `FormField`, `Toast` nem `inputClassName` sem necessidade para este controle.

#### 6. Anti-Escopo

* [x] Não criar backend, endpoint, banco de dados ou reserva concorrente de horários.
* [x] Não integrar geocodificação, mapa, autenticação real, pagamento, Google Auth ou WhatsApp.
* [x] Não implementar o app mobile nem redirecionar o fluxo web para ele.
* [x] Não criar ofertas de clínica fictícias para exames sem associação no catálogo mock.

#### 7. Checklist do Gatekeeper

1. [x] Payloads, tipos, status e chaves mock estão definidos nas Seções 2.1 e 2.4.
2. [x] Estados vazios e mensagens de validação estão cobertos na Seção 3.2 e nos componentes do carrinho.
3. [x] Fonte dos mocks, persistência e query keys estão descritas nesta SPEC e nos hooks de carrinho e agendamento.
4. [x] Endereços/CEPs arbitrários dependem da futura geocodificação por API, registrada em EVOL-002.

#### 8. Fechamento de Ciclo & Rastreabilidade

* [x] Critérios de aceite da Seção 4 conferidos e concluídos.
* [x] Cabeçalho atualizado para `Status: CONCLUÍDO` com data de conclusão.
* [x] PRD do paciente e arquitetura de catálogo sincronizados; roadmap atualizado com EVOL-002 e EVOL-004.

**Status desta spec: CONCLUÍDO.** O fluxo web de busca para terceiros, carrinho e solicitação mock está implementado. Geocodificação por API, integração backend e experiência mobile permanecem em frentes futuras do roadmap.
