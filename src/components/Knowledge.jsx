import { useState } from 'react'
import { fmtTime } from './ui.jsx'

export default function Knowledge({ state, dispatch }) {
  const [openId, setOpenId] = useState(state.kb[0]?.id)
  const [q, setQ] = useState('')
  const list = state.kb.filter((k) => !q || (k.title + k.body).toLowerCase().includes(q.toLowerCase()))
  const doc = state.kb.find((k) => k.id === openId)

  return (
    <section>
      <div className="toolbar">
        <h1>База знаний</h1>
        <input className="search" placeholder="Поиск по базе" value={q} onChange={(e) => setQ(e.target.value)} />
        <button
          className="btn primary"
          onClick={() => {
            dispatch({ type: 'addKb', title: 'Новая страница', body: '' })
          }}
        >
          + Страница
        </button>
      </div>
      <div className="kb">
        <ul className="kb-list">
          {list.map((k) => (
            <li key={k.id} className={k.id === openId ? 'active' : ''} onClick={() => setOpenId(k.id)}>
              {k.title}
            </li>
          ))}
        </ul>
        {doc ? (
          <div className="kb-doc">
            <input className="title-input" value={doc.title} onChange={(e) => dispatch({ type: 'updateKb', id: doc.id, patch: { title: e.target.value } })} />
            <div className="muted small">Обновлено {fmtTime(doc.updatedAt)}</div>
            <textarea rows={14} value={doc.body} onChange={(e) => dispatch({ type: 'updateKb', id: doc.id, patch: { body: e.target.value } })} />
          </div>
        ) : (
          <div className="kb-doc muted">Выберите страницу</div>
        )}
      </div>
    </section>
  )
}
