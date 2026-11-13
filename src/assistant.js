// ИИ-помощник прототипа. Работает локально по правилам (без внешнего API),
// чтобы демо открывалось где угодно. Возвращает текст ответа и, при
// необходимости, действие для reducer.

import { contributions, isOverdue, similarTasks, specScore, sprintForecast, staleInfo, statusTitle } from './store.js'

const name = (s, id) => s.members.find((m) => m.id === id)?.name ?? 'без исполнителя'

export const SUGGESTIONS = [
  'Сводка по спринту',
  'Что блокирует спринт?',
  'Кто перегружен?',
  'Какие ТЗ неполные?',
  'Создай задачу Сверстать страницу тарифов',
]

export function ask(s, text) {
  const q = text.toLowerCase().trim()

  const create = q.match(/^(создай|добавь|новая)\s+задач[уа]\s*[:\-—]?\s*(.+)$/i)
  if (create) {
    const title = text.trim().split(/\s+/).slice(2).join(' ').replace(/^[:\-—]\s*/, '')
    const dups = similarTasks(title, s.tasks)
    const reply =
      `Создал задачу «${title}» в «Запланировано».` +
      (dups.length ? `\n\nПохоже, есть похожие: ${dups.map((t) => `«${t.title}» (${name(s, t.assignee)})`).join(', ')}. Проверь, чтобы не делать работу дважды.` : '') +
      `\n\nНе забудь заполнить цель и критерии готовности — без них ТЗ неполное.`
    return { reply, action: { type: 'addTask', task: { title }, source: 'assistant' } }
  }

  if (/блок|меша|застря/.test(q)) {
    const blocked = s.tasks.filter((t) => t.blocked)
    const stale = s.tasks.filter((t) => staleInfo(t))
    if (!blocked.length && !stale.length) return { reply: 'Блокеров нет, все задачи двигаются.' }
    return {
      reply:
        (blocked.length ? `Блокеры (${blocked.length}):\n` + blocked.map((t) => `• «${t.title}» — ${t.blocked.reason} (${name(s, t.assignee)})`).join('\n') : '') +
        (stale.length ? `\n\nЗависшие задачи:\n` + stale.map((t) => `• «${t.title}» — ${staleInfo(t)}`).join('\n') : ''),
    }
  }

  if (/перегруж|нагруз|загруж/.test(q)) {
    const load = s.members
      .map((m) => ({ m, n: s.tasks.filter((t) => t.assignee === m.id && t.status !== 'done').length }))
      .sort((a, b) => b.n - a.n)
    const free = s.tasks.filter((t) => !t.assignee && t.status !== 'done')
    return {
      reply:
        'Открытые задачи по людям:\n' +
        load.map(({ m, n }) => `• ${m.name}: ${n}`).join('\n') +
        (load[0].n >= 2 ? `\n\nБольше всего задач: ${load[0].m.name}. ` : '\n\n') +
        (free.length ? `Без исполнителя: ${free.map((t) => `«${t.title}»`).join(', ')}. Свободнее всех: ${load[load.length - 1].m.name}.` : ''),
    }
  }

  if (/тз|неполн|описан/.test(q)) {
    const bad = s.tasks.filter((t) => t.status !== 'done' && specScore(t).score < 1)
    if (!bad.length) return { reply: 'Все ТЗ заполнены.' }
    return { reply: 'В этих задачах не хватает данных:\n' + bad.map((t) => `• «${t.title}»: нет ${specScore(t).missing.join(', ')}`).join('\n') }
  }

  if (/дедлайн|срок|просроч/.test(q)) {
    const over = s.tasks.filter(isOverdue)
    const moved = s.tasks.filter((t) => t.deadlineHistory.length)
    return {
      reply:
        (over.length ? 'Просрочены:\n' + over.map((t) => `• «${t.title}» — до ${t.deadline}`).join('\n') : 'Просроченных задач нет.') +
        (moved.length ? '\n\nДедлайн переносили:\n' + moved.map((t) => `• «${t.title}» — ${t.deadlineHistory.length} раз(а), последняя причина: ${t.deadlineHistory.at(-1).reason}`).join('\n') : ''),
    }
  }

  if (/вклад|кто .*(больше|лучше)|рейтинг/.test(q)) {
    const c = contributions(s)
    return { reply: 'Вклад за спринт:\n' + c.map((x) => `• ${x.member.name}: ${x.points} очк. (закрыл ${x.closed}, ревью ${x.reviews}, помог ${x.helped}, снял блокеров ${x.unblocked})`).join('\n') }
  }

  if (/свод|итог|спринт|прогноз|успе/.test(q)) {
    const f = sprintForecast(s)
    const by = (st) => s.tasks.filter((t) => t.status === st).length
    const verdict = { ok: 'Успеваем.', risk: 'Есть риск не успеть.', bad: 'При текущем темпе не успеем.' }[f.verdict]
    return {
      reply:
        `${s.sprint.name}: закрыто ${f.done} из ${f.total}, до конца ${f.daysLeft} дн.\n` +
        `${statusTitle('todo')}: ${by('todo')}, ${statusTitle('doing')}: ${by('doing')}, ${statusTitle('review')}: ${by('review')}.\n` +
        `Темп: ${f.pace.toFixed(1)} задач/день, нужно ${f.needPace === Infinity ? '—' : f.needPace.toFixed(1)}. ${verdict}` +
        (s.tasks.some((t) => t.blocked) ? `\nБлокеров: ${s.tasks.filter((t) => t.blocked).length} — спроси «что блокирует спринт?»` : ''),
    }
  }

  const found = s.tasks.filter((t) => q.length > 3 && t.title.toLowerCase().includes(q))
  if (found.length)
    return { reply: found.map((t) => `«${t.title}» — ${statusTitle(t.status)}, ${name(s, t.assignee)}${t.deadline ? `, до ${t.deadline}` : ''}`).join('\n') }

  return {
    reply:
      'Я умею:\n• сводка по спринту и прогноз\n• что блокирует спринт\n• кто перегружен\n• какие ТЗ неполные\n• что с дедлайнами\n• вклад команды\n• «создай задачу …» — с проверкой на дубли',
  }
}
