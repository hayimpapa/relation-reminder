import React, { useMemo, useRef, useState } from 'react'
import ContactCard from './ContactCard'
import ContactModal from './ContactModal'
import { calcNextDue, getDaysUntilDue, isIncomplete } from '../utils/dateUtils'
import { parseContactsCsv } from '../utils/csvUtils'

export default function Dashboard({ contacts, onAdd, onImport, onUpdate, onDelete, onMarkContacted }) {
  const [modal, setModal] = useState(null) // null | 'add' | contact-object
  const [importMsg, setImportMsg] = useState(null) // { type, text } | null
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)
  const fileRef = useRef(null)

  const sorted = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const dA = getDaysUntilDue(calcNextDue(a.lastContacted, a.frequency)) ?? 9999
      const dB = getDaysUntilDue(calcNextDue(b.lastContacted, b.frequency)) ?? 9999
      return dA - dB
    })
  }, [contacts])

  const incompleteCount = useMemo(
    () => contacts.filter(isIncomplete).length,
    [contacts]
  )

  const visible = useMemo(
    () => (showIncompleteOnly ? sorted.filter(isIncomplete) : sorted),
    [sorted, showIncompleteOnly]
  )

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    try {
      const text = await file.text()
      const parsed = parseContactsCsv(text)
      if (parsed.length === 0) {
        setImportMsg({ type: 'error', text: 'No names found in that file. Make sure it has one name per line (or a "name" column).' })
        return
      }
      const { added, skipped } = onImport(parsed)
      const parts = [`Imported ${added} contact${added !== 1 ? 's' : ''}`]
      if (skipped) parts.push(`skipped ${skipped} duplicate${skipped !== 1 ? 's' : ''}`)
      setImportMsg({
        type: added > 0 ? 'success' : 'info',
        text: parts.join(', ') + (added > 0 ? '. Fill in the highlighted details below.' : '.'),
      })
      if (added > 0) setShowIncompleteOnly(false)
    } catch {
      setImportMsg({ type: 'error', text: 'Could not read that file.' })
    }
  }

  const overdueCount  = useMemo(() => sorted.filter((c) => {
    const d = getDaysUntilDue(calcNextDue(c.lastContacted, c.frequency))
    return d !== null && d < 0
  }).length, [sorted])

  const dueSoonCount  = useMemo(() => sorted.filter((c) => {
    const d = getDaysUntilDue(calcNextDue(c.lastContacted, c.frequency))
    return d !== null && d >= 0 && d <= 7
  }).length, [sorted])

  const handleSave = (data) => {
    if (modal && modal !== 'add') {
      onUpdate(modal.id, data)
    } else {
      onAdd(data)
    }
    setModal(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Summary strip */}
      {contacts.length > 0 && (
        <div className="flex gap-3 mb-6">
          <SummaryChip color="red"   label="Overdue"       count={overdueCount} />
          <SummaryChip color="amber" label="Due soon"      count={dueSoonCount} />
          <SummaryChip color="slate" label="Needs details" count={incompleteCount} />
          <SummaryChip color="slate" label="Total"         count={contacts.length} />
        </div>
      )}

      {/* Import result message */}
      {importMsg && (
        <div className={`mb-4 flex items-start justify-between gap-3 px-4 py-3 rounded-lg text-sm border ${
          importMsg.type === 'success'
            ? 'bg-green-900/40 text-green-300 border-green-800'
            : importMsg.type === 'error'
              ? 'bg-red-900/40 text-red-300 border-red-800'
              : 'bg-slate-700/50 text-slate-300 border-slate-600'
        }`}>
          <span>{importMsg.text}</span>
          <button
            onClick={() => setImportMsg(null)}
            className="flex-shrink-0 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-slate-100">
          {contacts.length === 0 ? 'No contacts yet' : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
        </h2>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={handleFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-secondary flex items-center gap-2"
            title="Import a CSV of names"
          >
            <UploadIcon />
            Import CSV
          </button>
          <button
            onClick={() => setModal('add')}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon />
            Add contact
          </button>
        </div>
      </div>

      {/* Filter toggle */}
      {incompleteCount > 0 && (
        <button
          onClick={() => setShowIncompleteOnly((v) => !v)}
          className={`mb-4 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            showIncompleteOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          {showIncompleteOnly
            ? '← Show all contacts'
            : `Show only the ${incompleteCount} needing details`}
        </button>
      )}

      {/* Empty state */}
      {contacts.length === 0 && (
        <div className="card text-center py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
            <PeopleIcon />
          </div>
          <div>
            <p className="text-slate-300 font-medium">Your relationship list is empty</p>
            <p className="text-slate-500 text-sm mt-1">Add your first contact to get started.</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setModal('add')}
              className="btn-primary"
            >
              Add first contact
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
            >
              <UploadIcon />
              Import CSV
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            CSV tip: one name per line, or a "name" column with optional category, frequency, notes.
          </p>
        </div>
      )}

      {/* Contact list */}
      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={(c) => setModal(c)}
              onDelete={onDelete}
              onMarkContacted={onMarkContacted}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <ContactModal
          contact={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

function SummaryChip({ color, label, count }) {
  const colorMap = {
    red:   'bg-red-900/40 text-red-300 border-red-800',
    amber: 'bg-amber-900/40 text-amber-300 border-amber-800',
    slate: 'bg-slate-700/60 text-slate-300 border-slate-600',
  }
  return (
    <div className={`flex-1 text-center border rounded-xl py-3 px-2 ${colorMap[color]}`}>
      <div className="text-2xl font-bold leading-tight">{count}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0-12l-4 4m4-4l4 4"/>
    </svg>
  )
}
function PeopleIcon() {
  return (
    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4" strokeWidth={1.5}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}
