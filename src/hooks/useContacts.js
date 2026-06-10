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

  const updateContact = useCallback((id, data) => {
    persist(contacts.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [contacts, persist])

  const deleteContact = useCallback((id) => {
    persist(contacts.filter((c) => c.id !== id))
  }, [contacts, persist])

  const markContacted = useCallback((id) => {
    persist(contacts.map((c) => (c.id === id ? { ...c, lastContacted: todayIso() } : c)))
  }, [contacts, persist])

  return { contacts, addContact, updateContact, deleteContact, markContacted }
}
