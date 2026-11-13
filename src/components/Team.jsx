import { contributions } from '../store.js'
import { Avatar } from './ui.jsx'

export default function Team({ state }) {
  const rows = contributions(state)
  const max = Math.max(1, ...rows.map((r) => r.points))
  return (
    <section>
      <div className="toolbar">
        <h1>Вклад команды</h1>
      </div>
      <p className="muted">
        Считаем не только закрытые задачи: ревью, помощь коллегам и снятые блокеры тоже работа. Очки: закрыл задачу — 3, снял блокер — 3,
        ревью — 2, помог — 2, комментарий — 1.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Участник</th>
              <th>Закрыл</th>
              <th>Ревью</th>
              <th>Помог</th>
              <th>Снял блокеров</th>
              <th>В работе</th>
              <th className="wide-col">Вклад</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.member.id}>
                <td>
                  <div className="row">
                    <Avatar member={r.member} />
                    <div>
                      <div>{r.member.name}</div>
                      <div className="muted small">{r.member.role}</div>
                    </div>
                  </div>
                </td>
                <td>{r.closed}</td>
                <td>{r.reviews}</td>
                <td>{r.helped}</td>
                <td>{r.unblocked}</td>
                <td>{r.inWork}</td>
                <td>
                  <div className="bar-cell">
                    <div className="bar" style={{ width: `${(r.points / max) * 100}%`, background: r.member.color }} />
                    <span>{r.points}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
