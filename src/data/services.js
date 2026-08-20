import { STANDARD_PROCEDURES_CATALOG } from './standardCatalog'

/**
 * Contrato Service (mock / API futura):
 * @typedef {Object} ClinicService
 * @property {string} id
 * @property {string} name
 * @property {string} category - laboratorio | imagem | cardiologia | consultas | outros
 * @property {string} [tussCode]
 * @property {number} privatePrice
 * @property {string[]} insuranceIds - N:N com insurances.js
 * @property {string} descriptionPrep
 * @property {number} durationMinutes
 * @property {boolean} active
 * @property {string} [insurancePricingNotes]
 * @property {string} [commercialNotes]
 */

/**
 * Base mock pré-carregada (Lauro de Freitas / arquitetura de catálogo).
 * Persistência editável via serviceCatalogService → localStorage.
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

