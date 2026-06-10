import { useState, useCallback } from 'react'

const STORAGE_KEY = 'rr_settings'

const DEFAULTS = {
  serviceId:  '',
  templateId: '',
  publicKey:  '',
  toEmail:    '',
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load)

  const saveSettings = useCallback((data) => {
    const updated = { ...settings, ...data }
    setSettings(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [settings])

  return { settings, saveSettings }
}
