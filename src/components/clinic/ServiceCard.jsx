import { getCategoryLabel } from '../../constants/catalogConstants'
import { getInsuranceNames } from '../../data/insurances'
import { formatCurrencyBRL } from '../../utils/serviceValidation'
import { IconClock, IconPencil, IconPhoto, IconTrash } from '../common/Icons'

function ServiceCard({ service, onEdit, onDelete, onToggleStatus, isDeleting }) {
  const insuranceNames = getInsuranceNames(service.insuranceIds)

  return (
    <article
      className={`flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        service.active ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-75'
      }`}
    >
      {/* Imagem do Serviço / Sala de Exame se houver */}
      {service.imageUrl && (
        <div className="relative h-32 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
              <IconPhoto className="h-3 w-3" />
              Equipamento / Sala
            </span>
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900">{service.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    service.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {service.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{getCategoryLabel(service.category)}</p>
            </div>
            <p className="text-lg font-bold text-emerald-700">
              {formatCurrencyBRL(service.privatePrice)}
            </p>
          </div>

          {service.descriptionPrep ? (
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">{service.descriptionPrep}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {service.durationMinutes ? (
              <span className="inline-flex items-center gap-1">
                <IconClock className="h-3.5 w-3.5" />
                {service.durationMinutes} min
              </span>
            ) : null}
            {service.tussCode ? (
              <span className="rounded bg-slate-100 px-2 py-0.5">TUSS {service.tussCode}</span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {insuranceNames.length > 0 ? (
              insuranceNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Sem convênios vinculados</span>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconPencil className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(service)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {service.active ? 'Inativar' : 'Ativar'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(service)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <IconTrash className="h-4 w-4" />
            Remover
          </button>
        </div>
      </div>
    </article>
  )
}

export default ServiceCard
