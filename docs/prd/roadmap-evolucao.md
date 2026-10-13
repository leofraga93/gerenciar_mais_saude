# Roadmap de Evolução do Gerenciar Mais Saúde

**Propósito:** manter visíveis decisões e frentes de evolução que atravessam várias SPECs, sem ampliar o escopo da implementação em andamento.

**Estado atual do produto:** frontend com dados e persistência mock. As ideias deste roadmap não autorizam integração real, mudança de domínio ou alteração de escopo por si só. Cada entrega futura deve ser detalhada em uma SPEC própria, conforme `docs/AGENTS.md` e `docs/specs/TEMPLATE_SPEC.md`.

**Atualizado em:** 2026-10-10

## Como acompanhar

- Use os identificadores `EVOL-NNN` para referenciar um item em uma SPEC, PRD ou conversa de planejamento.
- Este documento registra intenção e perguntas em aberto; os critérios de aceite e contratos de dados pertencem à SPEC da entrega.
- Atualize o status e os documentos relacionados quando uma frente começar ou for concluída.
- A SPEC ativa continua sendo a fonte de instruções para sua implementação. Este roadmap não altera anti-escopo nem aprova trabalho de backend.

## Frentes futuras

| ID | Frente | Estado | Rastreamento / próximo passo |
| --- | --- | --- | --- |
| EVOL-001 | Ampliar o domínio para outros tipos de pessoa jurídica além de clínicas que ofertam serviços de saúde | A explorar | Definir quais tipos de organização podem participar, o que oferecem, como se cadastram e quais regras de aprovação e permissões se aplicam. Não assumir que toda pessoa jurídica será prestadora de serviços clínicos. |
| EVOL-002 | Evoluir do frontend mock-first para backend, API e persistência centralizada | Futuro | Depois de estabilizar os fluxos e contratos mock, planejar autenticação, API, banco de dados, migração dos dados locais, geocodificação/endereço por API e limites de responsabilidade entre frontend e backend. A localização por API deve substituir a lista local de demonstração quando o fluxo consumir API e dados reais; avaliar provedor, cobertura, custos, privacidade e política de fallback em SPEC própria. Requer SPEC própria e autorização explícita antes de criar backend, banco ou integração externa. |
| EVOL-003 | Incorporar ao app mobile os fluxos web de busca, carrinho e agendamento | Futuro | O fluxo web é a primeira entrega da SPEC-06. Definir a experiência mobile em etapa própria depois da validação do contrato mock/web. |
| EVOL-004 | Reduzir o JavaScript carregado inicialmente por divisão de código por rota | A acompanhar | O build de 2026-10-10 após os ajustes do fluxo SPEC-06 reporta chunk JavaScript principal em torno de 625.15 kB sem compressão (173.83 kB com gzip), acima do limite padrão de 500 kB. Investigar `React.lazy`/`Suspense` nas rotas de `src/App.jsx`, medir o resultado e manter o limite realista; aumentar o limite sozinho apenas suprime o aviso. |
| EVOL-005 | Integrar Google Auth e notificações de agendamento via WhatsApp | Futuro | Planejar após as decisões de API e backend de EVOL-002. Google Auth usa OAuth/OIDC e requer configuração do cliente e validação segura do token; notificações WhatsApp usam a WhatsApp Business Platform ou um provedor oficial, com credenciais, templates e webhooks. Definir arquitetura, custos, privacidade e contratos em SPEC própria antes de integrar. |
| EVOL-006 | Aplicar moderação administrativa aos serviços do catálogo público | Adiado | Retomar quando os serviços exibidos vierem de cadastros de clínicas persistidos. Filtrar pendentes, suspensas e rejeitadas, permitindo apenas aprovadas, sem remover as ofertas mock demonstrativas atuais da vitrine. Referência: etapa 6 da SPEC-05 e `docs/prd/checklist-home-clinicle.md`. |
| EVOL-007 | Consolidar formulários e componentes comuns | Mapeado | Revisar `ClinicSignupPage` para reutilizar `FormField` e `inputClassName` de `formUtils`, conforme AGENTS §2. Tratar como refatoração de consistência do credenciamento, sem ampliar campos ou regras da SPEC-05. Detalhar em SPEC própria antes de implementar. |
| EVOL-008 | Padronizar acesso assíncrono aos serviços do front-end com TanStack Query | Mapeado | Mapear chamadas diretas a serviços em `ClinicProfilePage`, `ClinicServicesPage` (incluindo `getClinicProfile`) e `AdminClinicsPage`; planejar hooks de query/mutation, cache e invalidação. TanStack Query é padrão já exigido na fase mock-first e continuará como camada do front-end quando EVOL-002 conectar os serviços à API; não substitui backend nem autoriza criá-lo nesta etapa. Referenciar o PRD da clínica e criar SPEC técnica própria. |
| EVOL-009 | Corrigir copy e alegações quantitativas nas experiências clínica/paciente | Mapeado | Revisar a mensagem de `validateTradeName` no fluxo de credenciamento (SPEC-05) e as mensagens de convênio em `ExamCartItem` no contexto de busca para terceiros (SPEC-06). Na visão clínica da SPEC-04, remover ou fundamentar a alegação de redução de faltas em 38% e a nota fixa 4,9. Agrupar por contexto em SPECs de manutenção de conteúdo, sem alterar agora as regras funcionais concluídas. |
| EVOL-010 | Corrigir cálculo de data local na agenda da clínica | Mapeado | Revisar o cálculo de “hoje” em `ClinicAgendaPage`, que usa data UTC e pode avançar um dia após 21h em UTC−3. Definir o fuso de referência e critérios de aceite em SPEC de manutenção da agenda, vinculada ao PRD da clínica/SPEC-07. |
| EVOL-011 | Revisar persistência de dados pessoais e destinos de privacidade | Mapeado | Avaliar minimização/mascaramento do CPF atualmente persistido em `sessionStorage` e definir destinos funcionais para Termos de Uso e Política de Privacidade nos fluxos de cadastro. Vincular o CPF à spec de credenciais do paciente e os links às specs/PRDs das telas que os exibem; consolidar requisitos transversais em SPEC própria de privacidade antes de alegar conformidade legal. |
| EVOL-012 | Alinhar CI e estratégia de testes automatizados | Mapeado | A CI chama `npm run lint` de “Executar testes”, embora lint não execute testes comportamentais. Corrigir a nomenclatura documental/workflow e planejar cobertura automatizada em SPEC própria; manter lint e build como verificações atuais obrigatórias. |
| EVOL-013 | Reduzir drift e normalizar documentação de produto | Concluído (2026-10-13) | Checklists sincronizadas com as conclusões verificadas; referências ao roadmap atualizadas para EVOL-001..013; `Arquitetura de catalogo e dados.txt` convertida de transcrição em referência técnica coesa, numerada e em português. Manter a sincronização como rotina de fechamento de cada SPEC. |

## Contexto atual e documentos de referência

- [Regras operacionais e fase frontend/mock-first](../AGENTS.md).
- [Landing Page e próximos passos de produto](checklist-landing-page.md).
- [Fluxo do paciente e SPEC-06](checklist-home-patiente.md) e [SPEC-06](../specs/SPEC-06_Carrinho_de_Exames_(Multi-Agendamento)_Resumo_Consolidado_Busca_para_Terceiros.md).
- [Portal e credenciamento da clínica](checklist-home-clinicle.md) e [SPEC-05](../specs/SPEC-05_Credenciamento_Completo_da_Clínica_Moderação_Administrativa.md).
- [Arquitetura de catálogo e dados](Arquitetura%20de%20catalogo%20e%20dados.txt).

## Histórico de atualização

- **2026-10-10:** criado para registrar a possibilidade de ampliar tipos de organização, a evolução futura para backend e banco, a etapa mobile posterior à SPEC-06 e a otimização do bundle observada no build.
- **2026-10-10:** geocodificação de endereços/CEPs por API foi registrada em EVOL-002 para ser planejada junto ao consumo de API e dados reais; a SPEC-06 permanece com regiões e coordenadas mock até essa frente.
- **2026-10-10:** integrações externas de Google Auth e WhatsApp foram registradas como EVOL-005, para serem planejadas junto às APIs e ao backend, sem bloquear os fluxos mock.
- **2026-10-10:** o filtro de moderação sobre o catálogo público foi adiado em EVOL-006 para preservar os serviços demonstrativos mock até que a busca consuma serviços vinculados a cadastros de clínicas.
- **2026-10-13:** registrados os débitos de reutilização de formulários, uso uniforme de TanStack Query, copy e métricas sem fonte, data local da agenda, privacidade, testes/CI e sincronização documental em EVOL-007..013. EVOL-013 concluído após a atualização dos checklists e a normalização da referência de arquitetura.
