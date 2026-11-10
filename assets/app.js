'use strict';
// JSON text is inserted with textContent; only HTTP(S) links are accepted.
const $ = (selector) => document.querySelector(selector);
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeURL(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function addLink(parent, url, label) {
  const href = safeURL(url);
  if (!href) return;
  const link = element('a', '', label + ' ↗');
  link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', label + '（新しいタブで開きます）');
  parent.append(link);
}
function empty(message, description) {
  const node = element('div', 'empty-state');
  node.append(element('h3', '', message), element('p', '', description));
  return node;
}
function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function validateData(data) {
  if (!isRecord(data) || !isRecord(data.profile)) throw new Error('Invalid profile');
  for (const key of ['intro', 'about', 'education', 'interests']) {
    if (typeof data.profile[key] !== 'string') throw new Error('Invalid profile field');
  }
  for (const key of ['projects', 'activities', 'skills']) {
    if (!Array.isArray(data[key])) throw new Error('Invalid collection');
  }
  for (const item of data.projects) {
    if (!isRecord(item) || !['title', 'category', 'description'].every(key => typeof item[key] === 'string') || !Array.isArray(item.tags) || !item.tags.every(tag => typeof tag === 'string')) throw new Error('Invalid project');
  }
  for (const item of data.activities) {
    if (!isRecord(item) || !['title', 'category', 'description', 'date'].every(key => typeof item[key] === 'string') || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error('Invalid activity');
    const date = new Date(item.date + 'T00:00:00Z');
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== item.date) throw new Error('Invalid date');
  }
  for (const group of data.skills) {
    if (!isRecord(group) || typeof group.category !== 'string' || !Array.isArray(group.items) || !group.items.every(item => typeof item === 'string')) throw new Error('Invalid skills');
  }
  return data;
}
function renderProjects(projects, filter = 'all') {
  const categories = ['AI開発', '機械学習', 'ハッカソン'];
  const visible = projects.filter(project => filter === 'all' || (filter === 'その他' ? !categories.includes(project.category) : project.category === filter));
  $('#project-count').textContent = visible.length + ' 件のプロジェクト';
  const nodes = visible.map((project, index) => {
    const card = element('article', 'project-card');
    card.append(element('span', 'card-category', String(index + 1).padStart(2, '0') + ' / ' + project.category), element('h3', '', project.title), element('p', '', project.description));
    const tags = element('div', 'tags');
    project.tags.forEach(tag => tags.append(element('span', 'tag', tag)));
    card.append(tags); addLink(card, project.url, 'プロジェクトを見る'); return card;
  });
  $('#project-list').replaceChildren(...(nodes.length ? nodes : [empty(projects.length ? 'このカテゴリの実績はまだありません。' : 'これからの挑戦を、ここに。', '公開できるプロジェクトを準備中です。')]));
}
function render(data) {
  $('#profile-intro').textContent = data.profile.intro;
  $('#about-text').textContent = data.profile.about;
  const details = $('#profile-details').querySelectorAll('dd');
  details[0].textContent = data.profile.education; details[1].textContent = data.profile.interests;
  renderProjects(data.projects);
  $('.filters').hidden = false;
  $('.filters').addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    $('.filters').querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderProjects(data.projects, button.dataset.filter);
  });
  if (data.activities.length) {
    const activities = [...data.activities].sort((a, b) => b.date.localeCompare(a.date));
    $('#activity-list').replaceChildren(...activities.map(activity => {
      const row = element('article', 'activity-row');
      const date = element('time', '', activity.date.replaceAll('-', '.')); date.dateTime = activity.date;
      const content = element('div');
      content.append(element('span', 'card-category', activity.category), element('h3', '', activity.title), element('p', '', activity.description));
      addLink(content, activity.url, '詳細を見る'); row.append(date, content); return row;
    }));
  }
  if (data.skills.length) $('#skill-list').replaceChildren(...data.skills.map((group, index) => {
    const card = element('article', 'skill-card');
    card.append(element('span', 'skill-number', String(index + 1).padStart(2, '0')), element('h3', '', group.category));
    if (group.items.length) {
      const list = element('ul'); group.items.forEach(item => list.append(element('li', '', item))); card.append(list);
    } else card.append(element('p', '', '情報は準備中です。'));
    return card;
  }));
}
const menu = $('.menu-toggle');
const nav = $('#navigation');
menu.hidden = false;
const mobile = matchMedia('(max-width: 760px)');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.dataset.collapsed = String(mobile.matches); }
closeMenu(); mobile.addEventListener('change', closeMenu);
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.dataset.collapsed = String(!open); });
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
$('#year').textContent = String(new Date().getFullYear());
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    nav.querySelectorAll('a').forEach(link => {
      if (link.hash === '#' + visible.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -40% 0px', threshold: [0, 0.2, 0.5] });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
fetch('data/portfolio.json').then(response => {
  if (!response.ok) throw new Error('Data request failed');
  return response.json();
}).then(validateData).then(render).catch(() => {
  $('#data-status').textContent = '活動データを読み込めませんでした。時間をおいて再読み込みしてください。GitHubプロフィールは引き続きご覧いただけます。';
});
