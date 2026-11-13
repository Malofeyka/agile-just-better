import { useState } from 'react'
import { STATUSES, similarTasks, specScore } from '../store.js'
import { Avatar, MemberSelect, Meter, Modal, fmtDate, fmtTime } from './ui.jsx'

export default function TaskModal({ state, dispatch, id, onClose, onOpen }) {
  const t = state.tasks.find((x) => x.id === id)
  const [comment, setComment] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [link, setLink] = useState({ title: '', url: '' })
  if (!t) return null
  const member = (mid) => state.members.find((m) => m.id === mid)
  const upd = (patch, reason) => dispatch({ type: 'updateTask', id: t.id, patch, reason })
  const spec = specScore(t)
  const dups = similarTasks(t.title, state.tasks, t.id).filter((x) => x.status !== 'done')

  const changeDeadline = (value) => {
    if (t.deadline && value !== t.deadline) {
      const reason = window.prompt('Почему переносим дедлайн? Это попадёт в историю задачи.', '')
      if (reason === null) return
      upd({ deadline: value }, reason)
    } else upd({ deadline: value })
  }

  return (
    <Modal title="Задача" onClose={onClose} wide>
      <input className="title-input" value={t.title} onChange={(e) => upd({ title: e.target.value })} aria-label="Название" />

      {dups.length > 0 && (
        <div className="notice warn">
          Похожие задачи уже есть:{' '}
          {dups.map((d, i) => (
            <span key={d.id}>
              {i > 0 && ', '}
              <a href="#" onClick={(e) => (e.preventDefault(), onOpen(d.id))}>«{d.title}»</a> ({member(d.assignee)?.name ?? 'без исполнителя'})
            </span>
          ))}
          . Убедитесь, что работа не дублируется.
        </div>
      )}

      <div className="task-grid">
        <div className="task-main">
          <h3>
            ТЗ <span className="muted small">заполнено на {Math.round(spec.score * 100)}%</span>
          </h3>
          <Meter value={spec.score} label="Полнота ТЗ" />
          {spec.missing.length > 0 && <p className="muted small">Не хватает: {spec.missing.join(', ')}</p>}
          <label>
            Цель — зачем делаем
            <textarea rows={2} value={t.spec.goal} onChange={(e) => upd({ spec: { ...t.spec, goal: e.target.value } })} />
          </label>
          <label>
            Критерии готовности
            <textarea rows={2} value={t.spec.criteria} onChange={(e) => upd({ spec: { ...t.spec, criteria: e.target.value } })} />
          </label>
          <label>
            Детали, ограничения
            <textarea rows={2} value={t.spec.details} onChange={(e) => upd({ spec: { ...t.spec, details: e.target.value } })} />
          </label>

          <h3>Материалы</h3>
          <ul className="links">
            {t.links.map((l, i) => (
              <li key={i}>
                🔗 <a href={l.url} target="_blank" rel="noreferrer">{l.title || l.url}</a>
              </li>
            ))}
            {t.links.length === 0 && <li className="muted small">Ссылки, документы и макеты хранятся прямо в задаче</li>}
          </ul>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault()
              if (!link.url.trim()) return
              dispatch({ type: 'addLink', id: t.id, link })
              setLink({ title: '', url: '' })
            }}
          >
            <input placeholder="Название" value={link.title} onChange={(e) => setLink({ ...link, title: e.target.value })} />
            <input placeholder="https://…" value={link.url} onChange={(e) => setLink({ ...link, url: e.target.value })} />
            <button className="btn">Добавить</button>
          </form>

          <h3>Обсуждение</h3>
          <div className="comments">
            {t.comments.map((c) => (
              <div key={c.id} className="comment">
                <Avatar member={member(c.author)} size={20} />
                <div>
                  <div className="muted small">
                    {member(c.author)?.name} · {fmtTime(c.at)}
                  </div>
                  {c.text}
                </div>
              </div>
            ))}
          </div>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault()
              if (!comment.trim()) return
              dispatch({ type: 'comment', id: t.id, text: comment.trim() })
              setComment('')
            }}
          >
            <input placeholder="Комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn">Отправить</button>
          </form>
        </div>

        <aside className="task-side">
          <label>
            Статус
            <select value={t.status} onChange={(e) => dispatch({ type: 'move', id: t.id, status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </label>
          <label>
            Исполнитель
            <MemberSelect members={state.members} value={t.assignee} onChange={(v) => upd({ assignee: v })} />
          </label>
          <label>
            Ревьюер
            <MemberSelect members={state.members} value={t.reviewer} onChange={(v) => upd({ reviewer: v })} placeholder="Назначится автоматически" />
          </label>
          <label>
            Дедлайн
            <input type="date" value={t.deadline ?? ''} onChange={(e) => changeDeadline(e.target.value)} />
          </label>

          {t.deadlineHistory.length > 0 && (
            <div className="history">
              <div className="muted small">История переносов</div>
              {t.deadlineHistory.map((h, i) => (
                <div key={i} className="small">
                  {fmtDate(h.from)} → {fmtDate(h.to)}: {h.reason}
                </div>
              ))}
            </div>
          )}

          <div className="block-box">
            {t.blocked ? (
              <>
                <div className="notice bad">⛔ {t.blocked.reason}</div>
                <button className="btn" onClick={() => dispatch({ type: 'unblock', id: t.id })}>Блокер снят</button>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!blockReason.trim()) return
                  dispatch({ type: 'block', id: t.id, reason: blockReason.trim() })
                  setBlockReason('')
                }}
              >
                <input placeholder="Что мешает?" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
                <button className="btn">Отметить блокер</button>
              </form>
            )}
          </div>

          <div>
            <div className="muted small">Помогали</div>
            <div className="row">
              {t.helpers.map((h) => (
                <Avatar key={h} member={member(h)} />
              ))}
              {!t.helpers.includes(state.me) && t.assignee !== state.me && (
                <button className="btn tiny" onClick={() => dispatch({ type: 'help', id: t.id })}>Я помог</button>
              )}
            </div>
          </div>

          <button
            className="btn danger"
            onClick={() => {
              if (window.confirm('Удалить задачу?')) {
                dispatch({ type: 'deleteTask', id: t.id })
                onClose()
              }
            }}
          >
            Удалить задачу
          </button>
        </aside>
      </div>
    </Modal>
  )
}
