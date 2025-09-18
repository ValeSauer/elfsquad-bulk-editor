// src/api/elfsquad.js
// API-Client für Elfsquad REST API mit OAuth2 Client Credentials Flow
import { ref } from 'vue'


const API_BASE = 'https://api.elfsquad.io/data/1'

export const token = ref(null)
export const tokenExpires = ref(null)
export const isAuthenticated = ref(false)

export async function authenticate({ clientId, clientSecret }) {
  const url = 'https://login.elfsquad.io/oauth2/token'
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'Elfskot.Api',
  })
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Auth fehlgeschlagen')
  const data = await res.json()
  token.value = data.access_token
  tokenExpires.value = Date.now() + (data.expires_in * 1000)
  isAuthenticated.value = true
  return data
}

export async function apiFetch(path, options = {}) {
  if (!token.value) throw new Error('Nicht authentifiziert')
  // Stelle sicher, dass path mit / beginnt
  const url = path.startsWith('/') ? API_BASE + path : API_BASE + '/' + path
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token.value}`,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  // Bei PATCH/DELETE kann die Response leer sein (204 No Content oder leerer Body)
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
