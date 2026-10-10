/**
 * Localização mock para a busca de exames da SPEC-06.
 * Coordenadas aproximadas de referência, adequadas somente para demonstração.
 */
export const MOCK_SEARCH_LOCATIONS = [
  { id: 'centro-lauro', label: 'Centro - Lauro de Freitas', latitude: -12.8978, longitude: -38.3214, aliases: ['centro', 'lauro de freitas'] },
  { id: 'vilas-atlantico', label: 'Vilas do Atlântico - Lauro de Freitas', latitude: -12.8895, longitude: -38.3028, aliases: ['vilas', 'vilas do atlântico', 'vilas do atlantico'] },
  { id: 'estrada-coco', label: 'Estrada do Coco - Lauro de Freitas', latitude: -12.8845, longitude: -38.3154, aliases: ['estrada do coco', 'e coco'] },
  { id: 'pituba', label: 'Pituba - Salvador', latitude: -12.9892, longitude: -38.4561, aliases: ['pituba', 'salvador'] },
  { id: 'salvador-centro', label: 'Centro - Salvador', latitude: -12.9718, longitude: -38.5011, aliases: ['centro salvador', 'salvador centro'] },
]

export const DEFAULT_SEARCH_LOCATION_ID = 'centro-lauro'

export function normalizeLocationQuery(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

export function findMockLocations(query) {
  const normalizedQuery = normalizeLocationQuery(query)
  if (!normalizedQuery) return MOCK_SEARCH_LOCATIONS

  return MOCK_SEARCH_LOCATIONS.filter((location) =>
    normalizeLocationQuery(`${location.label} ${location.aliases.join(' ')}`).includes(normalizedQuery)
  )
}

export function getHaversineDistanceKm(origin, destination) {
  const radians = (degrees) => (degrees * Math.PI) / 180
  const latitudeDelta = radians(destination.latitude - origin.latitude)
  const longitudeDelta = radians(destination.longitude - origin.longitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(origin.latitude)) *
      Math.cos(radians(destination.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function sortClinicsByProximity(clinics, origin) {
  return [...clinics].sort((clinicA, clinicB) => {
    const distanceDifference =
      getHaversineDistanceKm(origin, clinicA.location) -
      getHaversineDistanceKm(origin, clinicB.location)
    if (Math.abs(distanceDifference) > 0.001) return distanceDifference
    return (clinicB.rating || 0) - (clinicA.rating || 0)
  })
}

// TODO: Substituir lista local por integração com API gratuita de geocodificação/banco de dados
