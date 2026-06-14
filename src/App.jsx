import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import { useContacts } from './hooks/useContacts'
import { useSettings } from './hooks/useSettings'
import { calcNextDue, getDaysUntilDue } from './utils/dateUtils'

export default function App() {
  const [view, setView] = useState('dashboard')
  const { contacts, addContact, importContacts, updateContact, deleteContact, markContacted } = useContacts()
  const { settings, saveSettings } = useSettings()

  const overdueCount = contacts.filter((c) => {
    const d = getDaysUntilDue(calcNextDue(c.lastContacted, c.frequency))
    return d !== null && d < 0
  }).length

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800 shadow-xl">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2.5 group"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <HeartIcon />
            </span>
            <span className="font-bold text-slate-100 text-sm tracking-wide group-hover:text-amber-400 transition-colors">
              Relation<span className="text-amber-400">Reminder</span>
            </span>
          </button>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            <NavTab
              active={view === 'dashboard'}
              onClick={() => setView('dashboard')}
              badge={overdueCount > 0 ? overdueCount : null}
            >
              Dashboard
            </NavTab>
            <NavTab
              active={view === 'settings'}
              onClick={() => setView('settings')}
            >
              Settings
            </NavTab>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6">
        {view === 'dashboard' && (
          <Dashboard
            contacts={contacts}
            onAdd={addContact}
            onImport={importContacts}
            onUpdate={updateContact}
            onDelete={deleteContact}
            onMarkContacted={markContacted}
          />
        )}
        {view === 'settings' && (
          <Settings
            settings={settings}
            onSave={saveSettings}
            contacts={contacts}
          />
        )}
      </main>
    </div>
  )
}

function NavTab({ active, onClick, badge, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none
        ${active
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
    >
      {children}
      {badge != null && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

function HeartIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )
}
