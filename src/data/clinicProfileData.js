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
 * Dados padrão de perfil da clínica
 */
export const DEFAULT_CLINIC_PROFILE = {
  tradeName: 'Clínica Mais Saúde Vilas',
  legalName: 'Mais Saúde Serviços Médicos e Diagnósticos Ltda',
  cnpj: '12.345.678/0001-90',
  phone: '(71) 3289-4000',
  whatsapp: '(71) 98765-4321',
  email: 'contato@maissaudevilas.com.br',
  addressStreet: 'Av. Santos Dumont (Estrada do Coco), 4500',
  neighborhood: 'Vilas do Atlântico',
  city: 'Lauro de Freitas',
  state: 'BA',
  zipCode: '42702-400',
  referencePoint: 'Ao lado do Shopping Estrada do Coco',
  openingHours: 'Segunda a Sexta: 07h às 19h | Sábado: 07h às 13h',
  description: 'Estrutura completa e moderna com atendimento humanizado, diagnósticos precisos por imagem, análises laboratoriais e mais de 15 especialidades médicas em Lauro de Freitas.',
  amenities: ['Estacionamento Gratuito', 'Acessibilidade PCD', 'Wi-Fi para Pacientes', 'Café e Água', 'Resultados Online'],
  photos: [],
}
