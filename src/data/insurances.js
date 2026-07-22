/**
 * Lista mestre de convênios da plataforma (mock).
 * Usada no multi-select por serviço (N:N — convenio_servico).
 */
export const INSURANCES = [
  { id: 'ins-bradesco', name: 'Bradesco Saúde' },
  { id: 'ins-unimed', name: 'Unimed' },
  { id: 'ins-cassi', name: 'Cassi' },
  { id: 'ins-sulamerica', name: 'SulAmérica' },
  { id: 'ins-amil', name: 'Amil' },
  { id: 'ins-hapvida', name: 'Hapvida' },
  { id: 'ins-particular', name: 'Particular (sem convênio)' },
]

export function getInsuranceById(id) {
  return INSURANCES.find((item) => item.id === id)
}

export function getInsuranceNames(ids = []) {
  return ids
    .map((id) => getInsuranceById(id)?.name)
    .filter(Boolean)
}
