# SPEC-[NUMERO]: [Nome Sucinto da Funcionalidade]

- **Status**: [PENDENTE | EM ANDAMENTO | CONCLUÍDO]
- **Data de Início**: [AAAA-MM-DD]
- **Data de Conclusão**: [AAAA-MM-DD ou "Em aberto"]
- **Documento PRD de Referência**: `docs/prd/[arquivo-especifico].md` (Seção: [Nome da Seção])

> **Instrução para a IA/Agente:** Antes de iniciar a implementação, audite este documento contra o checklist da Seção 7. Se houver qualquer campo com "[A DEFINIR]" ou ambiguidade em regras críticas, **NÃO assuma nem implemente**. Questione o desenvolvedor pontualmente no chat.

---

## 1. Contexto, Rota e Localização
- **Objetivo da Tarefa**: [Descreva em 1 ou 2 frases o que esta entrega faz]
- **Rota(s) da Aplicação**: [Ex: `/dashboard/agenda` ou `/cadastro-paciente`]
- **Arquivo(s) Alvo**:
  - Página / View: [Ex: `src/pages/clinic/ClinicAgendaPage.jsx`]
  - Componentes novos/editados: [Ex: `src/components/clinic/AppointmentCard.jsx`]
  - Serviços / Mocks: [Ex: `src/services/appointmentService.js`]
- **Perfil de Acesso (Role)**: [ROLE_CLINICA | ROLE_USUARIO | PUBLICO]

---

## 2. Contrato de Dados & Persistência (Mock First)
- **Fonte de Dados Inicial**: [Ex: `src/data/appointments.js` ou `sessionStorage` chave `gms_temp`]
- **Query / Mutation Hook**: [Ex: `useAppointments` via `@tanstack/react-query`]
- **Query Key**: [Ex: `['clinic', 'appointments', filters]`]
- **Estrutura do Objeto (Payload/Item)**:
```json
{
  "id": "string ou number",
  "campoObrigatorio": "tipo",
  "status": "SOLICITADO | CONFIRMADO_CLINICA | PAGO | CANCELADO"
}
```

---

## 3. Reuso Mandatório de Componentes (DRY)
Liste os componentes existentes que **DEVEM** ser utilizados:
- [ ] `FormField.jsx` (rótulos e erros acessíveis)
- [ ] `Toast.jsx` (mensagens flutuantes de sucesso/erro)
- [ ] `inputClassName` de `src/utils/formUtils.js`
- [ ] Ícones: exclusivamente `lucide-react` ou `@fortawesome/*` (zero emojis)
- [ ] Outros: [Ex: `StatusBadge.jsx`, `FilterButtonGroup.jsx`, `ClinicActionBanner.jsx`]

---

## 4. Máquina de Estados & Regras de Interação
- **Estado Inicial**: [O que é exibido ao abrir a tela ou componente]
- **Transições Permitidas**:
  - [Ex: `SOLICITADO` -> `CONFIRMADO_CLINICA` ao clicar em "Confirmar"]
  - [Ex: `CONFIRMADO_CLINICA` -> `PAGO` ao registrar pagamento]
- **Transições Proibidas**:
  - [Ex: Proibido ir de `SOLICITADO` diretamente para `PAGO`]
- **Comportamento em Erro / Exceção**:
  - [Ex: Se campo X for inválido, exibir borda vermelha e mensagem em português]
- **Feedback Visual**: [Toast de sucesso, alteração de badge, etc.]

---

## 5. Anti-Escopo (O que NÃO fazer nesta tarefa)
*Esta seção é a barreira contra alucinação de escopo.*
- [ ] **NÃO** criar endpoint ou backend Express real.
- [ ] **NÃO** alterar rotas fora de [especificar rota].
- [ ] **NÃO** utilizar emojis na interface.
- [ ] **NÃO** criar novos arquivos de utilitários se já existirem equivalentes.
- [ ] [Outras vedações específicas desta tarefa]

---

## 6. Critérios de Aceite Fechados (DoD - Definition of Done)
*O agente só conclui a tarefa se todos os itens abaixo forem verificados:*
- [ ] O componente renderiza corretamente sem erros no console.
- [ ] Todos os fluxos de sucesso e validação de erro funcionam interativamente.
- [ ] Linter roda 100% limpo (`npm run lint` ou `lint_applet`).
- [ ] Build da aplicação compila com sucesso (`compile_applet`).

---

## 7. Checklist do Gatekeeper (Auto-auditoria da IA antes de codificar)
A IA deve verificar este checklist. Se algum item for **NÃO**, ela deve perguntar antes:
1. *Os campos de entrada e seus tipos estão 100% claros?* (Sim / Não)
2. *As mensagens de erro e estados vazios foram especificados?* (Sim / Não)
3. *A fonte do mock e chaves de cache do TanStack Query foram informadas?* (Sim / Não)
4. *O escopo está livre de termos vagos como "etc.", "fazer da melhor forma", "e outras opções"?* (Sim / Não)

---

## 8. Fechamento de Ciclo & Rastreabilidade (Obrigatório ao Concluir)
*Ao passar com sucesso no linter e build, a IA DEVE executar os 3 passos de fechamento:*
- [ ] 1. Marcar todos os checkboxes de Critérios de Aceite (Seção 6) como `[x]`.
- [ ] 2. Alterar o cabeçalho desta spec para `Status: CONCLUÍDO` com a data atual.
- [ ] 3. Abrir o arquivo PRD vinculado (indicado no cabeçalho) e marcar o item correspondente como concluído `[x]`, atualizando também as tabelas de status do PRD.

