import { STANDARD_PROCEDURES_CATALOG } from './standardCatalog'

/**
 * Base de dados mock de serviços da clínica cadastrada.
 * Pré-cadastro pronto com os principais exames e consultas mapeados.
 * Permite que o responsável pela clínica lance algo novo e/ou altere estes serviços disponíveis.
 */
export const DEFAULT_CLINIC_SERVICES = STANDARD_PROCEDURES_CATALOG.map((item, index) => ({
  id: `cli-srv-std-${index + 1}`,
  name: item.name,
  category: item.category,
  tussCode: item.tussCode || '',
  privatePrice: item.suggestedPrivatePrice || 100.0,
  insuranceIds: item.suggestedInsuranceIds || ['ins-bradesco', 'ins-unimed'],
  descriptionPrep: item.suggestedPrep || 'Trazer documento oficial com foto e exames anteriores se houver.',
  durationMinutes: item.suggestedDuration || 30,
  active: true,
  createdAt: new Date().toISOString(),
}))

