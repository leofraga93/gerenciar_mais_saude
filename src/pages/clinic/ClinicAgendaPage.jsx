function ClinicAgendaPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
      <p className="mt-2 text-slate-600">
        Gestão de marcações com máquina de estados (SOLICITADO → CONFIRMADO → PAGO). Em construção
        (checklist §4.2–4.3).
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Listagem de agendamentos em construção
      </div>
    </div>
  )
}

export default ClinicAgendaPage
