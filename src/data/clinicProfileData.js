/**
 * Categorias de fotos do estabelecimento (Vitrine estilo TotalPass / Google Meu Negócio)
 */
export const CLINIC_PHOTO_CATEGORIES = [
  { id: 'FACHADA', label: 'Fachada e Entrada', description: 'Visão externa para identificação fácil pelo paciente' },
  { id: 'RECEPCAO', label: 'Recepção e Espera', description: 'Ambiente de acolhimento e conforto' },
  { id: 'CONSULTORIO', label: 'Consultórios', description: 'Salas de atendimento médico humanizado' },
  { id: 'EXAMES', label: 'Salas de Exames / Tecnologia', description: 'Equipamentos modernos e estrutura de diagnóstico' },
  { id: 'ESTRUTURA', label: 'Acessibilidade e Estacionamento', description: 'Comodidades para o paciente' },
]

/**
 * Lista inicial de fotos (vazia por padrão para exibir apenas o que o usuário cadastrar)
 */
export const DEFAULT_CLINIC_PHOTOS = []

/**
 * Configuração padrão dos dias de funcionamento da clínica
 */
export const DEFAULT_OPERATING_DAYS = [
  { key: 'seg', label: 'Segunda-feira', shortLabel: 'Seg', active: true, open: '07:00', close: '19:00' },
  { key: 'ter', label: 'Terça-feira', shortLabel: 'Ter', active: true, open: '07:00', close: '19:00' },
  { key: 'qua', label: 'Quarta-feira', shortLabel: 'Qua', active: true, open: '07:00', close: '19:00' },
  { key: 'qui', label: 'Quinta-feira', shortLabel: 'Qui', active: true, open: '07:00', close: '19:00' },
  { key: 'sex', label: 'Sexta-feira', shortLabel: 'Sex', active: true, open: '07:00', close: '19:00' },
  { key: 'sab', label: 'Sábado', shortLabel: 'Sáb', active: true, open: '07:00', close: '13:00' },
  { key: 'dom', label: 'Domingo', shortLabel: 'Dom', active: false, open: '08:00', close: '12:00' },
]

/**
 * Função auxiliar para gerar a string resumida de horários a partir dos dias ativos
 */
export function formatOperatingHoursString(days = DEFAULT_OPERATING_DAYS) {
  if (!days || !Array.isArray(days)) return 'Consulte horários'
  const activeDays = days.filter((d) => d.active)
  if (activeDays.length === 0) return 'Horários não definidos'

  // Verifica se seg-sex têm mesmo horário
  const weekdays = ['seg', 'ter', 'qua', 'qui', 'sex']
  const weekdayItems = days.filter((d) => weekdays.includes(d.key))
  const allWeekdaysActive = weekdayItems.every((d) => d.active)
  const firstWd = weekdayItems[0]
  const sameWeekdayHours =
    allWeekdaysActive &&
    weekdayItems.every((d) => d.open === firstWd.open && d.close === firstWd.close)

  const sab = days.find((d) => d.key === 'sab')
  const dom = days.find((d) => d.key === 'dom')

  const parts = []
  if (sameWeekdayHours) {
    parts.push(`Segunda a Sexta: ${firstWd.open} às ${firstWd.close}`)
  } else {
    weekdayItems.forEach((d) => {
      if (d.active) parts.push(`${d.shortLabel}: ${d.open} às ${d.close}`)
    })
  }

  if (sab?.active) {
    parts.push(`Sábado: ${sab.open} às ${sab.close}`)
  }
  if (dom?.active) {
    parts.push(`Domingo: ${dom.open} às ${dom.close}`)
  }

  return parts.join(' | ')
}

/**
 * Dados padrão de perfil da clínica.
 * Descrição, endereço, cidade e bairro começam vazios para que o próprio usuário preencha.
 */
export const DEFAULT_CLINIC_PROFILE = {
  tradeName: '',
  legalName: '',
  cnpj: '',
  phone: '',
  whatsapp: '',
  email: '',
  // Endereço completo estruturado (vazio por padrão)
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  referencePoint: '',
  // Horários
  operatingDays: DEFAULT_OPERATING_DAYS,
  openingHours: formatOperatingHoursString(DEFAULT_OPERATING_DAYS),
  // Descrição vazia por padrão
  description: '',
  amenities: ['Estacionamento Gratuito', 'Acessibilidade PCD', 'Wi-Fi para Pacientes', 'Café e Água', 'Resultados Online'],
  photos: [],
}
