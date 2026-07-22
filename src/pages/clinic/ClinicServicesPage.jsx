import { SERVICE_CATEGORIES } from '../../constants/catalogConstants'
import { INSURANCES } from '../../data/insurances'

function ClinicServicesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900">Meus Serviços</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Catálogo de exames e consultas para o marketplace B2B2C. Cada serviço terá convênios
        próprios (relação N:N por procedimento — ver arquitetura de catálogo).
      </p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Categorias previstas no cadastro</h2>
        <p className="mt-1 text-sm text-slate-500">
          Referência: Lauro de Freitas / Região Metropolitana de Salvador.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {SERVICE_CATEGORIES.map((category) => (
            <li
              key={category.id}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm"
            >
              <p className="font-medium text-emerald-800">{category.label}</p>
              <p className="mt-1 text-slate-600">
                Ex.: {category.examples.slice(0, 3).join(', ')}
                {category.examples.length > 3 ? '…' : ''}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Convênios mestre (multi-select futuro)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {INSURANCES.map((insurance) => (
            <span
              key={insurance.id}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
            >
              {insurance.name}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Listagem e modal de cadastro de serviços — checklist §4.4 (próxima entrega)
      </div>
    </div>
  )
}

export default ClinicServicesPage
