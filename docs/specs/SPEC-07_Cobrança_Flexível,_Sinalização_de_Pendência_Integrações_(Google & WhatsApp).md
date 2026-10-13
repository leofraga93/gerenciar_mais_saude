### SPEC-07: Cobrança Flexível, Sinalização de Pendência e Integrações (Google & WhatsApp)

* **Status**: PLANEJADO  
* **Data**: 2026-10-07  
* **Última revisão**: 2026-10-08 (Google Auth como extensão do modal contextual da SPEC-04)  
* **Documento PRD de Referência**: `docs/prd/checklist-home-clinicle.md` / `checklist-home-patiente.md`  
* **Especificação Mestre**: Módulo de Cobrança, Trava da Plataforma, Estado de Pendência e Canais Digitais (Item 4 do Mapeamento)

**Dependência da landing:** a SPEC-04 cria/adapta um único `AuthModal` contextual para Paciente ou Clínica e define sua abertura a partir do nicho. Esta spec acrescenta Google Auth ao contexto Paciente desse modal; não criar um segundo modal nem alterar a seleção de nicho. No fluxo de agendamento web da SPEC-06, a autenticação deve retornar ao pedido pendente e permitir sua conclusão mock.

---

### Diagnóstico: Como está vs. O que será ajustado

| Aspecto | Como está Hoje (`StatusBadge.jsx` / `appointmentService.js`) | O que será Ajustado (SPEC-07) |
| :--- | :--- | :--- |
| **Fluxo de Pagamento** | Exigia liquidação imediata da taxa de reserva via PIX antes da liberação do agendamento. | **Cobrança Flexível / Diferida**: A cobrança pode ocorrer na confirmação da clínica ou ser lançada para a próxima solicitação. O princípio *"Não cobramos fora do app"* garante que todas as liquidações permaneçam centralizadas na plataforma. |
| **Estados do Agendamento** | Estados simples: `SOLICITADO`, `CONFIRMADO_CLINICA`, `PAGO`, `CANCELADO`. | **Sinalização de Pendência (`PENDENCIA_PAGAMENTO`)**: Se o exame for confirmado ou realizado pela clínica sem a compensação prévia da taxa/valor, o card do agendamento exibirá o badge **`PENDENCIA_PAGAMENTO`** (Âmbar/Laranja com ícone de alerta) para evitar perdas de controle financeiro. |
| **Autenticação do Paciente** | Apenas e-mail e senha no modal de login. | **Google Auth**: Atalho de autenticação simplificada ("Entrar com Google") no modal do paciente, acelerando o fluxo de login. |
| **Comunicação e Notificações** | Notificações restritas à tela e e-mail. | **Integração com WhatsApp**: Botões de ação para disparo de confirmação de agendamento, envio de orientações de preparo e link/boleto de cobrança diretamente no WhatsApp do paciente. |

---

#### 1. Contexto, Rota e Arquivos Alvo

* **Objetivo da Tarefa**: Implementar o modelo de cobrança flexível dentro da plataforma, incorporar o estado visual de **`PENDENCIA_PAGAMENTO`** no painel da clínica, adicionar a autenticação via **Google Auth** no modal do paciente e disponibilizar a simulação de envios e lembretes via **WhatsApp**.
* **Rota(s) da Aplicação**: 
  * `/` (Modal de autenticação com botão Google Auth).
  * `/dashboard/agenda` (Visualização dos cards de agendamento com o badge `PENDENCIA_PAGAMENTO`).
  * `/dashboard/financeiro` (Acompanhamento dos recebíveis e pendências).
* **Arquivo(s) Alvo**:
  * **Componentes**:
    * `src/components/common/StatusBadge.jsx` (Adição do estado e estilo visual do status `PENDENCIA_PAGAMENTO`).
    * `src/components/clinic/AppointmentCard.jsx` (Inclusão de ações de envio via WhatsApp e indicador de pendência).
    * `src/components/landing/AuthModal.jsx` (Inclusão do botão "Entrar com Google" no formulário do paciente).
    * `src/components/clinic/WhatsAppNotificationModal.jsx` (Modal com modelo de mensagem pré-formatado para envio ao cliente).
  * **Serviços / Data**: `src/services/appointmentService.js` (Lógica de transição de estados e filtros de agendamentos pendentes) e `src/services/authService.js` (Simulação da autenticação Google).

---

#### 2. Ação e Regras de Negócio (Especificação Detalhada)

##### 2.1 Máquina de Estados de Agendamento Reformulada

```text
SOLICITADO -> CONFIRMADO_CLINICA -> PAGO (terminal)
SOLICITADO -> CANCELADO (terminal)
CONFIRMADO_CLINICA -> CANCELADO (terminal)
CONFIRMADO_CLINICA -> PENDENCIA_PAGAMENTO (planejado)
PENDENCIA_PAGAMENTO -> FINALIZADO (planejado)
```

`PAGO` e `CANCELADO` são estados terminais. O pagamento só pode ser registrado após `CONFIRMADO_CLINICA`, e `CANCELADO` só pode ser definido antes de um estado terminal. As transições de `PENDENCIA_PAGAMENTO` e `FINALIZADO` são uma extensão planejada e não autorizam transições de saída de `PAGO`. `AGUARDANDO_PAGAMENTO` e `ESTORNO_SOLICITADO` não fazem parte do contrato deste projeto; não os usar como estados ou aliases.

##### 2.2 Tabela de Definição de Estados (`StatusBadge.jsx`)

| Chave do Estado | Rótulo Exibido | Estilo Tailwind CSS | Regra de Negócio |
| :--- | :--- | :--- | :--- |
| **`SOLICITADO`** | Solicitado | `bg-blue-50 text-blue-700 border-blue-200` | O paciente enviou a solicitação de exames do carrinho. Aguardando confirmação de horário pela clínica. |
| **`CONFIRMADO_CLINICA`** | Confirmado | `bg-amber-50 text-amber-700 border-amber-200` | A clínica confirmou a data e o horário. |
| **`PENDENCIA_PAGAMENTO`** | Pendência Financeira | `bg-orange-50 text-orange-700 border-orange-200` | **Novo Estado**: O exame foi confirmado ou realizado, mas a cobrança/taxa da plataforma ainda não foi liquidada. |
| **`PAGO`** | Reserva Confirmada | `bg-emerald-50 text-emerald-700 border-emerald-200` | Taxa de intermediação de R\$ 5,00 ou valor do exame compensado via PIX/Boleto no aplicativo. |
| **`FINALIZADO`** | Atendimento Concluído | `bg-slate-100 text-slate-700 border-slate-300` | Atendimento realizado com sucesso na clínica. |
| **`CANCELADO`** | Cancelado | `bg-red-50 text-red-700 border-red-200` | Agendamento cancelado com protocolo de estorno emitido se aplicável. |

##### 2.3 Regras de Negócio das Integrações

1. **Atalho Google Auth (`AuthModal.jsx`)**:
   * No formulário de login/cadastro do paciente, exibe o botão **"Entrar com o Google"** com a identidade visual padrão da marca.
   * O clique simula a autenticação OAuth, recupera o nome e e-mail do usuário e redireciona para `/paciente/inicio` ou conclui o agendamento do carrinho.
2. **Ações de Comunicação via WhatsApp (`AppointmentCard.jsx`)**:
   * Nos cards de agendamento da clínica, é exibido o botão secundário com o ícone do WhatsApp.
   * Ao clicar, abre o modal `WhatsAppNotificationModal.jsx` permitindo disparar três tipos de mensagem pré-formatadas para o número do paciente:
     * **Confirmação & Preparo**: Envia a confirmação da data/hora e o texto do campo `descriptionPrep`.
     * **Lembrete de Exame**: Envia mensagem na véspera do atendimento.
     * **Boleto / Chave PIX**: Envia o link/código de cópia do PIX para liquidação da taxa pendente.
3. **Regra "Não Cobramos Fora do App"**:
   * A clínica não realiza cobranças de taxas de intermediação presencialmente no guichê. O valor da taxa de reserva permanece vinculado e registrado no painel do sistema sob o estado `PENDENCIA_PAGAMENTO` até que seja compensado via aplicativo.

---

#### 3. Fluxo, Navegação e Matriz de Casos Excepcionais

##### 3.1 Fluxo de Navegação do Usuário
1. A clínica acessa a rota `/dashboard/agenda`.
2. Visualiza uma solicitação com status `CONFIRMADO_CLINICA`.
3. Se o paciente não tiver liquidado a taxa antes do atendimento, o sistema transita o card para `PENDENCIA_PAGAMENTO`.
4. A recepção da clínica clica no ícone do WhatsApp no card do agendamento.
5. O modal exibe a mensagem pré-formatada com o código PIX da plataforma.
6. A clínica clica em "Enviar via WhatsApp", abrindo o atalho para o aplicativo de mensagens com o texto e o número do paciente pré-preenchidos.
7. Assim que o pagamento é identificado pelo webhook/mock, o status é atualizado para `PAGO`.

##### 3.2 Matriz de Tratamento de Erros e Casos Excepcionais

| Cenário Excepcional | Causa / Condição | Comportamento Esperado do Sistema |
| :--- | :--- | :--- |
| **Tentativa de Transição Direta Inválida** | Tentar mudar de `SOLICITADO` direto para `PAGO` sem confirmação de horário. | A API/Mock bloqueia a transição e exibe notificação via `Toast.jsx`: *"O agendamento precisa ser confirmado pela clínica antes do registro de pagamento."* |
| **Telefone Sem WhatsApp Cadastrado** | O número de telefone informou um fixo ou formato inválido. | O botão de WhatsApp valida o formato do número e exibe alerta: *"Número inválido para envio de WhatsApp. Verifique o cadastro do paciente."* |
| **Tentativa de Finalizar Atendimento com Pendência** | A clínica tenta marcar o atendimento como `FINALIZADO` enquanto o status está em `PENDENCIA_PAGAMENTO`. | O sistema permite a finalização do atendimento físico, mas mantém o registro da pendência financeira no painel `/dashboard/financeiro`. |

---

#### 4. Critérios de Aceite (Definition of Done)

* [ ] O componente `StatusBadge.jsx` renderiza o estado `PENDENCIA_PAGAMENTO` com o estilo laranja/ânbar e ícone de alerta vetorial.
* [ ] Os cards na tela `/dashboard/agenda` exibem o indicador de pendência de pagamento quando o valor/taxa não tiver sido liquidado.
* [ ] O modal `AuthModal.jsx` no modo Paciente inclui o botão funcional "Entrar com o Google".
* [ ] O componente `AppointmentCard.jsx` disponibiliza a ação de envio de mensagens via WhatsApp com os modelos de Confirmação, Lembrete e Boleto/PIX.
* [ ] A rota `/dashboard/financeiro` contabiliza separadamente os valores realizados e os valores sob o status `PENDENCIA_PAGAMENTO`.
* [x] A máquina de estados em `appointmentService.js` valida e restringe as transições permitidas para garantir a integridade dos dados.
* [ ] Nenhum emoji é utilizado na interface dos cards, modais ou badges de status, em conformidade com o `AGENTS.md`.

---

**Status desta spec: PLANEJADO.** A SPEC-07 reutiliza o `AuthModal` contextual da SPEC-04 para acrescentar Google Auth e complementa o fluxo web de agendamento da SPEC-06. Não representa autenticação real nem integração real de backend nesta fase mock-first.

### Acompanhamento posterior relacionado à agenda

O cálculo de data local usado para identificar “hoje” na agenda da clínica está mapeado em EVOL-010. A correção deverá definir fuso de referência e critérios de aceite em SPEC própria, sem ampliar esta SPEC de cobrança e integrações.
