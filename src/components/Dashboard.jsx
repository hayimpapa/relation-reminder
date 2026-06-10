import React, { useMemo, useState } from 'react'
import ContactCard from './ContactCard'
import ContactModal from './ContactModal'
import { calcNextDue, getDaysUntilDue } from '../utils/dateUtils'

export default function Dashboard({ contacts, onAdd, onUpdate, onDelete, onMarkContacted }) {
  const [modal, setModal] = useState(null) // null | 'add' | contact-object

  const sorted = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const dA = getDaysUntilDue(calcNextDue(a.lastContacted, a.frequency)) ?? 9999
      const dB = getDaysUntilDue(calcNextDue(b.lastContacted, b.frequency)) ?? 9999
      return dA - dB
    })
  }, [contacts])

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
          <SummaryChip color="red"   label="Overdue"   count={overdueCount} />
          <SummaryChip color="amber" label="Due soon"  count={dueSoonCount} />
          <SummaryChip color="slate" label="Total"     count={contacts.length} />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-100">
          {contacts.length === 0 ? 'No contacts yet' : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
        </h2>
        <button
          onClick={() => setModal('add')}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon />
          Add contact
        </button>
      </div>

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
          <button
            onClick={() => setModal('add')}
            className="btn-primary mt-2"
          >
            Add first contact
          </button>
        </div>
      )}

      {/* Contact list */}
      {sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((contact) => (
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
function PeopleIcon() {
  return (
    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4" strokeWidth={1.5}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}
