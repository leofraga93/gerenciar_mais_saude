import { useEffect, useRef, useState } from 'react'
import {
  CLINIC_PHOTO_CATEGORIES,
  DEFAULT_CLINIC_PROFILE,
} from '../../data/clinicProfileData'
import {
  getClinicProfile,
  saveClinicProfile,
} from '../../services/clinicService'
import FormField, { inputClassName } from '../../components/common/FormField'
import Toast from '../../components/common/Toast'
import {
  IconBuilding,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconClose,
  IconEye,
  IconMapPin,
  IconPencil,
  IconPhoto,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconUpload,
} from '../../components/common/Icons'

function ClinicProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_CLINIC_PROFILE)
  const [photos, setPhotos] = useState([])
  const [toast, setToast] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Accordion da visão do paciente (fechado por padrão)
  const [showPatientPreview, setShowPatientPreview] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Edição dos dados cadastrais
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [infoForm, setInfoForm] = useState(DEFAULT_CLINIC_PROFILE)
  const [isSavingInfo, setIsSavingInfo] = useState(false)

  // Modal de visualização expandida
  const [zoomPhoto, setZoomPhoto] = useState(null)

  const fileInputRef = useRef(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const loadData = async () => {
    try {
      const data = await getClinicProfile()
      setProfile(data)
      setInfoForm(data)
      const initialPhotos = data.photos || []
      // Garante que se houver fotos mas nenhuma for capa, a primeira é marcada como capa
      if (initialPhotos.length > 0 && !initialPhotos.some((p) => p.isCover)) {
        initialPhotos[0].isCover = true
      }
      setPhotos(initialPhotos)
      setCarouselIndex(0)
    } catch {
      showToast('Erro ao carregar perfil da clínica.', 'error')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Processa múltiplas imagens (Drop ou Input)
  const processFiles = (files) => {
    if (!files || files.length === 0) return

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      showToast('Selecione arquivos de imagem válidos (PNG, JPG, WebP).', 'error')
      return
    }

    let loadedCount = 0
    const newPhotos = []

    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        const title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)

        newPhotos.push({
          id: photoId,
          url: e.target.result,
          title: title || 'Foto do Estabelecimento',
          category: 'FACHADA',
          isCover: false,
          uploadedAt: new Date().toISOString(),
        })

        loadedCount += 1
        if (loadedCount === imageFiles.length) {
          setPhotos((prev) => {
            const hasCover = prev.some((p) => p.isCover)
            const updated = [...prev, ...newPhotos]
            // Se nenhuma for capa, a primeira vira capa
            if (!hasCover && updated.length > 0) {
              updated[0].isCover = true
            }
            return updated
          })
          setCarouselIndex(0)
          showToast(`${imageFiles.length} foto(s) adicionada(s)!`)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (e) => {
    processFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  // Atualizações inline por foto (mantém a ordem na lista de anexo)
  const updatePhotoTitle = (id, newTitle) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)),
    )
  }

  const updatePhotoCategory = (id, newCategory) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, category: newCategory } : p)),
    )
  }

  // Marca capa sem alterar a ordem da lista superior (a reordenação é feita dinamicamente na pré-visualização)
  const setCoverPhoto = (id) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isCover: p.id === id,
      })),
    )
    // No carrossel da pré-visualização, reinicia no índice 0 (onde a capa é posicionada)
    setCarouselIndex(0)
    showToast('Foto de capa definida! Refletida na 1ª posição da pré-visualização.')
  }

  const removePhoto = (id) => {
    setPhotos((prev) => {
      const remaining = prev.filter((p) => p.id !== id)
      const hasCover = remaining.some((p) => p.isCover)
      if (!hasCover && remaining.length > 0) {
        remaining[0].isCover = true
      }
      return remaining
    })
    setCarouselIndex(0)
    showToast('Foto removida.')
  }

  // Salvar galeria e informações
  const handleSaveAllPhotos = async () => {
    setIsSaving(true)
    try {
      const updatedProfile = { ...profile, photos }
      await saveClinicProfile(updatedProfile)
      setProfile(updatedProfile)
      showToast('Galeria de fotos salva com sucesso!')
    } catch {
      showToast('Erro ao salvar galeria de fotos.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveInfo = async (e) => {
    e.preventDefault()
    setIsSavingInfo(true)
    try {
      const updatedProfile = { ...infoForm, photos }
      await saveClinicProfile(updatedProfile)
      setProfile(updatedProfile)
      setIsEditingInfo(false)
      showToast('Dados cadastrais atualizados com sucesso!')
    } catch {
      showToast('Erro ao salvar dados cadastrais.', 'error')
    } finally {
      setIsSavingInfo(false)
    }
  }

  // Toggle do Accordion da Visão do Paciente
  const handleTogglePatientPreview = () => {
    setShowPatientPreview((prev) => {
      const nextState = !prev
      if (nextState) {
        setCarouselIndex(0) // Sempre abre na 1ª foto da pré-visualização (a capa)
      }
      return nextState
    })
  }

  // Lista de fotos para a pré-visualização: a capa é posicionada dinamicamente na 1ª posição
  const previewPhotos = (() => {
    if (!photos || photos.length === 0) return []
    const coverIdx = photos.findIndex((p) => p.isCover)
    if (coverIdx === -1) return photos
    const cover = photos[coverIdx]
    const others = photos.filter((_, idx) => idx !== coverIdx)
    return [cover, ...others]
  })()

  // Navegação no carrossel da pré-visualização do paciente
  const currentPhoto = previewPhotos[carouselIndex] || previewPhotos[0] || null

  const handleNextPhoto = () => {
    if (previewPhotos.length === 0) return
    setCarouselIndex((prev) => (prev + 1) % previewPhotos.length)
  }

  const handlePrevPhoto = () => {
    if (previewPhotos.length === 0) return
    setCarouselIndex((prev) => (prev - 1 + previewPhotos.length) % previewPhotos.length)
  }

  // Dados da clínica em tempo real para o preview
  const liveClinicData = isEditingInfo ? infoForm : profile

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header Principal */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Atualização Cadastral & Fotos da Clínica
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Gerencie as informações cadastrais e fotos da clínica (fachada, recepção, consultórios,
          estacionamento e equipamentos). Uma galeria completa aumenta a visibilidade e atesta a
          qualidade do seu estabelecimento para os pacientes.
        </p>
      </div>

      {/* 1. Dados Básicos do Estabelecimento */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Informações da Empresa</h2>
            <p className="text-xs text-slate-500">
              Dados do estabelecimento exibidos aos pacientes
            </p>
          </div>
          {!isEditingInfo ? (
            <button
              type="button"
              onClick={() => setIsEditingInfo(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <IconPencil className="h-3.5 w-3.5" />
              Editar dados
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setInfoForm(profile)
                setIsEditingInfo(false)
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar edição
            </button>
          )}
        </div>

        {!isEditingInfo ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-400">Nome Fantasia</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {profile.tradeName || 'Não informado'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">CNPJ</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {profile.cnpj || 'Não informado'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">Telefone / WhatsApp</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {profile.phone} {profile.whatsapp ? `• ${profile.whatsapp}` : ''}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">Endereço (Lauro de Freitas / BA)</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {profile.addressStreet}, {profile.neighborhood}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">Horário de Funcionamento</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {profile.openingHours || 'Segunda a Sexta: 07h às 19h'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">E-mail Comercial</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {profile.email || 'contato@clinica.com.br'}
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-slate-400">Descrição do Estabelecimento</p>
              <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                {profile.description ||
                  'Estrutura completa com equipamentos modernos, atendimento humanizado e facilidade de agendamento em Lauro de Freitas.'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveInfo} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome Fantasia" htmlFor="tradeName" required>
                <input
                  id="tradeName"
                  type="text"
                  value={infoForm.tradeName}
                  onChange={(e) => setInfoForm({ ...infoForm, tradeName: e.target.value })}
                  className={inputClassName(false)}
                  required
                />
              </FormField>

              <FormField label="Telefone Comercial / WhatsApp" htmlFor="phone" required>
                <input
                  id="phone"
                  type="text"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className={inputClassName(false)}
                  required
                />
              </FormField>

              <FormField label="Endereço Completo" htmlFor="addressStreet">
                <input
                  id="addressStreet"
                  type="text"
                  value={infoForm.addressStreet}
                  onChange={(e) => setInfoForm({ ...infoForm, addressStreet: e.target.value })}
                  className={inputClassName(false)}
                  placeholder="Av. Santos Dumont (Estrada do Coco), 4500"
                />
              </FormField>

              <FormField label="Bairro (Lauro de Freitas)" htmlFor="neighborhood">
                <input
                  id="neighborhood"
                  type="text"
                  value={infoForm.neighborhood}
                  onChange={(e) => setInfoForm({ ...infoForm, neighborhood: e.target.value })}
                  className={inputClassName(false)}
                  placeholder="Vilas do Atlântico / Centro"
                />
              </FormField>

              <FormField label="Horário de Atendimento" htmlFor="openingHours">
                <input
                  id="openingHours"
                  type="text"
                  value={infoForm.openingHours}
                  onChange={(e) => setInfoForm({ ...infoForm, openingHours: e.target.value })}
                  className={inputClassName(false)}
                  placeholder="Segunda a Sexta: 07h às 19h | Sábado: 07h às 13h"
                />
              </FormField>

              <FormField label="E-mail de Contato" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  value={infoForm.email}
                  onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                  className={inputClassName(false)}
                />
              </FormField>
            </div>

            <FormField label="Descrição da Estrutura e Diferenciais" htmlFor="description">
              <textarea
                id="description"
                rows={3}
                value={infoForm.description}
                onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })}
                className={inputClassName(false)}
                placeholder="Apresente os diferenciais da clínica para os pacientes..."
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingInfo}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSavingInfo ? 'Salvando...' : 'Salvar Informações'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2. Anexo de Fotos & Gestão Simples da Galeria (Mantém a ordem natural dos uploads) */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Fotos do Estabelecimento</h2>
            <p className="text-xs text-slate-500">
              Anexe fotos da fachada, recepção, consultórios, exames e estacionamento
            </p>
          </div>
          {photos.length > 0 && (
            <button
              type="button"
              onClick={handleSaveAllPhotos}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-60"
            >
              <IconCheck className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar fotos e legendas'}
            </button>
          )}
        </div>

        {/* Dropzone para Múltiplas Fotos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 scale-[0.99]'
              : 'border-slate-300 bg-slate-50/70 hover:border-emerald-500 hover:bg-emerald-50/40'
          }`}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm border border-slate-200">
            <IconUpload className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">
            Arraste uma ou mais fotos aqui ou clique para selecionar
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Envie imagens da Fachada, Recepção, Consultórios, Salas de Exames e Estacionamento
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
            <IconCamera className="h-3.5 w-3.5" />
            Selecionar fotos do dispositivo
          </span>
        </div>

        {/* Lista de Fotos Anexadas na ordem original de upload */}
        {photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <IconPhoto className="mx-auto h-8 w-8 text-slate-300 stroke-1" />
            <p className="mt-2 text-xs font-medium text-slate-600">
              Nenhuma foto anexada no momento.
            </p>
            <p className="text-[11px] text-slate-400">
              Faça o upload acima para que os pacientes vejam o ambiente e a estrutura física da sua clínica.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fotos cadastradas ({photos.length}) — Defina a legenda, tipo de ambiente e a foto de capa
              </p>
              <span className="text-[11px] text-slate-400">
                A foto marcada como Capa lidera a pré-visualização abaixo
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`flex flex-col gap-4 rounded-xl border p-4 transition shadow-xs ${
                    photo.isCover
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Miniatura com indicador visual de capa */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="h-full w-full object-cover"
                      />
                      {photo.isCover && (
                        <div className="absolute top-1 left-1">
                          <span className="inline-flex items-center rounded-sm bg-emerald-600 p-0.5 text-white shadow-xs" title="Foto de Capa Principal">
                            <IconStarFilled className="h-3 w-3" />
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setZoomPhoto(photo)}
                        className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white opacity-0 hover:opacity-100 transition"
                        title="Visualizar ampliada"
                      >
                        <IconEye className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Campos de Legenda e Tipo de Ambiente */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Legenda da Foto #{index + 1}
                        </label>
                        <input
                          type="text"
                          value={photo.title}
                          onChange={(e) => updatePhotoTitle(photo.id, e.target.value)}
                          placeholder="Ex: Entrada Principal na Estrada do Coco"
                          className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Tipo de Ambiente
                        </label>
                        <select
                          value={photo.category}
                          onChange={(e) => updatePhotoCategory(photo.id, e.target.value)}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        >
                          {CLINIC_PHOTO_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Capa e Exclusão */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="coverPhotoGroup"
                        checked={photo.isCover}
                        onChange={() => setCoverPhoto(photo.id)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={`text-xs font-semibold ${photo.isCover ? 'text-emerald-800' : 'text-slate-600'}`}>
                        {photo.isCover ? 'Foto de Capa Principal (Fachada)' : 'Definir como Capa Principal'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition"
                      title="Excluir foto"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAllPhotos}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-60"
              >
                <IconCheck className="h-4 w-4" />
                {isSaving ? 'Salvando fotos...' : 'Salvar todas as fotos e legendas'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Visão do Paciente (Accordion Fechado por Padrão — Aqui a Capa é Dinamicamente a 1ª Foto do Carrossel) */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
        {/* Cabeçalho do Accordion (Toggle) */}
        <button
          type="button"
          onClick={handleTogglePatientPreview}
          className="flex w-full items-center justify-between bg-slate-50/80 px-6 py-4 text-left transition hover:bg-slate-100"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <IconEye className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Visão do Paciente (Pré-visualização do Card e Fotos)
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {photos.length > 0 ? `${photos.length} fotos carregadas` : 'Sem fotos'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {showPatientPreview
                  ? 'Clique para recolher a pré-visualização'
                  : 'Clique para expandir e testar o carrossel iniciando pela foto de capa na 1ª posição'}
              </p>
            </div>
          </div>

          <span className="text-slate-500">
            {showPatientPreview ? (
              <IconChevronUp className="h-5 w-5" />
            ) : (
              <IconChevronDown className="h-5 w-5" />
            )}
          </span>
        </button>

        {/* Conteúdo Expandido do Accordion: Carrossel Dinâmico de Fotos */}
        {showPatientPreview && (
          <div className="border-t border-slate-200 p-6 bg-gradient-to-b from-slate-50/50 to-white space-y-6">
            {previewPhotos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <IconPhoto className="mx-auto h-10 w-10 text-slate-300 stroke-1" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Nenhuma foto cadastrada para exibição
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Adicione fotos na seção acima para testar o carrossel e o card do paciente.
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                {/* Visualizador de Carrossel de Fotos (Inicia sempre na Capa = Posição 1 na Pré-visualização) */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-950">
                  {currentPhoto && (
                    <img
                      src={currentPhoto.url}
                      alt={currentPhoto.title}
                      className="h-full w-full object-cover transition duration-300"
                    />
                  )}

                  {/* Badges no Carrossel */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
                      <IconBuilding className="h-3.5 w-3.5" />
                      {CLINIC_PHOTO_CATEGORIES.find((c) => c.id === currentPhoto?.category)?.label ||
                        'Ambiente'}
                    </span>
                    {currentPhoto?.isCover && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                        <IconStarFilled className="h-3 w-3" />
                        Capa Principal (1ª Foto)
                      </span>
                    )}
                  </div>

                  {/* Contador de Fotos */}
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-xs">
                      Foto {carouselIndex + 1} de {previewPhotos.length}
                    </span>
                  </div>

                  {/* Legenda da Foto no Carrossel */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 text-white">
                    <p className="text-sm font-bold truncate">
                      {currentPhoto?.title || 'Foto do Estabelecimento'}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {CLINIC_PHOTO_CATEGORIES.find((c) => c.id === currentPhoto?.category)?.description}
                    </p>
                  </div>

                  {/* Botões de Navegação Anterior / Próxima */}
                  {previewPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white hover:bg-slate-900 transition"
                        title="Foto anterior"
                      >
                        <IconChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white hover:bg-slate-900 transition"
                        title="Próxima foto"
                      >
                        <IconChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Barra de Miniaturas Clicáveis do Carrossel (A 1ª miniatura à esquerda é sempre a Capa na Pré-visualização) */}
                {previewPhotos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50 p-3">
                    {previewPhotos.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCarouselIndex(idx)}
                        className={`relative h-14 w-18 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                          idx === carouselIndex
                            ? 'border-emerald-600 scale-105 shadow-sm ring-2 ring-emerald-500/20'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={p.title}
                      >
                        <img src={p.url} alt={p.title} className="h-full w-full object-cover" />
                        <div className="absolute top-0.5 left-0.5 flex items-center gap-0.5">
                          <span className={`rounded-xs px-1 text-[9px] font-bold text-white ${idx === 0 ? 'bg-emerald-600' : 'bg-slate-900/80'}`}>
                            #{idx + 1}
                          </span>
                          {p.isCover && (
                            <span className="rounded-xs bg-emerald-600 p-0.5 text-white">
                              <IconStarFilled className="h-2 w-2" />
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Card de Informações da Clínica Reativo em Tempo Real */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {liveClinicData.tradeName || 'Nome da Clínica'}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <IconMapPin className="h-3.5 w-3.5 text-slate-400" />
                        {liveClinicData.addressStreet
                          ? `${liveClinicData.neighborhood || 'Vilas do Atlântico'}, ${liveClinicData.city || 'Lauro de Freitas'}`
                          : 'Lauro de Freitas, BA'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                      <IconStar className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                      4.9
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {liveClinicData.description ||
                      'Estrutura moderna e equipada com consultórios, recepção acolhedora e tecnologia para exames e consultas.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                    {(liveClinicData.amenities || []).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal de Zoom */}
      {zoomPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setZoomPhoto(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3 text-white">
              <div>
                <h3 className="text-sm font-bold">{zoomPhoto.title}</h3>
                <span className="text-[11px] text-emerald-400">
                  {CLINIC_PHOTO_CATEGORIES.find((c) => c.id === zoomPhoto.category)?.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setZoomPhoto(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] w-full overflow-hidden bg-black">
              <img
                src={zoomPhoto.url}
                alt={zoomPhoto.title}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ClinicProfilePage
