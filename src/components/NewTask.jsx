import { useState } from 'react'
import { similarTasks, specScore } from '../store.js'
import { MemberSelect, Meter, Modal } from './ui.jsx'

export default function NewTask({ state, dispatch, onClose, onOpen }) {
  const [t, setT] = useState({ title: '', assignee: null, deadline: '', spec: { goal: '', criteria: '', details: '' } })
  const dups = similarTasks(t.title, state.tasks)
  const spec = specScore({ ...t, deadline: t.deadline || null })

  const submit = (e) => {
    e.preventDefault()
    if (!t.title.trim()) return
    if (dups.length) dispatch({ type: 'track', event: 'duplicate_warned' })
    dispatch({ type: 'addTask', task: { ...t, title: t.title.trim(), deadline: t.deadline || null } })
    onClose()
  }

  return (
    <Modal title="Новая задача" onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label>
          Название
          <input autoFocus value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} placeholder="Например: Модуль оплаты" />
        </label>
        {dups.length > 0 && (
          <div className="notice warn">
            Похоже, такая задача уже есть:
            <ul>
              {dups.map((d) => (
                <li key={d.id}>
                  <a href="#" onClick={(e) => (e.preventDefault(), onClose(), onOpen(d.id))}>«{d.title}»</a> —{' '}
                  {state.members.find((m) => m.id === d.assignee)?.name ?? 'без исполнителя'}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="row">
          <label className="grow">
            Исполнитель
            <MemberSelect members={state.members} value={t.assignee} onChange={(v) => setT({ ...t, assignee: v })} />
          </label>
          <label className="grow">
            Дедлайн
            <input type="date" value={t.deadline} onChange={(e) => setT({ ...t, deadline: e.target.value })} />
          </label>
        </div>
        <label>
          Цель — зачем делаем
          <textarea rows={2} value={t.spec.goal} onChange={(e) => setT({ ...t, spec: { ...t.spec, goal: e.target.value } })} />
        </label>
        <label>
          Критерии готовности
          <textarea rows={2} value={t.spec.criteria} onChange={(e) => setT({ ...t, spec: { ...t.spec, criteria: e.target.value } })} />
        </label>
        <div>
          <Meter value={spec.score} label="Полнота ТЗ" />
          <p className="muted small">{spec.missing.length ? `ТЗ неполное: нет ${spec.missing.join(', ')}` : 'ТЗ заполнено полностью'}</p>
        </div>
        <button className="btn primary" disabled={!t.title.trim()}>Создать</button>
      </form>
    </Modal>
  )
}
