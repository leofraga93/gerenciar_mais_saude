/**
 * Contratos de catálogo alinhados a docs/Arquitetura de catalogo e dados.txt
 * e ao futuro PostgreSQL (servico + convenio_servico N:N).
 */

/** Categorias principais — filtro rápido no app do paciente. */
export const SERVICE_CATEGORIES = [
  {
    id: 'LABORATORIO',
    label: 'Análises Clínicas (Laboratório)',
    examples: ['Hemograma', 'Glicemia', 'Perfil Lipídico', 'Sumário de Urina'],
  },
  {
    id: 'IMAGEM',
    label: 'Diagnóstico por Imagem',
    examples: ['Ultrassonografia', 'Raio-X', 'Ressonância', 'Tomografia', 'Mamografia'],
  },
  {
    id: 'CARDIOLOGIA',
    label: 'Exames Cardiológicos',
    examples: ['ECG', 'Ecocardiograma', 'MAPA', 'Holter 24h'],
  },
  {
    id: 'CONSULTA',
    label: 'Consultas Especializadas',
    examples: ['Ginecologia', 'Pediatria', 'Ortopedia', 'Dermatologia', 'Cardiologia'],
  },
  {
    id: 'OUTROS',
    label: 'Outros Procedimentos',
    examples: ['Papanicolau', 'Audiometria', 'Endoscopia Digestiva'],
  },
]

/**
 * Shape de Service (mock / API futura).
 * insuranceIds[] → relação N:N com insurances.js (convenio_servico no banco).
 */
export const SERVICE_FIELD_KEYS = [
  'id',
  'name',
  'category',
  'tussCode',
  'privatePrice',
  'insuranceIds',
  'descriptionPrep',
  'durationMinutes',
  'active',
]

export function getCategoryLabel(categoryId) {
  return SERVICE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId
}
