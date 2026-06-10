import emailjs from 'emailjs-com'
import { calcNextDue, getDaysUntilDue, formatDate } from './dateUtils'

export async function sendReminderDigest(settings, contacts) {
  const { serviceId, templateId, publicKey, toEmail } = settings

  const overdue = []
  const dueSoon = []

  contacts.forEach((c) => {
    const nextDue = calcNextDue(c.lastContacted, c.frequency)
    const days = getDaysUntilDue(nextDue)
    if (days === null) return
    if (days < 0)  overdue.push({ ...c, days, nextDue })
    else if (days <= 7) dueSoon.push({ ...c, days, nextDue })
  })

  if (overdue.length === 0 && dueSoon.length === 0) {
    return { ok: false, message: 'No overdue or due-soon contacts to report.' }
  }

  const formatRow = (c) => {
    const status = c.days < 0
      ? `${Math.abs(c.days)} day${Math.abs(c.days) !== 1 ? 's' : ''} overdue`
      : `due in ${c.days} day${c.days !== 1 ? 's' : ''}`
    return `• ${c.name} (${c.category || 'no category'}) — ${c.frequency} — ${status}`
  }

  const sections = []
  if (overdue.length > 0) {
    sections.push('OVERDUE:\n' + overdue.map(formatRow).join('\n'))
  }
  if (dueSoon.length > 0) {
    sections.push('DUE THIS WEEK:\n' + dueSoon.map(formatRow).join('\n'))
  }

  const messageBody = sections.join('\n\n')

  const templateParams = {
    to_email:     toEmail,
    subject:      `Relation Reminder: ${overdue.length} overdue, ${dueSoon.length} due soon`,
    message:      messageBody,
    overdue_count: overdue.length,
    due_soon_count: dueSoon.length,
  }

  try {
    const result = await emailjs.send(serviceId, templateId, templateParams, publicKey)
    return { ok: true, result }
  } catch (err) {
    return { ok: false, message: err?.text || err?.message || 'Unknown error' }
  }
}
