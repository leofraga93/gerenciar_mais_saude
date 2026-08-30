import { useEffect, useRef, useState } from 'react'
import {
  CLINIC_PHOTO_CATEGORIES,
  DEFAULT_CLINIC_PROFILE,
  DEFAULT_OPERATING_DAYS,
  formatOperatingHoursString,
} from '../../data/clinicProfileData'
import {
  getClinicProfile,
  saveClinicProfile,
} from '../../services/clinicService'
import FormField, { inputClassName } from '../../components/common/FormField'
import Toast from '../../components/common/Toast'
import ClinicActionBanner from '../../components/clinic/ClinicActionBanner'
import { ClinicScheduleEditor } from '../../components/clinic/ClinicScheduleEditor'
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
  const uploadSectionRef = useRef(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const loadData = async () => {
    try {
      const data = await getClinicProfile()
      // Garante que haja operatingDays configurado
      const loadedProfile = {
        ...DEFAULT_CLINIC_PROFILE,
        ...data,
        operatingDays: data.operatingDays || DEFAULT_OPERATING_DAYS,
      }
      setProfile(loadedProfile)
      setInfoForm(loadedProfile)
      const initialPhotos = loadedProfile.photos || []
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
    if (e.dataTransfer?.files) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleScrollToUpload = () => {
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    fileInputRef.current?.click()
  }

  // Definir foto de capa principal
  const handleSetCover = (photoId) => {
    setPhotos((prev) =>
      prev.map((photo) => ({
        ...photo,
        isCover: photo.id === photoId,
      })),
    )
    setCarouselIndex(0)
    showToast('Foto de capa principal atualizada!')
  }

  // Atualizar título/legenda da foto
  const handleUpdateTitle = (photoId, newTitle) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, title: newTitle } : p)),
    )
  }

  // Atualizar categoria da foto
  const handleUpdateCategory = (photoId, newCategory) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, category: newCategory } : p)),
    )
  }

  // Excluir foto
  const handleDeletePhoto = (photoId) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== photoId)
      if (filtered.length > 0 && !filtered.some((p) => p.isCover)) {
        filtered[0].isCover = true
      }
      return filtered
    })
    setCarouselIndex(0)
    showToast('Foto removida com sucesso.')
  }

  // Salvar galeria e persistir
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
      // Garante formatação consistente do horário
      const openingHours =
        formatOperatingHoursString(infoForm.operatingDays) || infoForm.openingHours
      const updatedProfile = {
        ...infoForm,
        openingHours,
        photos,
      }
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

  const handleTogglePatientPreview = () => {
    setShowPatientPreview((prev) => {
      const nextState = !prev
      if (nextState) {
        setCarouselIndex(0)
      }
      return nextState
    })
  }

  const previewPhotos = (() => {
    if (!photos || photos.length === 0) return []
    const coverIdx = photos.findIndex((p) => p.isCover)
    if (coverIdx === -1) return photos
    const cover = photos[coverIdx]
    const others = photos.filter((_, idx) => idx !== coverIdx)
    return [cover, ...others]
  })()

  const currentPhoto = previewPhotos[carouselIndex] || previewPhotos[0] || null

  const handleNextPhoto = () => {
    if (previewPhotos.length === 0) return
    setCarouselIndex((prev) => (prev + 1) % previewPhotos.length)
  }

  const handlePrevPhoto = () => {
    if (previewPhotos.length === 0) return
    setCarouselIndex((prev) => (prev - 1 + previewPhotos.length) % previewPhotos.length)
  }

  const liveClinicData = isEditingInfo ? infoForm : profile

  // Formatação do endereço completo
  const formattedAddress = (() => {
    const p = profile
    const parts = []
    if (p.addressStreet) parts.push(p.addressStreet)
    if (p.addressNumber) parts.push(`nº ${p.addressNumber}`)
    if (p.addressComplement) parts.push(`(${p.addressComplement})`)
    
    const cityState = [p.city, p.state].filter(Boolean).join('/')
    if (cityState) parts.push(cityState)
    if (p.zipCode) parts.push(`CEP: ${p.zipCode}`)

    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado'
  })()

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Banner de Ação Recomendada Padronizado */}
      {photos.length === 0 ? (
        <ClinicActionBanner
          type="warning"
          badge="Ação recomendada"
          badgeDetail="Nenhuma foto cadastrada"
          title="Cadastre as imagens da sua clínica para aumentar a atratividade"
          description="Clínicas com fotos da fachada, recepção e consultórios recebem até 3x mais agendamentos. Envie imagens do seu estabelecimento para completar a vitrine."
          actionLabel="Adicionar fotos agora"
          onAction={handleScrollToUpload}
          actionIcon={IconUpload}
        />
      ) : !photos.some((p) => p.isCover) ? (
        <ClinicActionBanner
          type="warning"
          badge="Ação recomendada"
          badgeDetail="Foto de capa não definida"
          title="Defina uma foto como capa principal do estabelecimento"
          description="A foto de capa é o destaque visual principal exibido nas buscas e no topo do carrossel da vitrine para os pacientes."
          actionLabel="Gerenciar fotos"
          onAction={handleScrollToUpload}
          actionIcon={IconCamera}
        />
      ) : !profile.addressStreet && !isEditingInfo ? (
        <ClinicActionBanner
          type="warning"
          badge="Ação recomendada"
          badgeDetail="Endereço não preenchido"
          title="Complete os dados de endereço e localização da clínica"
          description="Informe logradouro, número, bairro e cidade para que os pacientes encontrem a sua unidade facilmente nos mapas e na busca."
          actionLabel="Editar dados cadastrais"
          onAction={() => setIsEditingInfo(true)}
          actionIcon={IconPencil}
        />
      ) : null}

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">Informações da Empresa</h2>
              {/* CNPJ em Evidência */}
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900 shadow-2xs">
                <IconBuilding className="h-3.5 w-3.5 text-emerald-700" />
                <span>CNPJ:</span>
                <span className="font-mono text-emerald-800">
                  {profile.cnpj || 'Não informado'}
                </span>
                <span className="ml-1 inline-flex items-center rounded-sm bg-emerald-600 px-1.5 py-0.2 text-[10px] font-semibold text-white">
                  Credenciada
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Dados do estabelecimento exibidos aos pacientes e sincronizados na plataforma
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
          <div className="mt-6 space-y-6">
            {/* Grid 2 Colunas com a sequência solicitada */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* PRIMEIRA COLUNA:
                  1. Nome Fantasia
                  2. Endereço Completo
                  3. Horário de Atendimento */}
              <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                <div className="border-b border-slate-200/60 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    1. Nome Fantasia
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {profile.tradeName || 'Não informado'}
                  </p>
                </div>

                <div className="border-b border-slate-200/60 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Endereço Completo
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formattedAddress}
                  </p>
                  {profile.referencePoint && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      Ref: {profile.referencePoint}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. Horário de Atendimento
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-800">
                    {profile.openingHours || 'Consulte horários com a recepção'}
                  </p>
                </div>
              </div>

              {/* SEGUNDA COLUNA:
                  1. Telefone Comercial / WhatsApp
                  2. Bairro
                  3. E-mail */}
              <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                <div className="border-b border-slate-200/60 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    1. Telefone Comercial / WhatsApp
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-800">
                    {profile.phone || 'Não informado'}
                    {profile.whatsapp && (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        • WhatsApp: {profile.whatsapp}
                      </span>
                    )}
                  </p>
                </div>

                <div className="border-b border-slate-200/60 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Bairro
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {profile.neighborhood || 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. E-mail Comercial
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {profile.email || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* ABAIXO: Descrição da Estrutura e Diferenciais (Largura Total) */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Descrição da Estrutura e Diferenciais
                </p>
                {!profile.description && (
                  <span className="text-[11px] font-medium text-amber-600">
                    Campo a ser preenchido pela clínica
                  </span>
                )}
              </div>
              {profile.description ? (
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {profile.description}
                </p>
              ) : (
                <div className="mt-2 rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
                  <p className="text-xs text-slate-500">
                    Nenhuma descrição informada ainda. Clique em "Editar dados" para detalhar os
                    diferenciais e instalações da sua clínica.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveInfo} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* PRIMEIRA COLUNA (EDIÇÃO):
                  1. Nome Fantasia
                  2. Endereço Completo (Logradouro, Número, Complemento, Cidade, Estado, Ponto de Ref.)
                  3. Horário de Atendimento */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Coluna 1: Identificação & Localização
                </h3>

                <FormField label="Nome Fantasia" htmlFor="tradeName" required>
                  <input
                    id="tradeName"
                    type="text"
                    value={infoForm.tradeName}
                    onChange={(e) => setInfoForm({ ...infoForm, tradeName: e.target.value })}
                    className={inputClassName(false)}
                    placeholder="Ex: Clínica Vida Plena"
                    required
                  />
                </FormField>

                {/* Subbloco de Endereço Completo */}
                <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-xs font-semibold text-slate-700">Endereço Completo</p>

                  <FormField label="Logradouro / Avenida / Rua" htmlFor="addressStreet">
                    <input
                      id="addressStreet"
                      type="text"
                      value={infoForm.addressStreet || ''}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, addressStreet: e.target.value })
                      }
                      className={inputClassName(false)}
                      placeholder="Ex: Av. Santos Dumont"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-2.5">
                    <FormField label="Número" htmlFor="addressNumber">
                      <input
                        id="addressNumber"
                        type="text"
                        value={infoForm.addressNumber || ''}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, addressNumber: e.target.value })
                        }
                        className={inputClassName(false)}
                        placeholder="Ex: 4500 ou S/N"
                      />
                    </FormField>

                    <FormField label="Complemento" htmlFor="addressComplement">
                      <input
                        id="addressComplement"
                        type="text"
                        value={infoForm.addressComplement || ''}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, addressComplement: e.target.value })
                        }
                        className={inputClassName(false)}
                        placeholder="Ex: Sala 102, Bloco B"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <FormField label="Cidade" htmlFor="city">
                        <input
                          id="city"
                          type="text"
                          value={infoForm.city || ''}
                          onChange={(e) =>
                            setInfoForm({ ...infoForm, city: e.target.value })
                          }
                          className={inputClassName(false)}
                          placeholder="Digite a cidade"
                        />
                      </FormField>
                    </div>

                    <div>
                      <FormField label="Sigla / UF" htmlFor="state">
                        <input
                          id="state"
                          type="text"
                          maxLength={2}
                          value={infoForm.state || ''}
                          onChange={(e) =>
                            setInfoForm({
                              ...infoForm,
                              state: e.target.value.toUpperCase(),
                            })
                          }
                          className={inputClassName(false)}
                          placeholder="UF"
                        />
                      </FormField>
                    </div>
                  </div>

                  <FormField label="Ponto de Referência" htmlFor="referencePoint">
                    <input
                      id="referencePoint"
                      type="text"
                      value={infoForm.referencePoint || ''}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, referencePoint: e.target.value })
                      }
                      className={inputClassName(false)}
                      placeholder="Ex: Próximo ao Shopping Estrada do Coco"
                    />
                  </FormField>
                </div>
              </div>

              {/* SEGUNDA COLUNA (EDIÇÃO):
                  1. Telefone Comercial / WhatsApp
                  2. Bairro
                  3. E-mail */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Coluna 2: Contatos & Região
                </h3>

                <FormField label="Telefone Comercial Principal" htmlFor="phone" required>
                  <input
                    id="phone"
                    type="text"
                    value={infoForm.phone}
                    onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                    className={inputClassName(false)}
                    placeholder="(71) 3289-4000"
                    required
                  />
                </FormField>

                <FormField label="WhatsApp Comercial (Opcional)" htmlFor="whatsapp">
                  <input
                    id="whatsapp"
                    type="text"
                    value={infoForm.whatsapp || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, whatsapp: e.target.value })}
                    className={inputClassName(false)}
                    placeholder="(71) 98765-4321"
                  />
                </FormField>

                <FormField label="Bairro" htmlFor="neighborhood">
                  <input
                    id="neighborhood"
                    type="text"
                    value={infoForm.neighborhood || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, neighborhood: e.target.value })}
                    className={inputClassName(false)}
                    placeholder="Ex: Vilas do Atlântico, Centro, Pituba"
                  />
                </FormField>

                <FormField label="E-mail de Contato" htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    value={infoForm.email || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                    className={inputClassName(false)}
                    placeholder="contato@clinica.com.br"
                  />
                </FormField>
              </div>
            </div>

            {/* SELEÇÃO DE DIAS E HORÁRIOS DE ATENDIMENTO (LARGURA TOTAL E PERFEITAMENTE ALINHADO) */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <ClinicScheduleEditor
                operatingDays={infoForm.operatingDays}
                onChange={(newDays, newString) =>
                  setInfoForm({
                    ...infoForm,
                    operatingDays: newDays,
                    openingHours: newString,
                  })
                }
              />
            </div>

            {/* ABAIXO: Descrição da Estrutura e Diferenciais */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <FormField
                label="Descrição da Estrutura e Diferenciais (preenchido pela clínica)"
                htmlFor="description"
                hint="Descreva as salas de atendimento, equipamentos de diagnóstico, estacionamento e diferenciais para os pacientes."
              >
                <textarea
                  id="description"
                  rows={4}
                  value={infoForm.description || ''}
                  onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })}
                  className={inputClassName(false)}
                  placeholder="Ex: Clínica com 6 consultórios amplos, sala de espera climatizada com café, estacionamento próprio gratuito e equipamentos de ultrassom 4D de última geração."
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setInfoForm(profile)
                  setIsEditingInfo(false)
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingInfo}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <IconCheck className="h-4 w-4" />
                {isSavingInfo ? 'Salvando...' : 'Salvar dados cadastrais'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2. Upload e Gestão de Fotos com Categorias */}
      <section ref={uploadSectionRef} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Galeria de Fotos do Estabelecimento
            </h2>
            <p className="text-xs text-slate-500">
              Anexe fotos da fachada, recepção, consultórios, exames e estrutura física da clínica.
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
                          onChange={(e) => handleUpdateTitle(photo.id, e.target.value)}
                          placeholder="Ex: Fachada Principal"
                          className="mt-0.5 w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Ambiente / Categoria
                        </label>
                        <select
                          value={photo.category}
                          onChange={(e) => handleUpdateCategory(photo.id, e.target.value)}
                          className="mt-0.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-emerald-500 focus:outline-hidden"
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

                  {/* Ações da foto: Capa e Exclusão */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition ${
                        photo.isCover
                          ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {photo.isCover ? (
                        <>
                          <IconStarFilled className="h-3.5 w-3.5 text-white" />
                          Foto de Capa
                        </>
                      ) : (
                        <>
                          <IconStar className="h-3.5 w-3.5 text-slate-400" />
                          Definir como Capa
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Acordeão: Como o Paciente Vê o Perfil e as Fotos */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={handleTogglePatientPreview}
          className="flex w-full items-center justify-between p-6 text-left transition hover:bg-slate-50 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <IconEye className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Visualização do Paciente (Vitrine Pública)
              </h2>
              <p className="text-xs text-slate-500">
                Veja exatamente como o perfil, carrossel de fotos e informações aparecerão no portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs font-semibold text-emerald-700">
              {showPatientPreview ? 'Recolher pré-visualização' : 'Expandir pré-visualização'}
            </span>
            {showPatientPreview ? (
              <IconChevronUp className="h-5 w-5 text-emerald-700" />
            ) : (
              <IconChevronDown className="h-5 w-5" />
            )}
          </div>
        </button>

        {showPatientPreview && (
          <div className="border-t border-slate-200 bg-slate-50/60 p-6">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
              {/* Carrossel da Vitrine */}
              {previewPhotos.length > 0 ? (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={currentPhoto?.url}
                    alt={currentPhoto?.title}
                    className="h-full w-full object-cover"
                  />

                  {/* Badge de Categoria */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
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
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <IconPhoto className="h-12 w-12 stroke-1" />
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Nenhuma foto cadastrada para o carrossel.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Faça o upload na seção acima para visualizar aqui.
                  </p>
                </div>
              )}

              {/* Barra de Miniaturas Clicáveis do Carrossel */}
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
                        ? `${liveClinicData.neighborhood ? `${liveClinicData.neighborhood}, ` : ''}${liveClinicData.city ? `${liveClinicData.city}${liveClinicData.state ? ` - ${liveClinicData.state}` : ''}` : 'Localização da clínica'}`
                        : liveClinicData.city
                          ? `${liveClinicData.city}${liveClinicData.state ? ` - ${liveClinicData.state}` : ''}`
                          : 'Endereço da clínica'}
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
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                    >
                      <IconCheck className="h-3 w-3 text-emerald-600" />
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Horários de atendimento: </span>
                  {liveClinicData.openingHours || 'Consulte horários'}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modal de Zoom da Foto */}
      {zoomPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
          onClick={() => setZoomPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomPhoto(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900 transition"
              title="Fechar"
            >
              <IconClose className="h-5 w-5" />
            </button>
            <img
              src={zoomPhoto.url}
              alt={zoomPhoto.title}
              className="max-h-[75vh] w-full object-contain bg-slate-950"
            />
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{zoomPhoto.title}</p>
                <p className="text-xs text-slate-500">
                  {CLINIC_PHOTO_CATEGORIES.find((c) => c.id === zoomPhoto.category)?.label}
                </p>
              </div>
              {zoomPhoto.isCover && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <IconStarFilled className="h-3.5 w-3.5 text-emerald-600" />
                  Foto de Capa
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default ClinicProfilePage
