import {
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  startOfDay,
  parseISO,
  format,
  isValid,
} from 'date-fns'

export const FREQUENCIES = [
  { value: 'weekly',      label: 'Weekly',      days: 7   },
  { value: 'fortnightly', label: 'Fortnightly',  days: 14  },
  { value: 'monthly',     label: 'Monthly',      days: 30  },
  { value: 'quarterly',   label: 'Quarterly',    days: 90  },
  { value: 'half-yearly', label: 'Half-yearly',  days: 180 },
  { value: 'yearly',      label: 'Yearly',       days: 365 },
]

export function calcNextDue(lastContactedIso, frequency) {
  if (!lastContactedIso || !frequency) return null
  const last = parseISO(lastContactedIso)
  if (!isValid(last)) return null

  switch (frequency) {
    case 'weekly':      return addWeeks(last, 1)
    case 'fortnightly': return addWeeks(last, 2)
    case 'monthly':     return addMonths(last, 1)
    case 'quarterly':   return addMonths(last, 3)
    case 'half-yearly': return addMonths(last, 6)
    case 'yearly':      return addMonths(last, 12)
    default:            return addDays(last, 30)
  }
}

export function getDaysUntilDue(nextDueDate) {
  if (!nextDueDate) return null
  const today = startOfDay(new Date())
  const due = startOfDay(nextDueDate)
  return differenceInDays(due, today)
}

export function getStatusColor(daysUntil) {
  if (daysUntil === null) return 'slate'
  if (daysUntil < 0)  return 'red'
  if (daysUntil <= 7) return 'amber'
  return 'green'
}

export function formatDate(isoString) {
  if (!isoString) return '—'
  const d = parseISO(isoString)
  return isValid(d) ? format(d, 'MMM d, yyyy') : '—'
}

export function todayIso() {
  return format(new Date(), 'yyyy-MM-dd')
}

// Labels for the details required before a contact gets reminders.
export const REQUIRED_FIELDS = [
  { key: 'frequency',     label: 'Contact frequency' },
  { key: 'lastContacted', label: 'Last contacted'    },
]

// Returns the list of required fields a contact is still missing.
export function getMissingFields(contact) {
  const missing = []
  if (!contact.frequency) {
    missing.push(REQUIRED_FIELDS[0])
  }
  if (!contact.lastContacted || !isValid(parseISO(contact.lastContacted))) {
    missing.push(REQUIRED_FIELDS[1])
  }
  return missing
}

export function isIncomplete(contact) {
  return getMissingFields(contact).length > 0
}
