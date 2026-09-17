import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react'
import ClinicActionBanner from '../components/clinic/ClinicActionBanner'
import Toast from '../components/common/Toast'
import { getInsuranceNames } from '../data/insurances'
import { useLogoutPatient, usePatientProfile } from '../hooks/usePatientProfile'
import { maskCpf } from '../utils/patientSignupValidation'

function getInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'PC'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Destino mock para ROLE_USUARIO: boas-vindas com visual padronizado de portal, banner de ação e perfil. */
function PatientWelcomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: patient } = usePatientProfile()
  const logoutMutation = useLogoutPatient()

  const initialAlert = location.state?.alert
  const initialWelcome = location.state?.welcomeMessage

  const [toast, setToast] = useState({
    isVisible: Boolean(initialAlert || initialWelcome),
    message: initialAlert || initialWelcome || '',
    type: initialAlert ? 'error' : 'success',
  })

  const email = location.state?.email || patient?.email || ''
  const fullName = location.state?.name || patient?.fullName || ''
  const cpf = patient?.cpf ? maskCpf(patient.cpf) : '—'
  const phone = patient?.phone || '—'
  const insuranceNames = getInsuranceNames(patient?.insuranceIds || ['ins-particular'])
  const initials = getInitials(fullName)

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate('/')
  }

  const handleOpenPlayStore = () => {
    window.open('https://play.google.com/store', '_blank', 'noopener,noreferrer')
  }

  const handleOpenAppStore = () => {
    window.open('https://apps.apple.com', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800"
            title="Iniciais do paciente"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{fullName || 'Paciente'}</p>
            <p className="text-xs text-slate-500">Portal do paciente</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
        >
          Sair
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6 pb-12">
        {/* Banner de Sucesso pós-credenciamento com botões unificados */}
        <ClinicActionBanner
          type="success"
          badge="Credenciamento Realizado com Sucesso"
          title={fullName ? `Bem-vindo, ${fullName}!` : 'Credenciamento concluído!'}
          description="Passo 1 concluído! Seu perfil de paciente foi criado com sucesso. Agora, baixe nosso aplicativo no seu celular para buscar clínicas credenciadas, escolher especialistas e agendar consultas com desconto."
          actions={
            <>
              <button
                type="button"
                onClick={handleOpenAppStore}
                className="inline-flex items-center gap-2 rounded-xl bg-black border border-black px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 cursor-pointer"
              >
                <Smartphone className="h-4 w-4 text-white" />
                App Store
              </button>
              <button
                type="button"
                onClick={handleOpenPlayStore}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Google Play
              </button>
            </>
          }
        />

        {/* Header da Seção Principal (sem redundância de botões) */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Informações cadastrais e convênios vinculados para agendamentos na rede credenciada de Lauro de Freitas e Região.
          </p>
        </div>

        {/* Badges de Contagem e Status (padronizadas com a clínica) */}
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Perfil: <strong>Paciente Ativo</strong>
          </span>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
            Convênios Vinculados: <strong>{insuranceNames.length > 0 ? insuranceNames.length : 1}</strong>
          </span>
          <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800">
            Agendamentos: <strong>Exclusivo no App Mobile</strong>
          </span>
        </div>

        {/* Grid de Informações Cadastrais e Ponte Mobile */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Card: Dados Cadastrais */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <User className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Dados do Paciente</h2>
                <p className="text-xs text-slate-500">Dados protegidos conforme diretrizes da LGPD</p>
              </div>
            </div>

            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-slate-500 font-medium">Nome Completo</dt>
                <dd className="font-semibold text-slate-900">{fullName || '—'}</dd>
              </div>
              <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-slate-500 font-medium">E-mail de Acesso</dt>
                <dd className="font-semibold text-slate-900">{email || '—'}</dd>
              </div>
              <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-slate-500 font-medium">CPF</dt>
                <dd className="font-semibold text-slate-900 font-mono">{cpf}</dd>
              </div>
              <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-slate-500 font-medium">Telefone / WhatsApp</dt>
                <dd className="font-semibold text-slate-900">{phone}</dd>
              </div>
              <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-slate-500 font-medium">Convênios Selecionados</dt>
                <dd className="flex flex-wrap gap-1.5 pt-1 sm:pt-0">
                  {insuranceNames.length > 0 ? (
                    insuranceNames.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200"
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Particular
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* Card: Orientações de Agendamento e Download */}
          <section className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Smartphone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sua Saúde no Bolso</h2>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    App Mobile Oficial
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  O agendamento com geolocalização e escolha de horários em Lauro de Freitas e Região acontece <strong>exclusivamente pelo aplicativo</strong>.
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>Pesquise por exames, consultas e especialidades.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>Garanta preços negociados e valores acessíveis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>Confirmação ágil com taxa de agendamento de R$ 5,00 via PIX.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 border-t border-emerald-100 pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Disponível para download
              </p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleOpenPlayStore}
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-600 bg-white px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Google Play (Android)
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenAppStore}
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-600 bg-white px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    App Store (iOS)
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-100/60 p-2 text-[11px] text-emerald-900">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>Seus dados estão protegidos com criptografia e LGPD.</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {toast.isVisible && toast.message ? (
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false, message: '' }))}
        />
      ) : null}
    </div>
  )
}

export default PatientWelcomePage
