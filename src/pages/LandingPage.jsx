import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, Building2, HeartPulse, ListChecks, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { StatCard } from '../components/clinic/StatCard'
import brandLogo from '../assets/logo-500-sem-fundo.png'
import AuthModal from '../components/landing/AuthModal'
import AdminAccessModal from '../components/landing/AdminAccessModal'
import ExamCartDrawer from '../components/patient/ExamCartDrawer'
import OrderSummaryModal from '../components/patient/OrderSummaryModal'
import ExamRequestReviewModal from '../components/patient/ExamRequestReviewModal'
import ClinicNicheView from '../components/landing/ClinicNicheView'
import NeutralHeroSelector from '../components/landing/NeutralHeroSelector'
import NicheSegmentedControl from '../components/landing/NicheSegmentedControl'
import PatientNicheView from '../components/landing/PatientNicheView'
import { getRegisteredClinic } from '../services/clinicService'
import { getRegisteredPatient } from '../services/patientService'
import { useNicheSelection } from '../hooks/useNicheSelection'
import { useExamCart } from '../hooks/useExamCart'
import { useCreateAppointmentOrder } from '../hooks/usePatientAppointments'
import { useRegisterPatient } from '../hooks/usePatientProfile'
import { DEFAULT_PATIENT_PROFILE } from '../data/patientProfile'
import { ADMIN_SESSION_STORAGE_KEY } from '../constants/adminAccess'

const LANDING_REGISTRATIONS_QUERY_KEY = ['landing', 'registered-profiles']
const PENDING_ORDER_STORAGE_KEY = 'gms_return_to_exam_list'
const PATIENT_AUTHENTICATED_STORAGE_KEY = 'gms_patient_authenticated'
const LANDING_METRICS = [
  { label: 'Clínicas conectadas', value: '120+', icon: Building2, color: 'blue' },
  { label: 'Atendimentos organizados', value: '94%', icon: Activity, color: 'emerald' },
  { label: 'Avaliação da experiência', value: '4.8/5', icon: HeartPulse, color: 'violet' },
]

function LandingPage() {
  const navigate = useNavigate()
  const { activeNiche, setNiche, returnToNeutral } = useNicheSelection()
  const [isAuthOpen, setAuthOpen] = useState(false)
  const [isAdminAuthOpen, setAdminAuthOpen] = useState(false)
  const [isCartOpen, setCartOpen] = useState(false)
  const [isReviewOpen, setReviewOpen] = useState(false)
  const [draftExam, setDraftExam] = useState(null)
  const [orderSummary, setOrderSummary] = useState(null)
  const [requestError, setRequestError] = useState('')
  const pendingOrderAfterAuth = useRef(false)
  const queryClient = useQueryClient()
  const orderMutation = useCreateAppointmentOrder()
  const registerPatientMutation = useRegisterPatient()
  const { items: cartItems, itemCount, addItem, updateItem, removeItem, clearCart } = useExamCart()
  const authAudience = activeNiche === 'CLINIC' ? 'clinic' : 'patient'
  const { data: registrations } = useQuery({
    queryKey: LANDING_REGISTRATIONS_QUERY_KEY,
    queryFn: async () => {
      const [patient, clinic] = await Promise.all([
        getRegisteredPatient(),
        Promise.resolve(getRegisteredClinic()),
      ])
      return { patient, clinic }
    },
    staleTime: 0,
  })

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const openAuth = useCallback(() => setAuthOpen(true), [])
  const handleAdminAccess = useCallback(() => setAdminAuthOpen(true), [])
  const handleAdminAuthSuccess = useCallback(() => {
    window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true')
    setAdminAuthOpen(false)
    navigate('/admin/clinicas')
  }, [navigate])
  const closeAuth = useCallback(() => {
    setAuthOpen(false)
    const shouldReturnToExamList = pendingOrderAfterAuth.current ||
      window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY) === 'true'
    if (!shouldReturnToExamList) return
    pendingOrderAfterAuth.current = false
    window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
    setCartOpen(true)
  }, [])

  const beginExamRequest = useCallback((item) => {
    setRequestError('')
    setDraftExam(item)
    setCartOpen(true)
  }, [])

  const updateDraftExam = useCallback((_, updates) => {
    setDraftExam((current) => current ? { ...current, ...updates } : current)
  }, [])

  const closeExamList = useCallback(() => {
    setCartOpen(false)
    setDraftExam(null)
  }, [])

  const goToSignup = useCallback(() => {
    if (pendingOrderAfterAuth.current) window.sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, 'true')
    setAuthOpen(false)
    navigate(authAudience === 'clinic' ? '/cadastro-clinica' : '/cadastro-paciente')
  }, [authAudience, navigate])

  const submitOrder = useCallback(async (patient, { navigateToWelcome = false } = {}) => {
    setRequestError('')
    try {
      const order = await orderMutation.mutateAsync({ items: cartItems, patient })
      await clearCart()
      setCartOpen(false)
      setAuthOpen(false)
      if (navigateToWelcome) {
        navigate('/paciente/inicio', {
          state: {
            email: patient.email,
            name: patient.fullName,
            welcomeMessage: 'Cadastro e solicitação concluídos com sucesso. Acompanhe seus exames nesta área.',
          },
        })
      } else {
        setOrderSummary(order)
      }
      window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      pendingOrderAfterAuth.current = false
    } catch (error) {
      setRequestError(error.message || 'Não foi possível registrar os agendamentos. Revise os itens e tente novamente.')
      setCartOpen(true)
      setAuthOpen(false)
      window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      pendingOrderAfterAuth.current = false
    }
  }, [cartItems, clearCart, navigate, orderMutation])

  const handleRequestAppointments = useCallback(() => {
    setRequestError('')
    if (window.sessionStorage.getItem(PATIENT_AUTHENTICATED_STORAGE_KEY) === 'true' && registrations?.patient) {
      submitOrder(registrations.patient)
      return
    }
    pendingOrderAfterAuth.current = true
    window.sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, 'true')
    setCartOpen(false)
    setAuthOpen(true)
  }, [registrations, submitOrder])

  const openRequestReview = useCallback(() => {
    setCartOpen(false)
    setReviewOpen(true)
  }, [])

  const confirmRequestReview = useCallback(() => {
    setReviewOpen(false)
    handleRequestAppointments()
  }, [handleRequestAppointments])

  const handleAuthSubmit = useCallback(async ({ email }) => {
    if (authAudience === 'clinic') {
      setAuthOpen(false)
      navigate('/dashboard')
      return
    }

    const savedPatient = await registerPatientMutation.mutateAsync({
      ...DEFAULT_PATIENT_PROFILE,
      email: email.trim(),
    })
    window.sessionStorage.setItem(PATIENT_AUTHENTICATED_STORAGE_KEY, 'true')
    queryClient.setQueryData(LANDING_REGISTRATIONS_QUERY_KEY, (current) => ({
      ...current,
      patient: savedPatient,
    }))
    if (pendingOrderAfterAuth.current || window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY) === 'true') {
      window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      pendingOrderAfterAuth.current = false
      setNiche('PATIENT')
      setAuthOpen(false)
      await submitOrder(savedPatient, { navigateToWelcome: true })
      return
    }
    setAuthOpen(false)
    navigate('/paciente/inicio', { state: { email: email.trim() } })
  }, [authAudience, navigate, queryClient, registerPatientMutation, setNiche, submitOrder])

  useEffect(() => {
    const shouldResumeOrder = window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY) === 'true'
    if (!shouldResumeOrder || !registrations?.patient || cartItems.length === 0) return
    setNiche('PATIENT')
    setAuthOpen(false)
    if (window.sessionStorage.getItem(PATIENT_AUTHENTICATED_STORAGE_KEY) === 'true') {
      window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      pendingOrderAfterAuth.current = false
      submitOrder(registrations.patient, { navigateToWelcome: true })
      return
    }
    window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
    pendingOrderAfterAuth.current = false
    setCartOpen(true)
  }, [cartItems.length, registrations, setNiche, submitOrder])

  const headerLinks = activeNiche === 'PATIENT'
    ? [
        { id: 'catalogo-paciente', label: 'Catálogo' },
        { id: 'jornada-paciente', label: 'Como funciona' },
        { id: 'depoimentos', label: 'Depoimentos' },
      ]
    : activeNiche === 'CLINIC'
      ? [
          { id: 'beneficios-clinica', label: 'Benefícios' },
          { id: 'jornada-clinica', label: 'Como funciona' },
          { id: 'depoimentos', label: 'Depoimentos' },
        ]
      : []

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header id="inicio" className="sticky top-0 z-40 border-b border-white/20 bg-white/65 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3 md:px-10">
          <Link to="/" onClick={returnToNeutral} className="flex items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2" aria-label="Gerenciar Mais Saúde, voltar à página inicial">
            <img src={brandLogo} alt="" className="h-12 w-12 object-contain" aria-hidden="true" />
            <span>
              <span className="block text-base font-semibold tracking-tight text-slate-900">Gerenciar Mais Saúde</span>
              <span className="block text-xs text-slate-500">Saúde sem burocracia</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {headerLinks.length > 0 && (
              <nav className="hidden items-center gap-5 lg:flex" aria-label="Navegação da página">
                {headerLinks.map((link) => (
                  <button key={link.id} type="button" onClick={() => scrollToSection(link.id)} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                    {link.label}
                  </button>
                ))}
              </nav>
            )}
            {activeNiche !== 'NONE' && <NicheSegmentedControl value={activeNiche} onChange={setNiche} />}
            {activeNiche === 'PATIENT' && (
              <button
                type="button"
                onClick={() => {
                  setDraftExam(null)
                  setCartOpen(true)
                }}
                aria-label={`Abrir lista de exames: ${itemCount} ${itemCount === 1 ? 'exame' : 'exames'}`}
                aria-expanded={isCartOpen}
                className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <ListChecks className={`h-4 w-4 ${itemCount > 0 ? 'text-red-600' : 'text-slate-500'}`} aria-hidden="true" />
                <span className="hidden sm:inline">Lista de exames</span>
                <span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none text-white ${itemCount > 0 ? 'bg-red-600' : 'bg-slate-400'}`}>
                  {itemCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {(registrations?.patient || registrations?.clinic) && (
        <aside className="border-b border-slate-200 bg-white" aria-label="Cadastros existentes">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-sm md:px-10">
            <span className="font-medium text-slate-700">Continue de onde parou:</span>
            {registrations.patient && (
              <button type="button" onClick={() => navigate('/paciente/inicio')} className="font-semibold text-emerald-800 underline decoration-emerald-400 underline-offset-2 hover:text-emerald-950">
                {registrations.clinic ? `Paciente: ${registrations.patient.fullName}` : `Continue como ${registrations.patient.fullName}`}
              </button>
            )}
            {registrations.clinic && (
              <button type="button" onClick={() => navigate('/dashboard')} className="font-semibold text-blue-800 underline decoration-blue-400 underline-offset-2 hover:text-blue-950">
                {registrations.patient ? `Clínica: ${registrations.clinic.tradeName}` : `Continue como ${registrations.clinic.tradeName}`}
              </button>
            )}
          </div>
        </aside>
      )}

      {activeNiche === 'NONE' && (
        <>
          <NeutralHeroSelector onSelectNiche={setNiche} />
          <section className="w-full bg-white py-14 md:py-16" aria-labelledby="metricas-landing-title">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
              <div className="mx-auto max-w-2xl text-center">
                <h2 id="metricas-landing-title" className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Indicadores de desempenho da plataforma</h2>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {LANDING_METRICS.map((metric) => <StatCard key={metric.label} {...metric} sub="Indicador demonstrativo" />)}
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                Indicadores ilustrativos para esta etapa. Os valores serão atualizados quando houver uma base de dados consolidada.
              </p>
            </div>
          </section>
        </>
      )}
      {activeNiche === 'PATIENT' && (
        <PatientNicheView
          onOpenAuth={openAuth}
          onGoToSignup={() => navigate('/cadastro-paciente')}
          onAddToCart={beginExamRequest}
        />
      )}
      {activeNiche === 'CLINIC' && (
        <ClinicNicheView onOpenAuth={openAuth} onGoToSignup={() => navigate('/cadastro-clinica')} />
      )}

      <footer id="contato" className="mt-auto border-t border-slate-900 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                  <img src={brandLogo} alt="" className="h-full w-full object-contain" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-base font-bold tracking-tight text-white">Gerenciar Mais Saúde</span>
                  <span className="block text-xs font-medium text-emerald-400">Saúde Integrada &amp; Sem Burocracia</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Conectando clínicas credenciadas e pacientes para um atendimento humanizado, ágil e transparente na Região Metropolitana e Lauro de Freitas - BA.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span>Plataforma Segura e Em Conformidade com a LGPD</span>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contato &amp; Atendimento</h2>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" /><a href="tel:+557132880000" className="transition hover:text-white">+55 (71) 3288-0000</a></li>
                <li className="flex items-center gap-2.5"><MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" /><a href="https://wa.me/5571999990000" target="_blank" rel="noreferrer" className="transition hover:text-white">WhatsApp: (71) 9 9999-0000</a></li>
                <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" /><a href="mailto:contato@gerenciarmaissaude.com.br" className="transition hover:text-white">contato@gerenciarmaissaude.com.br</a></li>
                <li className="flex items-start gap-2.5 pt-1 text-slate-400"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" /><span>Lauro de Freitas &amp; Salvador - BA</span></li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navegação Rápida</h2>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><button type="button" onClick={() => scrollToSection('inicio')} className="transition hover:text-emerald-400">Início</button></li>
                {headerLinks.map((link) => (
                  <li key={link.id}><button type="button" onClick={() => scrollToSection(link.id)} className="transition hover:text-emerald-400">{link.label}</button></li>
                ))}
                {activeNiche === 'PATIENT' && <li><button type="button" onClick={() => navigate('/cadastro-paciente')} className="font-medium text-emerald-300 transition hover:text-emerald-400">Cadastre-se</button></li>}
                {activeNiche === 'CLINIC' && <li><button type="button" onClick={() => navigate('/cadastro-clinica')} className="font-medium text-emerald-300 transition hover:text-emerald-400">Credenciar Minha Clínica</button></li>}
                <li><button type="button" onClick={handleAdminAccess} className="transition hover:text-emerald-400">Acesso administrativo</button></li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Canais &amp; Redes</h2>
              <p className="text-xs leading-relaxed text-slate-400">Acompanhe atualizações sobre a rede e comunicados de saúde.</p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 shadow-sm transition hover:bg-emerald-600 hover:text-white"><FontAwesomeIcon icon={faFacebookF} className="h-4 w-4" /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 shadow-sm transition hover:bg-emerald-600 hover:text-white"><FontAwesomeIcon icon={faInstagram} className="h-4 w-4" /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 shadow-sm transition hover:bg-emerald-600 hover:text-white"><FontAwesomeIcon icon={faLinkedinIn} className="h-4 w-4" /></a>
                <a href="https://wa.me/5571999990000" target="_blank" rel="noreferrer" title="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 shadow-sm transition hover:bg-emerald-600 hover:text-white"><FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" /></a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row">
              <p>© 2026 Gerenciar Mais Saúde. Todos os direitos reservados.</p>
              <div className="flex items-center gap-5"><span>Termos de Uso</span><span>Políticas de Privacidade</span></div>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-600">GERENCIAR MAIS SAÚDE TECNOLOGIA LTDA • CNPJ: 00.000.000/0001-00 • LAURO DE FREITAS - BA</p>
          </div>
        </div>
      </footer>

      {isAuthOpen && (
        <AuthModal
          audience={authAudience}
          onClose={closeAuth}
          onSuccess={handleAuthSubmit}
          onGoToSignup={goToSignup}
        />
      )}
      {isAdminAuthOpen && <AdminAccessModal onClose={() => setAdminAuthOpen(false)} onSuccess={handleAdminAuthSuccess} />}
      {activeNiche === 'PATIENT' && (
        <ExamCartDrawer
          items={cartItems}
          draftItem={draftExam}
          isOpen={isCartOpen}
          onClose={draftExam?.cartItemId ? () => setDraftExam(null) : closeExamList}
          onAddDraft={(item) => item.cartItemId ? updateItem(item.cartItemId, item) : addItem(item)}
          onDraftAdded={() => {
            if (draftExam?.cartItemId) setDraftExam(null)
            else closeExamList()
          }}
          onUpdateDraft={updateDraftExam}
          onEditItem={(item) => setDraftExam(item)}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
          onClearCart={async () => {
            await clearCart()
            setCartOpen(false)
          }}
          onRequestAppointments={openRequestReview}
          isSubmitting={orderMutation.isPending}
          requestError={requestError}
        />
      )}
      {isReviewOpen && <ExamRequestReviewModal items={cartItems} onClose={() => { setReviewOpen(false); setCartOpen(true) }} onConfirm={confirmRequestReview} />}
      {orderSummary && <OrderSummaryModal order={orderSummary} onClose={() => setOrderSummary(null)} />}
    </div>
  )
}

export default LandingPage
