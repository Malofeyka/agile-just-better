// Состояние приложения: один объект, хранится в localStorage.
// Все изменения идут через reducer, чтобы автоматизации и аналитика
// срабатывали в одном месте, а не были размазаны по компонентам.

export const STORAGE_KEY = 'ajb-state-v1'
const DAY = 86400000

export const STATUSES = [
  { id: 'todo', title: 'Запланировано' },
  { id: 'doing', title: 'В работе' },
  { id: 'review', title: 'На проверке' },
  { id: 'done', title: 'Готово' },
]
export const statusTitle = (id) => STATUSES.find((s) => s.id === id)?.title ?? id

export const uid = () => Math.random().toString(36).slice(2, 9)

export function seed() {
  const now = Date.now()
  const d = (days) => new Date(now + days * DAY).toISOString().slice(0, 10)
  const t = (days) => now + days * DAY
  const members = [
    { id: 'anna', name: 'Анна', role: 'Тимлид', color: '#7c5cff' },
    { id: 'boris', name: 'Борис', role: 'Разработчик', color: '#0ea5e9' },
    { id: 'vera', name: 'Вера', role: 'Разработчик', color: '#10b981' },
    { id: 'gleb', name: 'Глеб', role: 'Дизайнер', color: '#f59e0b' },
    { id: 'dina', name: 'Дина', role: 'Маркетолог', color: '#ef4444' },
  ]
  const task = (o) => ({
    id: uid(),
    status: 'todo',
    assignee: null,
    reviewer: null,
    deadline: null,
    deadlineHistory: [],
    spec: { goal: '', criteria: '', details: '' },
    links: [],
    blocked: null,
    helpers: [],
    comments: [],
    createdAt: t(-6),
    statusChangedAt: t(-6),
    ...o,
  })
  const tasks = [
    task({
      title: 'Экран авторизации',
      status: 'done',
      assignee: 'boris',
      reviewer: 'anna',
      deadline: d(-2),
      spec: { goal: 'Пользователь входит по почте', criteria: 'Вход, выход, ошибка неверного пароля', details: '' },
      statusChangedAt: t(-2),
      doneAt: t(-2),
      helpers: ['vera'],
    }),
    task({
      title: 'API списка задач',
      status: 'review',
      assignee: 'vera',
      reviewer: 'anna',
      deadline: d(1),
      spec: { goal: 'Отдавать задачи спринта', criteria: 'GET /tasks, фильтр по статусу', details: 'Пагинация не нужна' },
      links: [{ title: 'Схема API', url: 'https://example.com/api' }],
      statusChangedAt: t(-1),
    }),
    task({
      title: 'Макет дашборда спринта',
      status: 'doing',
      assignee: 'gleb',
      deadline: d(2),
      spec: { goal: 'Тимлид видит блокеры на одном экране', criteria: '', details: '' },
      statusChangedAt: t(-3),
    }),
    task({
      title: 'Интеграция с почтой',
      status: 'doing',
      assignee: 'boris',
      deadline: d(-1),
      deadlineHistory: [{ from: d(-3), to: d(-1), at: t(-3), reason: 'Ждали доступ к SMTP' }],
      blocked: { reason: 'Нет доступа к SMTP-серверу заказчика', at: t(-2) },
      spec: { goal: 'Уведомления о дедлайнах на почту', criteria: 'Письмо за сутки до дедлайна', details: '' },
      statusChangedAt: t(-4),
    }),
    task({
      title: 'Модуль уведомлений',
      status: 'todo',
      assignee: 'vera',
      deadline: d(3),
      spec: { goal: '', criteria: '', details: '' },
      createdAt: t(-4),
      statusChangedAt: t(-4),
    }),
    task({
      title: 'Посты для запуска в соцсетях',
      status: 'todo',
      assignee: 'dina',
      deadline: d(4),
      spec: { goal: 'Анонс бета-версии', criteria: '3 поста, 1 видео', details: '' },
      createdAt: t(-1),
      statusChangedAt: t(-1),
    }),
    task({
      title: 'Онбординг для новых пользователей',
      status: 'todo',
      deadline: d(5),
      spec: { goal: 'Понятный первый вход', criteria: '', details: '' },
      createdAt: t(-1),
      statusChangedAt: t(-1),
    }),
  ]
  return {
    version: 1,
    me: 'anna',
    members,
    tasks,
    sprint: { name: 'Спринт 3', start: d(-7), end: d(5) },
    kb: [
      {
        id: uid(),
        title: 'Как мы работаем со статусами',
        body: 'Взял задачу — нажми «Начать». Закончил — «На проверку». Ревьюер назначается сам по правилу автоматизации.',
        updatedAt: t(-5),
      },
      {
        id: uid(),
        title: 'Шаблон ТЗ',
        body: 'Цель: зачем делаем.\nКритерии готовности: как поймём, что готово.\nДетали: ограничения, ссылки, макеты.',
        updatedAt: t(-5),
      },
    ],
    retro: [
      { id: uid(), type: 'bad', text: 'Два человека начали один и тот же модуль уведомлений', taskId: null },
      { id: uid(), type: 'good', text: 'Быстро разобрали блокер с авторизацией', taskId: null },
      { id: uid(), type: 'idea', text: 'Проверять ТЗ на полноту до начала спринта', taskId: null },
    ],
    rules: [
      { id: 'auto-start', enabled: true, title: 'Нажал «Начать» → задача переходит в «В работе» и назначается на тебя' },
      { id: 'auto-reviewer', enabled: true, title: 'Задача ушла «На проверку» → ревьюером назначается тимлид' },
      { id: 'stale-reminder', enabled: true, title: 'Задача с исполнителем висит в «Запланировано» больше 2 дней → напоминание' },
      { id: 'stuck-reminder', enabled: true, title: 'Задача «В работе» без движения больше 3 дней → напоминание' },
      { id: 'deadline-log', enabled: true, title: 'Перенос дедлайна → автоматически записывается в историю задачи' },
      { id: 'credit-helpers', enabled: true, title: 'Задача закрыта → ревьюеру и помощникам начисляется вклад' },
    ],
    notifications: [],
    events: [],
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return seed()
}

export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

const ruleOn = (s, id) => s.rules.find((r) => r.id === id)?.enabled

function track(s, type, meta = {}) {
  return { ...s, events: [...s.events, { type, at: Date.now(), meta }].slice(-2000) }
}

function notify(s, text, taskId = null) {
  return { ...s, notifications: [{ id: uid(), text, taskId, at: Date.now(), read: false }, ...s.notifications].slice(0, 100) }
}

function patchTask(s, id, fn) {
  return { ...s, tasks: s.tasks.map((t) => (t.id === id ? fn(t) : t)) }
}

function moveTask(s, id, status) {
  const task = s.tasks.find((t) => t.id === id)
  if (!task || task.status === status) return s
  const lead = s.members.find((m) => m.role === 'Тимлид')?.id
  s = patchTask(s, id, (t) => ({
    ...t,
    status,
    statusChangedAt: Date.now(),
    doneAt: status === 'done' ? Date.now() : t.doneAt,
    reviewer: status === 'review' && ruleOn(s, 'auto-reviewer') && !t.reviewer && lead !== t.assignee ? lead : t.reviewer,
    blocked: status === 'done' ? null : t.blocked,
  }))
  s = track(s, 'task_moved', { from: task.status, to: status })
  if (status === 'review' && ruleOn(s, 'auto-reviewer') && !task.reviewer && lead && lead !== task.assignee) {
    s = notify(s, `Автоматизация: ревьюер «${task.title}» — ${s.members.find((m) => m.id === lead)?.name}`, id)
  }
  return s
}

export function reducer(s, a) {
  switch (a.type) {
    case 'reset':
      return seed()
    case 'setMe':
      return { ...s, me: a.id }
    case 'addTask': {
      const t = {
        id: uid(),
        status: 'todo',
        reviewer: null,
        deadlineHistory: [],
        links: [],
        blocked: null,
        helpers: [],
        comments: [],
        createdAt: Date.now(),
        statusChangedAt: Date.now(),
        assignee: null,
        deadline: null,
        spec: { goal: '', criteria: '', details: '' },
        ...a.task,
      }
      return track({ ...s, tasks: [...s.tasks, t] }, 'task_created', { source: a.source ?? 'form', specScore: specScore(t) })
    }
    case 'updateTask': {
      const old = s.tasks.find((t) => t.id === a.id)
      let next = patchTask(s, a.id, (t) => ({ ...t, ...a.patch }))
      if (a.patch.deadline !== undefined && old.deadline && a.patch.deadline !== old.deadline && ruleOn(s, 'deadline-log')) {
        next = patchTask(next, a.id, (t) => ({
          ...t,
          deadlineHistory: [...t.deadlineHistory, { from: old.deadline, to: a.patch.deadline, at: Date.now(), reason: a.reason || 'Причина не указана' }],
        }))
        next = track(next, 'deadline_moved')
      }
      return next
    }
    case 'deleteTask':
      return track({ ...s, tasks: s.tasks.filter((t) => t.id !== a.id) }, 'task_deleted')
    case 'move':
      return moveTask(s, a.id, a.status)
    case 'start': {
      // Одна кнопка вместо «перетащи карточку + назначь себя» (проблема №1, №2)
      let next = patchTask(s, a.id, (t) => ({ ...t, assignee: t.assignee ?? s.me }))
      next = moveTask(next, a.id, 'doing')
      return track(next, 'quick_start')
    }
    case 'block':
      return track(
        notify(
          patchTask(s, a.id, (t) => ({ ...t, blocked: { reason: a.reason, at: Date.now() } })),
          `Блокер: «${s.tasks.find((t) => t.id === a.id)?.title}» — ${a.reason}`,
          a.id,
        ),
        'task_blocked',
      )
    case 'unblock': {
      let next = patchTask(s, a.id, (t) => ({
        ...t,
        blocked: null,
        helpers: t.helpers.includes(s.me) || t.assignee === s.me ? t.helpers : [...t.helpers, s.me],
        unblockedBy: [...(t.unblockedBy ?? []), s.me],
      }))
      return track(next, 'task_unblocked')
    }
    case 'help':
      return track(
        patchTask(s, a.id, (t) => (t.helpers.includes(s.me) ? t : { ...t, helpers: [...t.helpers, s.me] })),
        'help_marked',
      )
    case 'comment':
      return track(
        patchTask(s, a.id, (t) => ({ ...t, comments: [...t.comments, { id: uid(), author: s.me, text: a.text, at: Date.now() }] })),
        'comment_added',
      )
    case 'addLink':
      return patchTask(s, a.id, (t) => ({ ...t, links: [...t.links, a.link] }))
    case 'toggleRule':
      return track({ ...s, rules: s.rules.map((r) => (r.id === a.id ? { ...r, enabled: !r.enabled } : r)) }, 'rule_toggled', { id: a.id })
    case 'addKb':
      return track({ ...s, kb: [{ id: uid(), title: a.title, body: a.body, updatedAt: Date.now() }, ...s.kb] }, 'kb_created')
    case 'updateKb':
      return { ...s, kb: s.kb.map((k) => (k.id === a.id ? { ...k, ...a.patch, updatedAt: Date.now() } : k)) }
    case 'addRetro':
      return track({ ...s, retro: [...s.retro, { id: uid(), type: a.kind, text: a.text, taskId: null }] }, 'retro_added')
    case 'retroToTask': {
      // Решение с ретро сразу становится задачей (проблема №7)
      const item = s.retro.find((r) => r.id === a.id)
      const id = uid()
      let next = reducer(s, { type: 'addTask', task: { id, title: item.text, spec: { goal: 'Решение с ретроспективы', criteria: '', details: '' } }, source: 'retro' })
      return { ...next, retro: next.retro.map((r) => (r.id === a.id ? { ...r, taskId: id } : r)) }
    }
    case 'runReminders': {
      // Напоминания по правилам (проблема №1, №6)
      let next = s
      const now = Date.now()
      const already = new Set(s.notifications.filter((n) => now - n.at < DAY).map((n) => n.text))
      for (const t of s.tasks) {
        const days = (now - t.statusChangedAt) / DAY
        const who = s.members.find((m) => m.id === t.assignee)?.name
        let text = null
        if (ruleOn(s, 'stale-reminder') && t.status === 'todo' && t.assignee && days > 2)
          text = `${who}, «${t.title}» висит в «Запланировано» ${Math.floor(days)} дн. Уже начал? Нажми «Начать».`
        else if (ruleOn(s, 'stuck-reminder') && t.status === 'doing' && days > 3)
          text = `${who}, «${t.title}» в работе ${Math.floor(days)} дн. без движения. Обнови статус или отметь блокер.`
        if (text && !already.has(text)) next = notify(next, text, t.id)
      }
      return next
    }
    case 'readNotifications':
      return { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }
    case 'importTasks': {
      let next = s
      for (const title of a.titles) next = reducer(next, { type: 'addTask', task: { title }, source: 'import' })
      return track(next, 'import', { count: a.titles.length, from: a.from })
    }
    case 'track':
      return track(s, a.event, a.meta)
    default:
      return s
  }
}

// ---------- Вычисления ----------

export function specScore(t) {
  const checks = [
    { ok: !!t.spec?.goal?.trim(), label: 'цель' },
    { ok: !!t.spec?.criteria?.trim(), label: 'критерии готовности' },
    { ok: !!t.deadline, label: 'дедлайн' },
    { ok: !!t.assignee, label: 'исполнитель' },
  ]
  return { score: checks.filter((c) => c.ok).length / checks.length, missing: checks.filter((c) => !c.ok).map((c) => c.label) }
}

const stem = (w) => w.slice(0, 5)
const words = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-zа-яё0-9 ]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .map(stem)

// Похожие задачи — защита от дублирования работы (проблема №4)
export function similarTasks(title, tasks, excludeId) {
  const a = new Set(words(title))
  if (a.size === 0) return []
  return tasks
    .filter((t) => t.id !== excludeId)
    .map((t) => {
      const b = new Set(words(t.title))
      const common = [...a].filter((w) => b.has(w)).length
      return { task: t, score: common / Math.min(a.size, b.size || 1) }
    })
    .filter((x) => x.score >= 0.5)
    .sort((x, y) => y.score - x.score)
    .slice(0, 3)
    .map((x) => x.task)
}

export const isOverdue = (t) => t.deadline && t.status !== 'done' && t.deadline < new Date().toISOString().slice(0, 10)

export function staleInfo(t) {
  const days = (Date.now() - t.statusChangedAt) / DAY
  if (t.status === 'todo' && t.assignee && days > 2) return `Не начата ${Math.floor(days)} дн.`
  if (t.status === 'doing' && days > 3) return `Без движения ${Math.floor(days)} дн.`
  return null
}

// Прогноз спринта: темп закрытия vs оставшиеся задачи (проблема №6, №11)
export function sprintForecast(s) {
  const start = new Date(s.sprint.start).getTime()
  const end = new Date(s.sprint.end).getTime() + DAY
  const now = Date.now()
  const elapsed = Math.max(1, (now - start) / DAY)
  const left = Math.max(0, (end - now) / DAY)
  const done = s.tasks.filter((t) => t.status === 'done').length
  const remaining = s.tasks.length - done
  const pace = done / elapsed
  const expected = pace * left
  const needPace = left > 0 ? remaining / left : Infinity
  let verdict = 'ok'
  if (expected < remaining * 0.6) verdict = 'bad'
  else if (expected < remaining) verdict = 'risk'
  return { done, remaining, total: s.tasks.length, pace, needPace, daysLeft: Math.ceil(left), verdict }
}

// Вклад: не только закрытые задачи (проблема №5)
export function contributions(s) {
  return s.members
    .map((m) => {
      const closed = s.tasks.filter((t) => t.status === 'done' && t.assignee === m.id).length
      const reviews = s.tasks.filter((t) => t.status === 'done' && t.reviewer === m.id).length
      const helped = s.tasks.filter((t) => t.helpers.includes(m.id)).length
      const unblocked = s.tasks.reduce((n, t) => n + (t.unblockedBy ?? []).filter((x) => x === m.id).length, 0)
      const comments = s.tasks.reduce((n, t) => n + t.comments.filter((c) => c.author === m.id).length, 0)
      const inWork = s.tasks.filter((t) => t.assignee === m.id && t.status !== 'done').length
      const points = closed * 3 + reviews * 2 + helped * 2 + unblocked * 3 + comments
      return { member: m, closed, reviews, helped, unblocked, comments, inWork, points }
    })
    .sort((a, b) => b.points - a.points)
}
