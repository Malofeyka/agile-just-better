import { useEffect, useRef, useState } from 'react'
import { SUGGESTIONS, ask } from '../assistant.js'

export default function Assistant({ state, dispatch, onClose }) {
  const [msgs, setMsgs] = useState([{ from: 'bot', text: 'Привет! Я помощник по спринту. Спроси, что блокирует работу, или попроси создать задачу.' }])
  const [input, setInput] = useState('')
  const end = useRef(null)
  // Фигурные скобки обязательны: в новых браузерах scrollIntoView возвращает
  // Promise, и React принял бы его за функцию очистки эффекта.
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = (text) => {
    if (!text.trim()) return
    const { reply, action } = ask(state, text)
    if (action) dispatch(action)
    dispatch({ type: 'track', event: 'assistant_asked' })
    setMsgs((m) => [...m, { from: 'me', text }, { from: 'bot', text: reply }])
    setInput('')
  }

  return (
    <aside className="assistant" aria-label="ИИ-помощник">
      <header className="assistant-head">
        <strong>✨ ИИ-помощник</strong>
        <button className="icon-btn" onClick={onClose} aria-label="Закрыть">✕</button>
      </header>
      <div className="assistant-body">
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.from}`}>{m.text}</div>
        ))}
        <div ref={end} />
      </div>
      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip-btn" onClick={() => send(s)}>{s}</button>
        ))}
      </div>
      <form
        className="row assistant-input"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input placeholder="Спросите что-нибудь" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn primary">→</button>
      </form>
    </aside>
  )
}
