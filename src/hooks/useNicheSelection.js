import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const NICHE_STORAGE_KEY = 'gms_selected_niche'

function parseNiche(value) {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'paciente') return 'PATIENT'
  if (normalized === 'clinica') return 'CLINIC'
  return null
}

function readStoredNiche() {
  if (typeof window === 'undefined') return null

  try {
    const storedValue = window.sessionStorage.getItem(NICHE_STORAGE_KEY)
    return storedValue === 'PATIENT' || storedValue === 'CLINIC' ? storedValue : null
  } catch {
    return null
  }
}

function getInitialNiche(searchParams) {
  const nicheFromUrl = parseNiche(searchParams.get('nicho'))
  return nicheFromUrl || readStoredNiche() || 'NONE'
}

function toUrlNiche(niche) {
  return niche === 'PATIENT' ? 'paciente' : 'clinica'
}

export function useNicheSelection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeNiche, setActiveNiche] = useState(() => getInitialNiche(searchParams))

  useEffect(() => {
    const nicheFromUrl = parseNiche(searchParams.get('nicho'))

    if (nicheFromUrl) {
      setActiveNiche(nicheFromUrl)
      try {
        window.sessionStorage.setItem(NICHE_STORAGE_KEY, nicheFromUrl)
      } catch {
        // A query string válida continua selecionando o nicho sem persistência.
      }
      return
    }

    const storedNiche = readStoredNiche()
    setActiveNiche(storedNiche || 'NONE')
  }, [searchParams])

  const setNiche = useCallback(
    (niche) => {
      if (niche !== 'PATIENT' && niche !== 'CLINIC') return

      setActiveNiche(niche)
      try {
        window.sessionStorage.setItem(NICHE_STORAGE_KEY, niche)
      } catch {
        // A seleção ainda funciona durante a página mesmo sem acesso ao storage.
      }
      const nextSearchParams = new URLSearchParams(searchParams)
      nextSearchParams.set('nicho', toUrlNiche(niche))
      setSearchParams(nextSearchParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const returnToNeutral = useCallback(() => {
    setActiveNiche('NONE')
    try {
      window.sessionStorage.removeItem(NICHE_STORAGE_KEY)
    } catch {
      // O estado neutro ainda é aplicado durante esta navegação.
    }
  }, [])

  return { activeNiche, setNiche, returnToNeutral }
}
