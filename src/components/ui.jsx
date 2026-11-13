import { useEffect } from 'react'

export function Avatar({ member, size = 24 }) {
  if (!member) return <span className="avatar empty" style={{ width: size, height: size }} title="Без исполнителя">?</span>
  return (
    <span className="avatar" title={`${member.name} · ${member.role}`} style={{ width: size, height: size, background: member.color, fontSize: size * 0.45 }}>
      {member.name[0]}
    </span>
  )
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">✕</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function MemberSelect({ members, value, onChange, placeholder = 'Не назначен' }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{placeholder}</option>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name} — {m.role}
        </option>
      ))}
    </select>
  )
}

export function Meter({ value, label }) {
  const tone = value >= 1 ? 'ok' : value >= 0.5 ? 'warn' : 'bad'
  return (
    <div className="meter" aria-label={label}>
      <div className={`meter-fill ${tone}`} style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—')
export const fmtTime = (ts) => new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
