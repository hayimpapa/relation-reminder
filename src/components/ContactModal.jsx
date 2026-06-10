import React, { useState, useEffect, useCallback } from 'react'
import { FREQUENCIES, todayIso } from '../utils/dateUtils'

const EMPTY = {
  name:          '',
  category:      '',
  frequency:     'monthly',
  notes:         '',
  lastContacted: '',
}

export default function ContactModal({ contact, onSave, onClose }) {
  const isEdit = Boolean(contact)
  const [form, setForm] = useState(() =>
    contact
      ? { ...contact }
      : { ...EMPTY, lastContacted: todayIso() }
  )
  const [error, setError] = useState('')

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    onSave(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/60">
          <h2 className="text-lg font-semibold text-slate-100">
            {isEdit ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="label">
              Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <input
              type="text"
              className="input-field"
              placeholder="Friend, Networking, Potential client…"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="label">Contact frequency</label>
            <select
              className="input-field"
              value={form.frequency}
              onChange={(e) => set('frequency', e.target.value)}
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Last contacted */}
          <div>
            <label className="label">Last contacted</label>
            <input
              type="date"
              className="input-field"
              value={form.lastContacted}
              max={todayIso()}
              onChange={(e) => set('lastContacted', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="How you met, goals for this relationship…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {isEdit ? 'Save changes' : 'Add contact'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
