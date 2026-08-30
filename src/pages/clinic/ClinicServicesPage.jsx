import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ServiceCard from '../../components/clinic/ServiceCard'
import ServiceFormModal from '../../components/clinic/ServiceFormModal'
import Toast from '../../components/common/Toast'
import ClinicActionBanner from '../../components/clinic/ClinicActionBanner'
import { getClinicProfile } from '../../services/clinicService'
import {
  IconCamera,
  IconPlus,
} from '../../components/common/Icons'
import {
  useDeleteService,
  useSaveService,
  useServices,
  useToggleServiceStatus,
} from '../../hooks/useServices'

function ClinicServicesPage() {
  const location = useLocation()
  const isFromSignup = location.state?.welcomeFromSignup
  const clinicName = location.state?.clinicName

  const { data: services = [], isLoading, isError } = useServices()
  const saveMutation = useSaveService()
  const deleteMutation = useDeleteService()
  const toggleMutation = useToggleServiceStatus()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [toast, setToast] = useState(null)
  const [photosCount, setPhotosCount] = useState(null)

  useEffect(() => {
    getClinicProfile()
      .then((data) => {
        setPhotosCount(data?.photos?.length || 0)
      })
      .catch(() => {
        setPhotosCount(0)
      })
  }, [])

  const showToast = (message, type = 'success') => setToast({ message, type })

  const openCreate = () => {
    setEditingService(null)
    setModalOpen(true)
  }

  const openEdit = (service) => {
    setEditingService(service)
    setModalOpen(true)
  }

  const handleSave = async (payload) => {
    await saveMutation.mutateAsync(payload)
    showToast(payload.id ? 'Serviço atualizado com sucesso.' : 'Serviço cadastrado com sucesso.')
  }

  const handleDelete = async (service) => {
    const confirmed = window.confirm(
      `Remover "${service.name}" do catálogo? Esta ação não pode ser desfeita no mock.`,
    )
    if (!confirmed) return
    await deleteMutation.mutateAsync(service.id)
    showToast('Serviço removido do catálogo.')
  }

  const handleToggleStatus = async (service) => {
    await toggleMutation.mutateAsync(service.id)
    showToast(service.active ? 'Serviço inativado.' : 'Serviço ativado no catálogo.')
  }

  const activeCount = services.filter((s) => s.active).length

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Banner de Onboarding após Credenciamento ou Alerta de Fotos Pendentes */}
      {isFromSignup ? (
        <ClinicActionBanner
          type="success"
          badge="Credenciamento Realizado com Sucesso"
          title={clinicName ? `Bem-vindo, ${clinicName}!` : 'Atualização Cadastral'}
          description="Passo 1 concluído! Agora personalize seus procedimentos médicos abaixo e, em seguida, anexe as fotos da fachada e ambientes para publicar o perfil completo da sua clínica."
          actionLabel="Avançar para Fotos da Clínica"
          actionTo="/dashboard/perfil"
        />
      ) : photosCount === 0 ? (
        <ClinicActionBanner
          type="warning"
          badge="Lembrete da Vitrine"
          badgeDetail="Fotos do estabelecimento pendentes"
          title="Cadastre as imagens da sua clínica para aumentar a atratividade"
          description="Os pacientes conferem a fachada, consultórios e equipamentos antes de agendar. Anexe as imagens no seu perfil para concluir a apresentação visual."
          actionLabel="Cadastrar fotos agora"
          actionTo="/dashboard/perfil"
        />
      ) : null}

      {/* Header Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Serviços</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Catálogo de exames e consultas ofertados aos pacientes. Cada serviço possui convênios
            próprios — relação N:N por procedimento (Lauro de Freitas e Região).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/dashboard/perfil"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <IconCamera className="h-4 w-4 text-slate-500" />
            Fotos da Clínica
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition cursor-pointer"
          >
            <IconPlus className="h-4 w-4" />
            Novo serviço
          </button>
        </div>
      </div>

      {/* Badges de Contagem */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
          Total de Procedimentos: <strong>{services.length}</strong>
        </span>
        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
          Ativos no Catálogo: <strong>{activeCount}</strong>
        </span>
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-slate-500">Carregando catálogo…</p>
      ) : null}

      {isError ? (
        <p className="mt-10 text-center text-red-600">Não foi possível carregar os serviços.</p>
      ) : null}

      {!isLoading && !isError && services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Nenhum serviço cadastrado.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Cadastrar primeiro serviço
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && services.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      ) : null}

      <ServiceFormModal
        isOpen={modalOpen}
        initialService={editingService}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />

      {toast ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      ) : null}
    </div>
  )
}

export default ClinicServicesPage
