import { useState, useCallback } from 'react'
import { todayIso } from '../utils/dateUtils'

const STORAGE_KEY = 'rr_contacts'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useContacts() {
  const [contacts, setContacts] = useState(load)

  const persist = useCallback((updated) => {
    setContacts(updated)
    save(updated)
  }, [])

  const addContact = useCallback((data) => {
    const contact = {
      id: makeId(),
      lastContacted: todayIso(),
      ...data,
    }
    persist([...contacts, contact])
    return contact
  }, [contacts, persist])

  const importContacts = useCallback((incoming) => {
    const existingNames = new Set(
      contacts.map((c) => (c.name || '').trim().toLowerCase())
    )
    const added = []
    let skipped = 0

    for (const item of incoming) {
      const name = (item.name || '').trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (existingNames.has(key)) {
        skipped++
        continue
      }
      existingNames.add(key)
      added.push({
        id: makeId(),
        name,
        category:      item.category || '',
        frequency:     item.frequency || '',
        notes:         item.notes || '',
        lastContacted: item.lastContacted || '',
      })
    }

    if (added.length) persist([...contacts, ...added])
    return { added: added.length, skipped }
  }, [contacts, persist])

  const updateContact = useCallback((id, data) => {
    persist(contacts.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [contacts, persist])

  const deleteContact = useCallback((id) => {
    persist(contacts.filter((c) => c.id !== id))
  }, [contacts, persist])

  const markContacted = useCallback((id) => {
    persist(contacts.map((c) => (c.id === id ? { ...c, lastContacted: todayIso() } : c)))
  }, [contacts, persist])

  return { contacts, addContact, importContacts, updateContact, deleteContact, markContacted }
}
