import { FREQUENCIES } from './dateUtils'

const VALID_FREQ = new Set(FREQUENCIES.map((f) => f.value))

// Map common header spellings to our internal field names.
const FIELD_ALIASES = {
  name: 'name',
  'full name': 'name',
  contact: 'name',
  person: 'name',
  category: 'category',
  type: 'category',
  group: 'category',
  tag: 'category',
  frequency: 'frequency',
  freq: 'frequency',
  cadence: 'frequency',
  notes: 'notes',
  note: 'notes',
  lastcontacted: 'lastContacted',
  'last contacted': 'lastContacted',
  'last contact': 'lastContacted',
  last: 'lastContacted',
}

// Parse a single CSV line into cells, honouring quoted fields and "" escapes.
function parseLine(line) {
  const cells = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur)
  return cells.map((c) => c.trim())
}

/**
 * Parse CSV text into an array of partial contacts.
 *
 * Accepts either:
 *  - a plain list of names (one per line), or
 *  - a CSV with a header row containing a "name" column, plus any of the
 *    optional columns: category, frequency, notes, last contacted.
 *
 * Imported contacts are intentionally left incomplete (blank frequency /
 * last-contacted) unless those columns are present, so the UI can prompt the
 * user to fill in the missing details.
 */
export function parseContactsCsv(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return []

  const firstCells = parseLine(lines[0]).map((c) => c.toLowerCase())
  const hasHeader = firstCells.includes('name')

  let columns = null
  let startIdx = 0
  if (hasHeader) {
    columns = firstCells.map((c) => FIELD_ALIASES[c] || null)
    startIdx = 1
  }

  const result = []
  for (let i = startIdx; i < lines.length; i++) {
    const cells = parseLine(lines[i])
    const obj = {}

    if (hasHeader) {
      columns.forEach((field, idx) => {
        if (field && cells[idx] != null) obj[field] = cells[idx].trim()
      })
    } else {
      obj.name = (cells[0] || '').trim()
    }

    if (!obj.name) continue

    // Only accept frequencies we recognise; otherwise leave blank.
    let frequency = ''
    if (obj.frequency) {
      const f = obj.frequency.toLowerCase()
      if (VALID_FREQ.has(f)) frequency = f
    }

    // Only accept ISO-ish dates; otherwise leave blank.
    let lastContacted = ''
    if (obj.lastContacted && /^\d{4}-\d{2}-\d{2}$/.test(obj.lastContacted)) {
      lastContacted = obj.lastContacted
    }

    result.push({
      name: obj.name,
      category: obj.category || '',
      frequency,
      notes: obj.notes || '',
      lastContacted,
    })
  }

  return result
}
