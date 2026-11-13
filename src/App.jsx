import { useEffect, useReducer, useState } from 'react'
import { load, reducer, save } from './store.js'
import { Avatar, fmtTime } from './components/ui.jsx'
import Board from './components/Board.jsx'
import Dashboard from './components/Dashboard.jsx'
import Team from './components/Team.jsx'
import Retro from './components/Retro.jsx'
import Knowledge from './components/Knowledge.jsx'
import Automations from './components/Automations.jsx'
import Analytics from './components/Analytics.jsx'
import TaskModal from './components/TaskModal.jsx'
import NewTask from './components/NewTask.jsx'
import Assistant from './components/Assistant.jsx'

const VIEWS = [
  { id: 'board', title: 'Доска', icon: '▦' },
  { id: 'sprint', title: 'Спринт', icon: '◎' },
  { id: 'team', title: 'Вклад', icon: '★' },
  { id: 'retro', title: 'Ретро', icon: '↺' },
  { id: 'kb', title: 'База знаний', icon: '▤' },
  { id: 'rules', title: 'Автоматизации', icon: '⚙' },
  { id: 'analytics', title: 'Аналитика', icon: '▁▃▅' },
]

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [view, setView] = useState(() => location.hash.slice(1) || 'board')
  const [openTask, setOpenTask] = useState(null)
  const [creating, setCreating] = useState(false)
  const [assistant, setAssistant] = useState(false)
  const [bell, setBell] = useState(false)

  useEffect(() => {
    save(state)
  }, [state])

  useEffect(() => {
    dispatch({ type: 'track', event: 'session_start' })
    dispatch({ type: 'runReminders' })
    const id = setInterval(() => dispatch({ type: 'runReminders' }), 60000)
    return () => clearInterval(id)
  }, [])

  const go = (id) => {
    setView(id)
    location.hash = id
    dispatch({ type: 'track', event: 'view_opened', meta: { view: id } })
  }

  const unread = state.notifications.filter((n) => !n.read).length
  const me = state.members.find((m) => m.id === state.me)
  const props = { state, dispatch, onOpen: setOpenTask }

  return (
    <div className={`app ${assistant ? 'with-assistant' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <span className="logo">AJB</span>
          <span className="brand-name">Agile Just Better</span>
        </div>
        <nav className="nav">
          {VIEWS.map((v) => (
            <button key={v.id} className={`nav-btn ${view === v.id ? 'active' : ''}`} onClick={() => go(v.id)}>
              <span className="nav-icon" aria-hidden>{v.icon}</span>
              <span className="nav-label">{v.title}</span>
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <div className="bell-wrap">
            <button
              className="icon-btn"
              aria-label="Уведомления"
              onClick={() => {
                setBell(!bell)
                if (!bell) dispatch({ type: 'readNotifications' })
              }}
            >
              🔔{unread > 0 && <span className="badge">{unread}</span>}
            </button>
            {bell && (
              <div className="dropdown">
                {state.notifications.length === 0 && <div className="muted small pad">Уведомлений нет</div>}
                {state.notifications.slice(0, 15).map((n) => (
                  <div
                    key={n.id}
                    className="note"
                    onClick={() => {
                      if (n.taskId) setOpenTask(n.taskId)
                      setBell(false)
                    }}
                  >
                    <div className="small">{n.text}</div>
                    <div className="muted tiny">{fmtTime(n.at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn ai-btn" onClick={() => setAssistant(!assistant)}>✨ <span className="nav-label">Помощник</span></button>
          <label className="me" title="Сменить пользователя (для демо)">
            <Avatar member={me} />
            <select value={state.me} onChange={(e) => dispatch({ type: 'setMe', id: e.target.value })} aria-label="Текущий пользователь">
              {state.members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="main">
        {view === 'board' && <Board {...props} onNew={() => setCreating(true)} />}
        {view === 'sprint' && <Dashboard {...props} />}
        {view === 'team' && <Team {...props} />}
        {view === 'retro' && <Retro {...props} />}
        {view === 'kb' && <Knowledge {...props} />}
        {view === 'rules' && <Automations {...props} />}
        {view === 'analytics' && <Analytics {...props} />}
      </main>

      {assistant && <Assistant state={state} dispatch={dispatch} onClose={() => setAssistant(false)} />}
      {openTask && <TaskModal {...props} id={openTask} onClose={() => setOpenTask(null)} />}
      {creating && <NewTask {...props} onClose={() => setCreating(false)} />}
    </div>
  )
}
