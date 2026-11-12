'use strict';
const $ = (selector) => document.querySelector(selector);
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeURL(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function validateRecords(records, categories) {
  if (!Array.isArray(records)) throw new Error('記録は配列で指定してください');
  for (const item of records) {
    if (!item || !['title', 'category', 'description', 'date'].every(key => typeof item[key] === 'string' && item[key].trim()) || !categories.includes(item.category)) throw new Error('記録の形式が正しくありません');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error('日付の形式が正しくありません');
    const date = new Date(item.date + 'T00:00:00Z');
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== item.date) throw new Error('存在しない日付です');
    if (item.url !== undefined && typeof item.url !== 'string') throw new Error('URLの形式が正しくありません');
  }
  return [...records].sort((a, b) => b.date.localeCompare(a.date));
}
function recordCard(record) {
  const card = element('article', 'record-card');
  const meta = element('div', 'record-meta');
  const date = element('time', '', record.date.replaceAll('-', '.')); date.dateTime = record.date;
  meta.append(element('span', '', record.category), date);
  card.append(meta, element('h3', '', record.title), element('p', '', record.description));
  const url = safeURL(record.url);
  if (url) {
    const link = element('a', '', '詳細を見る ↗');
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', record.title + 'の詳細（新しいタブで開きます）'); card.append(link);
  }
  return card;
}
function emptyState(title, description) {
  const box = element('div', 'empty-state');
  box.append(element('p', 'eyebrow', 'TO BE CONTINUED'), element('h3', '', title), element('p', '', description));
  return box;
}
function setupCollection(root, records) {
  const list = root.querySelector('.record-list');
  const count = root.querySelector('.count');
  function render(category) {
    const visible = records.filter(record => category === 'all' || record.category === category);
    count.textContent = visible.length + '件の記録';
    list.replaceChildren(...(visible.length ? visible.map(recordCard) : [emptyState(root.dataset.emptyTitle, '公開できる記録を、これから少しずつ追加していきます。')]));
  }
  root.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    render(button.dataset.filter);
  }));
  root.querySelector('.filters').hidden = false;
  render('all');
}
const menu = $('.menu-toggle');
const nav = $('#navigation');
const mobile = matchMedia('(max-width: 760px)');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.dataset.collapsed = String(mobile.matches); }
menu.hidden = false; closeMenu(); mobile.addEventListener('change', closeMenu);
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.dataset.collapsed = String(!open); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
const collections = [...document.querySelectorAll('[data-collection]')];
if (collections.length) {
  fetch('data/portfolio.json').then(response => {
    if (!response.ok) throw new Error('データを取得できません');
    return response.json();
  }).then(data => {
    const validated = collections.map(root => ({ root, records: validateRecords(data[root.dataset.collection], root.dataset.categories.split(',')) }));
    validated.forEach(({ root, records }) => setupCollection(root, records));
  }).catch(() => {
    collections.forEach(root => {
      root.querySelector('.count').textContent = '読み込みエラー';
      root.querySelector('.record-list').replaceChildren(emptyState('記録を読み込めませんでした', '時間をおいてページを再読み込みしてください。'));
    });
    $('#data-status').textContent = '記録データの取得または形式の確認に失敗しました。';
  });
}
