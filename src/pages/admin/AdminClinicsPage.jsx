import { useState } from 'react'
import { Check, CircleX, LogOut, Pause, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import brandLogo from '../../assets/logo-500-sem-fundo.png'
import { ADMIN_SESSION_STORAGE_KEY } from '../../constants/adminAccess'
import {
  CLINIC_APPROVAL_STATUS,
  getRegisteredClinics,
  updateClinicApprovalStatus,
} from '../../services/clinicService'
import { formatCnpj, formatPhone } from '../../utils/clinicSignupValidation'

const STATUS_PRESENTATION = {
  [CLINIC_APPROVAL_STATUS.PENDING]: {
    label: 'Pendente de análise',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  [CLINIC_APPROVAL_STATUS.APPROVED]: {
    label: 'Aprovada',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  [CLINIC_APPROVAL_STATUS.SUSPENDED]: {
    label: 'Suspensa',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  [CLINIC_APPROVAL_STATUS.REJECTED]: {
    label: 'Rejeitada',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
}

function formatRegistrationDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR')
}

function AdminClinicsPage() {
  const navigate = useNavigate()
  const [clinics, setClinics] = useState(() => getRegisteredClinics())
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const handleLogout = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
    navigate('/', { replace: true })
  }

  const handleStatusChange = (clinic, status) => {
    setError('')
    try {
      const updatedClinic = updateClinicApprovalStatus(clinic.id, status)
      setClinics((currentClinics) => currentClinics.map((item) => item.id === clinic.id ? updatedClinic : item))
      setFeedback(`Status de ${clinic.tradeName || clinic.legalName} atualizado para ${STATUS_PRESENTATION[status].label.toLowerCase()}.`)
    } catch {
      setError('Não foi possível atualizar o status desta clínica. Atualize a lista e tente novamente.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Gerenciar Mais Saúde" className="h-10 w-10 object-contain" />
            <h1 className="text-lg font-bold">Moderação de clínicas</h1>
          </div>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-600" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Clínicas cadastradas</h2>
            <p className="mt-1 text-sm text-slate-600">Revise os dados e atualize o status de moderação de cada cadastro.</p>
          </div>
        </div>

        <div aria-live="polite" className="space-y-2">
          {feedback ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p> : null}
          {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        </div>

        {clinics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-slate-800">Nenhuma clínica cadastrada</h3>
            <p className="mt-2 text-sm text-slate-600">Os novos credenciamentos aparecerão aqui para análise.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Clínica</th>
                    <th scope="col" className="px-5 py-3 font-semibold">CNPJ</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Contato</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Cadastro</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clinics.map((clinic) => {
                    const status = STATUS_PRESENTATION[clinic.statusAprovacao] || STATUS_PRESENTATION[CLINIC_APPROVAL_STATUS.PENDING]
                    return (
                      <tr key={clinic.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{clinic.tradeName || 'Nome fantasia não informado'}</p>
                          <p className="mt-1 text-xs text-slate-500">{clinic.legalName || 'Razão social não informada'}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{formatCnpj(clinic.cnpj)}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p>{clinic.email || 'E-mail não informado'}</p>
                          <p className="mt-1 text-xs text-slate-500">{clinic.phone ? formatPhone(clinic.phone) : 'Telefone não informado'}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{formatRegistrationDate(clinic.registeredAt)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => handleStatusChange(clinic, CLINIC_APPROVAL_STATUS.APPROVED)} disabled={clinic.statusAprovacao === CLINIC_APPROVAL_STATUS.APPROVED} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />Aprovar
                            </button>
                            <button type="button" onClick={() => handleStatusChange(clinic, CLINIC_APPROVAL_STATUS.SUSPENDED)} disabled={clinic.statusAprovacao === CLINIC_APPROVAL_STATUS.SUSPENDED} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50">
                              <Pause className="h-3.5 w-3.5" aria-hidden="true" />Suspender
                            </button>
                            <button type="button" onClick={() => handleStatusChange(clinic, CLINIC_APPROVAL_STATUS.REJECTED)} disabled={clinic.statusAprovacao === CLINIC_APPROVAL_STATUS.REJECTED} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                              <CircleX className="h-3.5 w-3.5" aria-hidden="true" />Rejeitar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminClinicsPage
