import { useState } from 'react'

const KINDS = [
  { id: 'good', title: '👍 Что было хорошо' },
  { id: 'bad', title: '👎 Что мешало' },
  { id: 'idea', title: '💡 Что попробуем' },
]

export default function Retro({ state, dispatch, onOpen }) {
  const [draft, setDraft] = useState({ good: '', bad: '', idea: '' })
  return (
    <section>
      <div className="toolbar">
        <h1>Ретроспектива</h1>
      </div>
      <p className="muted">Любой пункт можно одной кнопкой превратить в задачу — решения с ретро не теряются в блокноте.</p>
      <div className="retro">
        {KINDS.map((k) => (
          <div key={k.id} className="column">
            <header className="column-head">{k.title}</header>
            {state.retro
              .filter((r) => r.type === k.id)
              .map((r) => (
                <div key={r.id} className="card static">
                  <div>{r.text}</div>
                  <div className="card-foot">
                    {r.taskId ? (
                      <button className="btn tiny ghost" onClick={() => onOpen(r.taskId)}>✓ Задача создана</button>
                    ) : (
                      <button className="btn tiny" onClick={() => dispatch({ type: 'retroToTask', id: r.id })}>→ В задачу</button>
                    )}
                  </div>
                </div>
              ))}
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault()
                if (!draft[k.id].trim()) return
                dispatch({ type: 'addRetro', kind: k.id, text: draft[k.id].trim() })
                setDraft({ ...draft, [k.id]: '' })
              }}
            >
              <input placeholder="Добавить пункт" value={draft[k.id]} onChange={(e) => setDraft({ ...draft, [k.id]: e.target.value })} />
              <button className="btn">+</button>
            </form>
          </div>
        ))}
      </div>
    </section>
  )
}
