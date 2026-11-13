import { fmtTime } from './ui.jsx'

// Встроенная продуктовая аналитика MVP: какие функции реально используют
// тестировщики. Нужна для этапа «Тестирование MVP, сбор метрик».
const LABELS = {
  session_start: 'Открыли приложение',
  view_opened: 'Переход между экранами',
  task_created: 'Создано задач',
  task_moved: 'Смена статуса',
  quick_start: 'Кнопка «Начать»',
  task_blocked: 'Отмечен блокер',
  task_unblocked: 'Снят блокер',
  help_marked: 'Отметка «Я помог»',
  deadline_moved: 'Перенос дедлайна',
  comment_added: 'Комментарии',
  retro_added: 'Пункты ретро',
  kb_created: 'Страницы базы знаний',
  rule_toggled: 'Переключение автоматизаций',
  assistant_asked: 'Вопросы ИИ-помощнику',
  duplicate_warned: 'Предупреждение о дубле',
  import: 'Импорт задач',
  task_deleted: 'Удалено задач',
}

export default function Analytics({ state }) {
  const ev = state.events
  const counts = {}
  for (const e of ev) counts[e.type] = (counts[e.type] ?? 0) + 1
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...rows.map((r) => r[1]))
  const created = ev.filter((e) => e.type === 'task_created')
  const bySource = {}
  for (const e of created) bySource[e.meta?.source ?? 'form'] = (bySource[e.meta?.source ?? 'form'] ?? 0) + 1
  const fullSpec = created.filter((e) => e.meta?.specScore?.score === 1).length
  const sessions = counts.session_start ?? 0

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(ev, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ajb-analytics.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <section>
      <div className="toolbar">
        <h1>Аналитика MVP</h1>
        <button className="btn" onClick={exportJson} disabled={!ev.length}>Выгрузить JSON</button>
      </div>
      <p className="muted">События пишутся локально в браузере тестировщика. После теста выгрузите JSON и сведите метрики.</p>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{sessions}</div>
          <div className="muted small">сессий</div>
        </div>
        <div className="stat">
          <div className="stat-value">{ev.length}</div>
          <div className="muted small">событий</div>
        </div>
        <div className="stat">
          <div className="stat-value">{created.length}</div>
          <div className="muted small">задач создано</div>
        </div>
        <div className="stat">
          <div className="stat-value">{created.length ? Math.round((fullSpec / created.length) * 100) : 0}%</div>
          <div className="muted small">с полным ТЗ</div>
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <h3>Использование функций</h3>
          {rows.map(([type, n]) => (
            <div key={type} className="bar-row">
              <span className="bar-label">{LABELS[type] ?? type}</span>
              <div className="bar-cell">
                <div className="bar" style={{ width: `${(n / max) * 100}%` }} />
                <span>{n}</span>
              </div>
            </div>
          ))}
          {!rows.length && <p className="muted small">Пока нет событий</p>}
        </div>
        <div className="panel">
          <h3>Откуда создают задачи</h3>
          {Object.entries(bySource).map(([src, n]) => (
            <div key={src} className="small">
              {{ form: 'Форма', assistant: 'ИИ-помощник', retro: 'Из ретро', import: 'Импорт' }[src] ?? src}: {n}
            </div>
          ))}
          {!created.length && <p className="muted small">—</p>}
          <h3>Последние события</h3>
          <ul className="log">
            {ev
              .slice(-12)
              .reverse()
              .map((e, i) => (
                <li key={i} className="small">
                  <span className="muted">{fmtTime(e.at)}</span> {LABELS[e.type] ?? e.type}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
