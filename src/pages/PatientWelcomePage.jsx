import { createElement, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
  CreditCard,
  Download,
  ExternalLink,
  Heart,
  PencilLine,
  Search,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react'
import ClinicActionBanner from '../components/clinic/ClinicActionBanner'
import PatientTopPriorityBar from '../components/patient/PatientTopPriorityBar'
import PatientRecentOrdersCard from '../components/patient/PatientRecentOrdersCard'
import PatientProfileEditModal from '../components/patient/PatientProfileEditModal'
import AttendanceDeclarationModal from '../components/patient/AttendanceDeclarationModal'
import Toast from '../components/common/Toast'
import { getInsuranceNames } from '../data/insurances'
import {
  useLogoutPatient,
  usePatientProfile,
  useUpdatePatientProfile,
} from '../hooks/usePatientProfile'
import {
  usePatientAppointments,
  useSubmitPatientAttendance,
} from '../hooks/usePatientAppointments'
import { usePatientOrderFees, usePayOrderFee } from '../hooks/useOrderFees'
import { maskCpf } from '../utils/patientSignupValidation'
import { PATIENT_ATTENDANCE } from '../constants/billingConstants'

function getInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'PC'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const PLATFORM_BENEFITS = [
  {
    icon: Search,
    title: 'Encontre o que precisa:',
    text: 'pesquise exames, consultas e especialidades médicas.',
  },
  {
    icon: Heart,
    title: 'Economize no seu cuidado:',
    text: 'encontre preços acessíveis em clínicas credenciadas.',
  },
  {
    icon: Smartphone,
    title: 'Praticidade na palma da mão:',
    text: 'solicite agendamentos de forma rápida, fácil e descomplicada.',
  },
  {
    icon: CreditCard,
    title: 'Taxa de agendamento acessível:',
    text: 'A cada requisição médica de R$ 5,00, com pagamento à vista.',
  },
]

/** Destino mock para ROLE_USUARIO: boas-vindas com token ativo, taxa única, edição de perfil e catálogo. */
function PatientWelcomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: patient } = usePatientProfile()
  const { data: appointments = [] } = usePatientAppointments(patient?.id)
  const { data: orderFees = [] } = usePatientOrderFees(patient?.id)
  const payOrderFeeMutation = usePayOrderFee()
  const updateProfileMutation = useUpdatePatientProfile()
  const attendanceMutation = useSubmitPatientAttendance()
  const logoutMutation = useLogoutPatient()

  const initialAlert = location.state?.alert
  const initialWelcome = location.state?.welcomeMessage

  const [toast, setToast] = useState({
    isVisible: Boolean(initialAlert || initialWelcome),
    message: initialAlert || initialWelcome || '',
    type: initialAlert ? 'error' : 'success',
  })
  const [payingOrderId, setPayingOrderId] = useState('')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [attendanceTarget, setAttendanceTarget] = useState(null)

  const email = patient?.email || location.state?.email || ''
  const fullName = patient?.fullName || location.state?.name || ''
  const cpf = patient?.cpf ? maskCpf(patient.cpf) : '—'
  const phone = patient?.phone || '—'
  const insuranceNames = getInsuranceNames(patient?.insuranceIds || ['ins-particular'])
  const initials = getInitials(fullName)

  const showToast = (message, type = 'success') =>
    setToast({ isVisible: true, message, type })

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate('/')
  }

  const handlePayOrderFee = async (orderId) => {
    setPayingOrderId(orderId)
    try {
      await payOrderFeeMutation.mutateAsync(orderId)
      showToast(`Taxa de R$ 5,00 do pedido ${orderId} quitada com sucesso via PIX.`)
    } catch (error) {
      showToast(error?.message || 'Não foi possível quitar a taxa agora.', 'error')
    } finally {
      setPayingOrderId('')
    }
  }

  const handleSaveProfile = async (payload) => {
    await updateProfileMutation.mutateAsync(payload)
    setIsEditProfileOpen(false)
    showToast('Dados cadastrais atualizados com sucesso.')
  }

  const handleSubmitAttendance = async (appointmentId, attendance) => {
    try {
      await attendanceMutation.mutateAsync({ appointmentId, attendance })
      setAttendanceTarget(null)
      showToast(
        attendance === PATIENT_ATTENDANCE.ATTENDED
          ? 'Presença confirmada. Obrigado pelo retorno.'
          : 'Ausência registrada no seu histórico.',
      )
    } catch (error) {
      showToast(error?.message || 'Não foi possível registrar seu retorno.', 'error')
    }
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

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 pb-12 md:px-6">
        <ClinicActionBanner
          type="success"
          badge="Cadastro concluído"
          title="Cadastro concluído com sucesso! Seja muito bem-vindo(a) à Gerenciar Mais Saúde!"
          description="Você já pode pesquisar exames, comparar valores e solicitar seus agendamentos pelo site. Acompanhe seu token presencial e a taxa única do pedido logo abaixo."
          actions={
            <>
              <Link
                to="/?nicho=paciente#catalogo-paciente"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Agendar exames
              </Link>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
              >
                <PencilLine className="h-4 w-4" aria-hidden="true" />
                Alterar cadastro
              </button>
            </>
          }
        />

        <PatientTopPriorityBar
          appointments={appointments}
          orderFees={orderFees}
          onPayOrderFee={handlePayOrderFee}
          payingOrderId={payingOrderId}
          onDeclareAttendance={setAttendanceTarget}
        />

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Informações cadastrais, convênios vinculados e histórico de pedidos na rede credenciada de Lauro de Freitas e Região.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
            Perfil: <strong>Paciente Ativo</strong>
          </span>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800 tabular-nums">
            Convênios Vinculados:{' '}
            <strong>{insuranceNames.length > 0 ? insuranceNames.length : 1}</strong>
          </span>
        </div>

        <PatientRecentOrdersCard
          appointments={appointments}
          orderFees={orderFees}
          onPayOrderFee={handlePayOrderFee}
          payingOrderId={payingOrderId}
          onDeclareAttendance={setAttendanceTarget}
        />

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Dados do Paciente</h2>
                    <p className="text-xs text-slate-500">
                      Dados protegidos conforme diretrizes da LGPD
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                >
                  <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                  Alterar cadastro
                </button>
              </div>

              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="font-medium text-slate-500">Nome Completo</dt>
                  <dd className="font-semibold text-slate-900">{fullName || '—'}</dd>
                </div>
                <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="font-medium text-slate-500">E-mail de Acesso</dt>
                  <dd className="font-semibold text-slate-900">{email || '—'}</dd>
                </div>
                <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="font-medium text-slate-500">CPF</dt>
                  <dd className="font-mono font-semibold text-slate-900">{cpf}</dd>
                </div>
                <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="font-medium text-slate-500">Telefone / WhatsApp</dt>
                  <dd className="font-semibold text-slate-900">{phone}</dd>
                </div>
                <div className="flex flex-col py-3 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="font-medium text-slate-500">Convênios Selecionados</dt>
                  <dd className="flex flex-wrap gap-1.5 pt-1 sm:pt-0">
                    {insuranceNames.length > 0 ? (
                      insuranceNames.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
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
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>Seus dados pessoais estão protegidos com criptografia e LGPD.</span>
              </div>
              <Link
                to="/?nicho=paciente#catalogo-paciente"
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Buscar novos exames
              </Link>
            </div>
          </section>

          <section className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Smartphone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sua Saúde no Bolso!</h2>
                  <p className="text-xs font-medium text-emerald-800">
                    Com o aplicativo oficial da Gerenciar Mais Saúde.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600">
                <p>
                  Sua saúde merece praticidade! Pelo nosso site ou aplicativo, você pode solicitar exames, acompanhar seus pedidos e encontrar opções de atendimento de forma simples e acessível.
                </p>
                <p className="font-semibold text-slate-800">
                  Descubra as vantagens de utilizar nossa plataforma:
                </p>
                <ul className="space-y-2.5 text-slate-700">
                  {PLATFORM_BENEFITS.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex items-start gap-2">
                      {createElement(Icon, { className: 'mt-0.5 h-4 w-4 shrink-0 text-emerald-600', 'aria-hidden': true })}
                      <span>
                        <strong className="text-slate-900">{title}</strong> {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-emerald-900">
                  Gerenciar Mais Saúde: mais facilidade para cuidar de você!
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-emerald-100 pt-4">
              <p className="mb-2 text-xs font-semibold text-slate-600">
                Aplicativo oficial (etapa futura)
              </p>
              <div className="grid gap-2">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-600 bg-white px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Google Play (Android)
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </a>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-600 bg-white px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" aria-hidden="true" />
                    App Store (iOS)
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PatientProfileEditModal
        isOpen={isEditProfileOpen}
        patient={patient}
        isSaving={updateProfileMutation.isPending}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <AttendanceDeclarationModal
        appointment={attendanceTarget}
        isSubmitting={attendanceMutation.isPending}
        onClose={() => setAttendanceTarget(null)}
        onSubmit={handleSubmitAttendance}
      />

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
