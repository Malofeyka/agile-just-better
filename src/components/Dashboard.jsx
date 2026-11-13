import { isOverdue, specScore, sprintForecast, staleInfo, statusTitle } from '../store.js'
import { Avatar, fmtDate } from './ui.jsx'

const VERDICT = {
  ok: ['ok', 'Успеваем'],
  risk: ['warn', 'Есть риск не успеть'],
  bad: ['bad', 'При текущем темпе не успеем'],
}

export default function Dashboard({ state, onOpen }) {
  const f = sprintForecast(state)
  const member = (id) => state.members.find((m) => m.id === id)
  const blocked = state.tasks.filter((t) => t.blocked)
  const stale = state.tasks.filter((t) => staleInfo(t))
  const overdue = state.tasks.filter(isOverdue)
  const noSpec = state.tasks.filter((t) => t.status !== 'done' && specScore(t).score < 1)
  const upcoming = state.tasks.filter((t) => t.deadline && t.status !== 'done').sort((a, b) => a.deadline.localeCompare(b.deadline))
  const [tone, label] = VERDICT[f.verdict]

  const Item = ({ t, note }) => (
    <li className="list-item" onClick={() => onOpen(t.id)}>
      <Avatar member={member(t.assignee)} size={22} />
      <div className="grow">
        <div>{t.title}</div>
        <div className="muted small">{note}</div>
      </div>
    </li>
  )

  return (
    <section>
      <div className="toolbar">
        <h1>Спринт на одном экране</h1>
        <span className="muted">
          {fmtDate(state.sprint.start)} — {fmtDate(state.sprint.end)}
        </span>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">
            {f.done}/{f.total}
          </div>
          <div className="muted small">задач закрыто</div>
        </div>
        <div className="stat">
          <div className="stat-value">{f.daysLeft}</div>
          <div className="muted small">дней до конца</div>
        </div>
        <div className="stat">
          <div className="stat-value">{blocked.length}</div>
          <div className="muted small">блокеров</div>
        </div>
        <div className={`stat tone-${tone}`}>
          <div className="stat-value small-value">{label}</div>
          <div className="muted small">
            темп {f.pace.toFixed(1)}/день, нужно {f.needPace === Infinity ? '—' : f.needPace.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="progress" aria-label="Прогресс спринта">
        {['done', 'review', 'doing', 'todo'].map((s) => {
          const n = state.tasks.filter((t) => t.status === s).length
          return n ? <div key={s} className={`seg seg-${s}`} style={{ flex: n }} title={`${statusTitle(s)}: ${n}`} /> : null
        })}
      </div>

      <div className="panels">
        <div className="panel">
          <h3>⛔ Блокеры</h3>
          <ul className="list">
            {blocked.map((t) => (
              <Item key={t.id} t={t} note={t.blocked.reason} />
            ))}
            {!blocked.length && <li className="muted small">Нет</li>}
          </ul>
        </div>
        <div className="panel">
          <h3>⏰ Зависшие задачи</h3>
          <ul className="list">
            {stale.map((t) => (
              <Item key={t.id} t={t} note={`${statusTitle(t.status)} · ${staleInfo(t)}`} />
            ))}
            {!stale.length && <li className="muted small">Нет</li>}
          </ul>
        </div>
        <div className="panel">
          <h3>📅 Дедлайны</h3>
          <ul className="list">
            {upcoming.map((t) => (
              <Item
                key={t.id}
                t={t}
                note={`${isOverdue(t) ? 'Просрочено · ' : ''}до ${fmtDate(t.deadline)}${t.deadlineHistory.length ? ` · переносили ×${t.deadlineHistory.length}` : ''}`}
              />
            ))}
          </ul>
          {overdue.length > 0 && <p className="small bad-text">Просрочено: {overdue.length}</p>}
        </div>
        <div className="panel">
          <h3>📝 Неполные ТЗ</h3>
          <ul className="list">
            {noSpec.map((t) => (
              <Item key={t.id} t={t} note={`Нет: ${specScore(t).missing.join(', ')}`} />
            ))}
            {!noSpec.length && <li className="muted small">Все ТЗ заполнены</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}
