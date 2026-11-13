import { useState } from 'react'

// Простые правила-переключатели вместо сложного конструктора (проблема №2, №8)
// + переезд из Trello / Jira (проблема №14)
export default function Automations({ state, dispatch }) {
  const [paste, setPaste] = useState('')
  const [from, setFrom] = useState('Trello')
  const [done, setDone] = useState(null)

  const importTasks = () => {
    const titles = paste
      .split(/\r?\n/)
      .map((l) => l.split(/[;,\t]/)[0].replace(/^"|"$/g, '').trim())
      .filter((l) => l && !/^(title|summary|name|название)$/i.test(l))
    if (!titles.length) return
    dispatch({ type: 'importTasks', titles, from })
    setDone(titles.length)
    setPaste('')
  }

  return (
    <section>
      <div className="toolbar">
        <h1>Автоматизации</h1>
      </div>
      <p className="muted">Готовые правила включаются одним переключателем — настраивать триггеры вручную не нужно.</p>
      <ul className="rules">
        {state.rules.map((r) => (
          <li key={r.id} className="rule">
            <label className="switch">
              <input type="checkbox" checked={r.enabled} onChange={() => dispatch({ type: 'toggleRule', id: r.id })} />
              <span className="slider" />
            </label>
            <span>{r.title}</span>
          </li>
        ))}
      </ul>

      <h2>Переезд из другой системы</h2>
      <div className="panel">
        <div className="row">
          <label>
            Откуда
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option>Trello</option>
              <option>Jira</option>
              <option>YouGile</option>
              <option>Excel / Google Sheets</option>
            </select>
          </label>
        </div>
        <label>
          Вставьте список задач или CSV-экспорт (первый столбец — название)
          <textarea rows={5} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'Название\nСверстать лендинг\nНастроить оплату'} />
        </label>
        <div className="row">
          <button className="btn primary" onClick={importTasks}>Импортировать</button>
          {done && <span className="muted">Импортировано задач: {done}</span>}
        </div>
      </div>

      <h2>Демо-данные</h2>
      <button
        className="btn danger"
        onClick={() => {
          if (window.confirm('Сбросить все данные к демо-набору?')) dispatch({ type: 'reset' })
        }}
      >
        Сбросить к демо
      </button>
    </section>
  )
}
