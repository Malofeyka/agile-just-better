import { useState } from 'react'
import { STATUSES, isOverdue, specScore, staleInfo } from '../store.js'
import { Avatar, fmtDate } from './ui.jsx'

const NEXT = { todo: ['start', '▶ Начать'], doing: ['review', '→ На проверку'], review: ['done', '✓ Готово'] }

export default function Board({ state, dispatch, onOpen, onNew }) {
  const [onlyMine, setOnlyMine] = useState(false)
  const [query, setQuery] = useState('')
  const [dragId, setDragId] = useState(null)
  const [over, setOver] = useState(null)
  const member = (id) => state.members.find((m) => m.id === id)

  const visible = state.tasks.filter(
    (t) => (!onlyMine || t.assignee === state.me) && (!query || t.title.toLowerCase().includes(query.toLowerCase())),
  )

  const quick = (t) => {
    const [to] = NEXT[t.status]
    if (to === 'start') dispatch({ type: 'start', id: t.id })
    else dispatch({ type: 'move', id: t.id, status: to })
  }

  return (
    <section>
      <div className="toolbar">
        <h1>{state.sprint.name}</h1>
        <input className="search" placeholder="Поиск задач" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="toggle">
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} /> Только мои
        </label>
        <button className="btn primary" onClick={onNew}>+ Задача</button>
      </div>

      <div className="board">
        {STATUSES.map((col) => {
          const items = visible.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              className={`column ${over === col.id ? 'drop' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(col.id)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => {
                if (dragId) dispatch({ type: 'move', id: dragId, status: col.id })
                setDragId(null)
                setOver(null)
              }}
            >
              <header className="column-head">
                <span>{col.title}</span>
                <span className="count">{items.length}</span>
              </header>
              {items.map((t) => {
                const spec = specScore(t)
                const stale = staleInfo(t)
                return (
                  <article
                    key={t.id}
                    className={`card ${t.blocked ? 'is-blocked' : ''}`}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onClick={() => onOpen(t.id)}
                  >
                    <div className="card-title">{t.title}</div>
                    <div className="chips">
                      {t.blocked && <span className="chip bad">⛔ Блокер</span>}
                      {stale && <span className="chip warn">⏰ {stale}</span>}
                      {t.deadline && <span className={`chip ${isOverdue(t) ? 'bad' : ''}`}>📅 {fmtDate(t.deadline)}</span>}
                      {t.status !== 'done' && spec.score < 1 && <span className="chip muted" title={`Нет: ${spec.missing.join(', ')}`}>ТЗ {Math.round(spec.score * 100)}%</span>}
                      {t.deadlineHistory.length > 0 && <span className="chip muted">↻ перенос ×{t.deadlineHistory.length}</span>}
                    </div>
                    <div className="card-foot">
                      <Avatar member={member(t.assignee)} />
                      {NEXT[t.status] && (
                        <button
                          className="btn tiny"
                          onClick={(e) => {
                            e.stopPropagation()
                            quick(t)
                          }}
                        >
                          {NEXT[t.status][1]}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
              {items.length === 0 && <div className="empty">Пусто</div>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
