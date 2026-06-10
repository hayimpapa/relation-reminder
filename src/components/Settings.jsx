import React, { useState } from 'react'
import { sendReminderDigest } from '../utils/emailUtils'
import { calcNextDue, getDaysUntilDue } from '../utils/dateUtils'

export default function Settings({ settings, onSave, contacts }) {
  const [form, setForm]       = useState({ ...settings })
  const [saved, setSaved]     = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
    setSendResult(null)
  }

  const handleSave = (e) => {
    e.preventDefault()
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSendDigest = async () => {
    setSending(true)
    setSendResult(null)
    const result = await sendReminderDigest(form, contacts)
    setSending(false)
    setSendResult(result)
  }

  const overdueCount = contacts.filter((c) => {
    const d = getDaysUntilDue(calcNextDue(c.lastContacted, c.frequency))
    return d !== null && d < 0
  }).length
  const dueSoonCount = contacts.filter((c) => {
    const d = getDaysUntilDue(calcNextDue(c.lastContacted, c.frequency))
    return d !== null && d >= 0 && d <= 7
  }).length

  const canSend = form.serviceId && form.templateId && form.publicKey && form.toEmail
  const hasRecipients = overdueCount + dueSoonCount > 0

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-slate-100 mb-1">Settings</h2>
      <p className="text-slate-400 text-sm mb-6">
        Configure EmailJS to receive reminder digests about overdue contacts.
      </p>

      {/* EmailJS credentials form */}
      <div className="card mb-6">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <EnvelopeIcon />
          EmailJS configuration
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Service ID</label>
            <input
              type="text"
              className="input-field font-mono text-sm"
              placeholder="service_xxxxxxx"
              value={form.serviceId}
              onChange={(e) => set('serviceId', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Template ID</label>
            <input
              type="text"
              className="input-field font-mono text-sm"
              placeholder="template_xxxxxxx"
              value={form.templateId}
              onChange={(e) => set('templateId', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Public Key</label>
            <input
              type="text"
              className="input-field font-mono text-sm"
              placeholder="xxxxxxxxxxxxxxxxxxxx"
              value={form.publicKey}
              onChange={(e) => set('publicKey', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Your email address (digest recipient)</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.toEmail}
              onChange={(e) => set('toEmail', e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary">
            {saved ? '✓ Saved!' : 'Save settings'}
          </button>
        </form>
      </div>

      {/* Send digest */}
      <div className="card">
        <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <BellIcon />
          Send reminder digest
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          {hasRecipients
            ? `${overdueCount} overdue and ${dueSoonCount} due this week — ready to send.`
            : 'All contacts are up to date — nothing to report right now.'}
        </p>

        <button
          onClick={handleSendDigest}
          disabled={!canSend || sending}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {sending ? (
            <>
              <SpinnerIcon />
              Sending…
            </>
          ) : (
            <>
              <PaperPlaneIcon />
              Send reminder digest
            </>
          )}
        </button>

        {!canSend && (
          <p className="text-slate-500 text-xs mt-2">Fill in all EmailJS credentials above to enable sending.</p>
        )}

        {sendResult && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm ${sendResult.ok ? 'bg-green-900/40 text-green-300 border border-green-800' : 'bg-red-900/40 text-red-300 border border-red-800'}`}>
            {sendResult.ok
              ? '✓ Digest sent successfully! Check your inbox.'
              : `Error: ${sendResult.message}`}
          </div>
        )}
      </div>

      {/* EmailJS setup hint */}
      <div className="mt-6 card bg-slate-900/40 border-slate-700/50">
        <h3 className="font-medium text-slate-300 mb-3 text-sm">How to get EmailJS credentials</h3>
        <ol className="text-slate-400 text-sm space-y-1.5 list-decimal list-inside">
          <li>Sign up at <span className="text-amber-400 font-mono text-xs">emailjs.com</span> (free tier: 200 emails/month)</li>
          <li>Add an <strong className="text-slate-300">Email Service</strong> (Gmail, Outlook, etc.) → copy the <strong className="text-slate-300">Service ID</strong></li>
          <li>Create an <strong className="text-slate-300">Email Template</strong> → copy the <strong className="text-slate-300">Template ID</strong></li>
          <li>In the template use variables: <span className="font-mono text-xs text-amber-400">{'{{subject}}'}</span>, <span className="font-mono text-xs text-amber-400">{'{{message}}'}</span>, <span className="font-mono text-xs text-amber-400">{'{{to_email}}'}</span></li>
          <li>Go to Account → <strong className="text-slate-300">API Keys</strong> → copy your <strong className="text-slate-300">Public Key</strong></li>
        </ol>
      </div>
    </div>
  )
}

function EnvelopeIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
}
function BellIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  )
}
function PaperPlaneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
    </svg>
  )
}
function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
}
