import React, { useState } from 'react'
import { calcNextDue, getDaysUntilDue, getStatusColor, formatDate, getMissingFields, FREQUENCIES } from '../utils/dateUtils'

const STATUS_STYLES = {
  red:   { badge: 'bg-red-900/60 text-red-300 border-red-700',   border: 'border-l-red-500',   dot: 'bg-red-500'   },
  amber: { badge: 'bg-amber-900/60 text-amber-300 border-amber-700', border: 'border-l-amber-500', dot: 'bg-amber-400' },
  green: { badge: 'bg-green-900/60 text-green-300 border-green-700', border: 'border-l-green-600', dot: 'bg-green-500' },
  slate: { badge: 'bg-slate-700/60 text-slate-400 border-slate-600', border: 'border-l-slate-600', dot: 'bg-slate-500' },
}

function statusLabel(days) {
  if (days === null) return 'No date set'
  if (days < 0)  return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days}d`
}

export default function ContactCard({ contact, onEdit, onDelete, onMarkContacted }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const nextDue = calcNextDue(contact.lastContacted, contact.frequency)
  const days    = getDaysUntilDue(nextDue)
  const color   = getStatusColor(days)
  const styles  = STATUS_STYLES[color]
  const freqLabel = FREQUENCIES.find((f) => f.value === contact.frequency)?.label ?? contact.frequency

  const missing    = getMissingFields(contact)
  const incomplete = missing.length > 0

  return (
    <div className={`card border-l-4 transition-all duration-200 hover:border-slate-600 ${
      incomplete
        ? 'border-l-amber-400 ring-1 ring-amber-500/30'
        : styles.border
    }`}>
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <span className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${styles.dot}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-100 truncate leading-tight">{contact.name}</h3>
              {contact.category && (
                <span className="inline-block mt-0.5 text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                  {contact.category}
                </span>
              )}
            </div>
            {/* Status badge */}
            <span className={`flex-shrink-0 text-xs font-semibold border px-2.5 py-0.5 rounded-full whitespace-nowrap ${
              incomplete ? STATUS_STYLES.amber.badge : styles.badge
            }`}>
              {incomplete ? 'Needs details' : statusLabel(days)}
            </span>
          </div>

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ClockIcon />
              {freqLabel}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon />
              Last: {formatDate(contact.lastContacted)}
            </span>
            {nextDue && (
              <span className="flex items-center gap-1">
                <BellIcon />
                Next: {formatDate(nextDue.toISOString())}
              </span>
            )}
          </div>

          {/* Missing-details notice */}
          {incomplete && (
            <div className="mt-2 flex items-center gap-1.5 text-xs bg-amber-900/30 border border-amber-800 text-amber-300 rounded-lg px-2.5 py-1.5">
              <WarnIcon />
              <span>Missing: {missing.map((f) => f.label).join(', ')}</span>
            </div>
          )}

          {contact.notes && (
            <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-snug">{contact.notes}</p>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {incomplete ? (
              <button
                onClick={() => onEdit(contact)}
                className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
              >
                <PencilIcon />
                Add details
              </button>
            ) : (
              <button
                onClick={() => onMarkContacted(contact.id)}
                className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
              >
                <CheckIcon />
                Mark contacted today
              </button>
            )}
            {!incomplete && (
              <button
                onClick={() => onEdit(contact)}
                className="btn-ghost text-sm py-1.5"
              >
                Edit
              </button>
            )}
            {confirmDelete ? (
              <>
                <button
                  onClick={() => onDelete(contact.id)}
                  className="btn-danger text-sm py-1.5 px-3"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn-ghost text-sm py-1.5"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-ghost text-sm py-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}
function BellIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
    </svg>
  )
}
function WarnIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  )
}
function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  )
}
