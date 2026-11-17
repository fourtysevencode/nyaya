import { createStore, get, set } from 'idb-keyval'

/**
 * Small key-value store for the user's own data (emergency card, letter
 * drafts). Same privacy model as the evidence store: everything stays in
 * this browser, nothing is sent anywhere.
 */
const store = createStore('nyaya-profile', 'kv')

export function loadProfile() {
  return get('emergency-card', store).then((value) => value ?? null)
}

export function saveProfile(profile) {
  return set('emergency-card', profile, store)
}

export function loadDraft(id) {
  return get(`draft:${id}`, store).then((value) => value ?? null)
}

export function saveDraft(id, draft) {
  return set(`draft:${id}`, draft, store)
}
