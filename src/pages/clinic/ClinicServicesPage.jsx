import { useState, useEffect, useMemo } from 'react'
import { SERVICE_CATEGORIES } from '../../constants/catalogConstants'
import { INSURANCES } from '../../data/insurances'
import { STANDARD_PROCEDURES_CATALOG } from '../../data/standardCatalog'
import {
  getClinicServices,
  saveClinicService,
  toggleClinicServiceStatus,
  deleteClinicService,
} from '../../services/serviceCatalogService'
import {
  IconSearch,
  IconClose,
  IconClipboard,
  IconClock,
  IconSearchOff,
  IconBolt,
  IconAlertTriangle,
  IconCheckCircle,
} from '../../components/common/Icons'

function ChevronDown({ className = 'w-4 h-4 text-slate-400' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ClinicServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState(null)

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Controle de Modal (Criar / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState(null)

  // Controle do Modo de Cadastro (Padrão vs Personalizado)
  const [creationMode, setCreationMode] = useState('standard') // 'standard' | 'custom'
  const [selectedStandardId, setSelectedStandardId] = useState('')

  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    category: 'imagem',
    tussCode: '',
    privatePrice: '',
    durationMinutes: 30,
    active: true,
    insuranceIds: [],
    descriptionPrep: '',
  })

  // Erros de Validação por Campo
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Modal de Confirmação de Exclusão
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Carregar dados na montagem
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const data = await getClinicServices()
      setServices(data)
    } catch (err) {
      showToast('Erro ao carregar os serviços do catálogo.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Filtragem dos serviços na tela
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.tussCode.includes(searchQuery.trim())

      const matchesCategory =
        selectedCategory === 'all' || srv.category === selectedCategory

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && srv.active) ||
        (selectedStatus === 'inactive' && !srv.active)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [services, searchQuery, selectedCategory, selectedStatus])

  // Contadores
  const stats = useMemo(() => {
    const total = services.length
    const active = services.filter((s) => s.active).length
    const inactive = total - active
    return { total, active, inactive }
  }, [services])

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'imagem',
      tussCode: '',
      privatePrice: '',
      durationMinutes: 30,
      active: true,
      insuranceIds: INSURANCES.map((i) => i.id), // Marca todos por padrão
      descriptionPrep: '',
    })
    setErrors({})
    setTouched({})
    setEditingServiceId(null)
    setCreationMode('standard')
    setSelectedStandardId('')
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (service) => {
    setEditingServiceId(service.id)
    setCreationMode('custom')
    setFormData({
      name: service.name,
      category: service.category,
      tussCode: service.tussCode || '',
      privatePrice: String(service.privatePrice),
      durationMinutes: service.durationMinutes || 30,
      active: service.active,
      insuranceIds: service.insuranceIds || [],
      descriptionPrep: service.descriptionPrep,
    })
    setErrors({})
    setTouched({})
    setIsModalOpen(true)
  }

  // Quando o usuário escolhe um procedimento padrão do catálogo mestre
  const handleSelectStandardProcedure = (e) => {
    const stdId = e.target.value
    setSelectedStandardId(stdId)

    if (!stdId) return

    const found = STANDARD_PROCEDURES_CATALOG.find((p) => p.id === stdId)
    if (found) {
      setFormData((prev) => ({
        ...prev,
        name: found.name,
        category: found.category,
        tussCode: found.tussCode,
        descriptionPrep: found.suggestedPrep,
        durationMinutes: found.suggestedDuration,
      }))
      setErrors((prev) => ({
        ...prev,
        name: null,
        category: null,
        descriptionPrep: null,
      }))
    }
  }

  // Validação em tempo real
  const validateField = (field, value) => {
    let err = null
    if (field === 'name' && (!value || value.trim().length < 3)) {
      err = 'O nome do procedimento deve conter ao menos 3 caracteres.'
    }
    if (field === 'privatePrice') {
      const num = parseFloat(value)
      if (!value || isNaN(num) || num <= 0) {
        err = 'Informe um valor particular válido maior que R$ 0,00.'
      }
    }
    if (field === 'descriptionPrep' && (!value || value.trim().length < 5)) {
      err = 'Descreva as orientações de preparo para o paciente.'
    }
    if (field === 'insuranceIds' && (!value || value.length === 0)) {
      err = 'Selecione ao menos 1 convênio ou a opção Particular.'
    }

    setErrors((prev) => ({ ...prev, [field]: err }))
    return err
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }

  // Alternar checkbox de convênio (N:N)
  const toggleInsurance = (insuranceId) => {
    const current = formData.insuranceIds || []
    let updated = []
    if (current.includes(insuranceId)) {
      updated = current.filter((id) => id !== insuranceId)
    } else {
      updated = [...current, insuranceId]
    }
    setFormData((prev) => ({ ...prev, insuranceIds: updated }))
    if (touched.insuranceIds) {
      validateField('insuranceIds', updated)
    }
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()

    const errName = validateField('name', formData.name)
    const errPrice = validateField('privatePrice', formData.privatePrice)
    const errPrep = validateField('descriptionPrep', formData.descriptionPrep)
    const errIns = validateField('insuranceIds', formData.insuranceIds)

    if (errName || errPrice || errPrep || errIns) {
      setTouched({
        name: true,
        privatePrice: true,
        descriptionPrep: true,
        insuranceIds: true,
      })
      return
    }

    try {
      const payload = {
        id: editingServiceId,
        ...formData,
      }
      const saved = await saveClinicService(payload)

      if (editingServiceId) {
        setServices((prev) =>
          prev.map((item) => (item.id === saved.id ? saved : item))
        )
        showToast(`Serviço "${saved.name}" atualizado com sucesso!`)
      } else {
        setServices((prev) => [saved, ...prev])
        showToast(`Novo serviço "${saved.name}" publicado com sucesso!`)
      }

      setIsModalOpen(false)
      resetForm()
    } catch (err) {
      showToast('Erro ao salvar o serviço. Tente novamente.', 'error')
    }
  }

  // Alternar status Ativo/Inativo
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const updated = await toggleClinicServiceStatus(id)
      setServices((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      )
      showToast(
        `Serviço ${updated.active ? 'ativado' : 'inativado'} com sucesso!`
      )
    } catch {
      showToast('Erro ao alterar status do serviço.', 'error')
    }
  }

  // Excluir serviço
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteClinicService(deleteConfirmId)
      setServices((prev) => prev.filter((item) => item.id !== deleteConfirmId))
      showToast('Serviço removido do catálogo.', 'success')
      setDeleteConfirmId(null)
    } catch {
      showToast('Erro ao remover o serviço.', 'error')
    }
  }

  const formatPrice = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0)
  }

  return (
    <div className="mx-auto max-w-7xl pb-12">
      {/* Banner de Notificação Toast */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${
            toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <IconAlertTriangle className="h-5 w-5 text-white" />
          ) : (
            <IconCheckCircle className="h-5 w-5 text-white" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Serviços</h1>
          <p className="mt-1 text-sm text-slate-600">
            Cadastre os exames e consultas ofertados pela sua clínica para disponibilizá-los aos pacientes.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <span>+</span> Cadastrar Novo Serviço
        </button>
      </div>

      {/* Cards de Métricas / Contadores */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Cadastrado
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {stats.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">Serviços no catálogo</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Visíveis para Pacientes
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">
            {stats.active}
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">Status Ativo</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Pausados / Ocultos
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-600">
            {stats.inactive}
          </p>
          <p className="mt-1 text-xs text-slate-500">Status Inativo</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid gap-3 md:grid-cols-12">
          {/* Busca por texto */}
          <div className="md:col-span-6">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Buscar procedimento ou código TUSS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <IconSearch className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Ultrassom, Hemograma, 40901124..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-8 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro por Categoria */}
          <div className="md:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Categoria
            </label>
            <div className="relative w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Todas as categorias</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* Filtro por Status */}
          <div className="md:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Status de Oferta
            </label>
            <div className="relative w-full">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos (Visíveis)</option>
                <option value="inactive">Inativos (Pausados)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Serviços Cadastrados */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <p className="animate-pulse">Carregando catálogo de serviços...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="flex justify-center text-slate-300">
              <IconSearchOff className="h-12 w-12" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-800">
              {services.length === 0
                ? 'Nenhum serviço cadastrado ainda'
                : 'Nenhum serviço corresponde aos filtros'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {services.length === 0
                ? 'Sua clínica ainda não cadastrou procedimentos. Cadastre os exames e consultas pertinentes para que fiquem visíveis aos pacientes.'
                : 'Tente alterar os termos de pesquisa ou limpar os filtros de categoria e status.'}
            </p>
            {services.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                + Cadastrar Primeiro Serviço
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const catObj = SERVICE_CATEGORIES.find((c) => c.id === service.category)
              return (
                <article
                  key={service.id}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
                    service.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-85'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          service.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            service.active ? 'bg-emerald-600' : 'bg-slate-500'
                          }`}
                        />
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {catObj ? catObj.label : service.category}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                      {service.name}
                    </h3>

                    {service.tussCode && (
                      <p className="mt-1 text-xs text-slate-500">
                        TUSS: <span className="font-mono font-medium text-slate-700">{service.tussCode}</span>
                      </p>
                    )}

                    <div className="mt-3">
                      <p className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <IconClipboard className="h-3.5 w-3.5 text-emerald-600" />
                        Orientações para o Paciente:
                      </p>
                      <p className="line-clamp-2 mt-0.5 text-xs text-slate-600">
                        {service.descriptionPrep}
                      </p>
                    </div>

                    {/* Convênios Aceitos (N:N) */}
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">
                        Convênios Aceitos:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(service.insuranceIds || []).map((insId) => {
                          const insObj = INSURANCES.find((i) => i.id === insId)
                          return (
                            <span
                              key={insId}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
                            >
                              {insObj ? insObj.name : insId}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Particular</span>
                        <span className="text-lg font-extrabold text-emerald-700">
                          {formatPrice(service.privatePrice)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <IconClock className="h-3.5 w-3.5" />
                        <span>{service.durationMinutes} min</span>
                      </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(service.id, service.active)}
                        className={`font-semibold hover:underline ${
                          service.active ? 'text-slate-600' : 'text-emerald-700'
                        }`}
                      >
                        {service.active ? 'Pausar Oferta' : 'Ativar Oferta'}
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="font-bold text-emerald-700 hover:text-emerald-900"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(service.id)}
                          className="font-bold text-rose-600 hover:text-rose-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Cadastro / Edição de Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingServiceId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Publique as regras, valores e convênios aceitos para os pacientes no aplicativo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            {/* Alternador de Modo de Criação (Catálogo Padrão vs Personalizado) */}
            {!editingServiceId && (
              <div className="mt-4 rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200">
                <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
                  <IconBolt className="h-4 w-4 text-emerald-700" />
                  Agilize seu cadastro:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreationMode('standard')}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                      creationMode === 'standard'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    Exame do Catálogo Padrão (Autopreenchido)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode('custom')
                      setSelectedStandardId('')
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                      creationMode === 'custom'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    Digitar Nome Personalizado
                  </button>
                </div>

                {creationMode === 'standard' && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-semibold text-emerald-900">
                      Selecione um procedimento padrão (Região Lauro de Freitas/BA):
                    </label>
                    <div className="relative w-full">
                      <select
                        value={selectedStandardId}
                        onChange={handleSelectStandardProcedure}
                        className="w-full appearance-none rounded-xl border border-emerald-300 bg-white py-2 pl-3 pr-8 text-xs outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">-- Escolha da lista oficial TUSS --</option>
                        {STANDARD_PROCEDURES_CATALOG.map((std) => (
                          <option key={std.id} value={std.id}>
                            {std.name} ({std.tussCode ? `TUSS ${std.tussCode}` : 'Sem TUSS'})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                        <ChevronDown className="h-4 w-4 text-emerald-700" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form className="mt-4 space-y-4" onSubmit={handleSubmitForm}>
              {/* Nome do Serviço */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nome do Procedimento / Exame <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Ex: Ultrassom Abdominal Total"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    errors.name && touched.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                )}
              </div>

              {/* Categoria e Código TUSS */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Categoria <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative w-full">
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                      <ChevronDown />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Código TUSS (Padrão ANS)
                  </label>
                  <input
                    type="text"
                    value={formData.tussCode}
                    onChange={(e) => handleInputChange('tussCode', e.target.value)}
                    placeholder="Ex: 40901124"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Valor Particular R$ e Duração Estimada */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Valor Particular (R$) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.privatePrice}
                    onChange={(e) => handleInputChange('privatePrice', e.target.value)}
                    onBlur={() => handleBlur('privatePrice')}
                    placeholder="180.00"
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      errors.privatePrice && touched.privatePrice ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                  {errors.privatePrice && touched.privatePrice && (
                    <p className="mt-1 text-xs text-rose-600">{errors.privatePrice}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Duração Estimada (minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={formData.durationMinutes}
                    onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
                    placeholder="30"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Multi-select de Convênios Aceitos (N:N por Procedimento) */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Convênios Aceitos para este Exame <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Marque os planos de saúde aceitos especificamente para este procedimento:
                </p>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
                  {INSURANCES.map((ins) => {
                    const checked = (formData.insuranceIds || []).includes(ins.id)
                    return (
                      <label
                        key={ins.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer transition ${
                          checked
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleInsurance(ins.id)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{ins.name}</span>
                      </label>
                    )
                  })}
                </div>
                {errors.insuranceIds && touched.insuranceIds && (
                  <p className="mt-1 text-xs text-rose-600">{errors.insuranceIds}</p>
                )}
              </div>

              {/* Orientações de Preparo para o Paciente */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Descrição e Orientações de Preparo <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.descriptionPrep}
                  onChange={(e) => handleInputChange('descriptionPrep', e.target.value)}
                  onBlur={() => handleBlur('descriptionPrep')}
                  placeholder="Ex: Jejum obrigatório de 8 horas. Beber 4 copos de água 1h antes do exame."
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    errors.descriptionPrep && touched.descriptionPrep ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.descriptionPrep && touched.descriptionPrep && (
                  <p className="mt-1 text-xs text-rose-600">{errors.descriptionPrep}</p>
                )}
              </div>

              {/* Status Ativo/Inativo */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="active-check"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="active-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Manter serviço ativo e visível na vitrine pública
                </label>
              </div>

              {/* Botões do Modal */}
              <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  {editingServiceId ? 'Salvar Alterações' : 'Publicar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="flex justify-center text-amber-500 mb-2">
              <IconAlertTriangle className="h-10 w-10 text-amber-500" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-slate-900">
              Confirmar exclusão de serviço?
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Esta ação removerá o procedimento do catálogo da clínica.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicServicesPage
