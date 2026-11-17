import { createStore, set, del, entries, clear } from 'idb-keyval'

/**
 * Every piece of evidence (file blob + metadata) lives in the browser's
 * IndexedDB, so the timeline survives refreshes and nothing is stored on a
 * server. One record per item, keyed by its id:
 *
 *   {
 *     id, name, blob, mime, size,
 *     typeId, date, dateSource, title, description, notes,
 *     status, createdAt,
 *   }
 */
const itemStore = createStore('nyaya-evidence', 'items')

export async function loadItems() {
  const pairs = await entries(itemStore)
  return pairs
    .map(([, item]) => item)
    .sort((a, b) => (a.date || '9999-99-99').localeCompare(b.date || '9999-99-99') || a.createdAt - b.createdAt)
}

export function saveItem(item) {
  return set(item.id, item, itemStore)
}

export function deleteItem(id) {
  return del(id, itemStore)
}

export function clearItems() {
  return clear(itemStore)
}
