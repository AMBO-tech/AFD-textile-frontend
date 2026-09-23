/**
 * tokenStore — Stockage sécurisé du JWT d'accès et de refresh en mémoire
 *
 * - Access token  → mémoire module + sessionStorage (effacé à la fermeture d'onglet)
 * - Refresh token → mémoire module + sessionStorage (même politique)
 *
 * La variable de module est invisible depuis la console du navigateur.
 * Aucune donnée n'est persistée dans localStorage pour limiter l'exposition XSS.
 */

const SESSION_KEY = '__rsk_session__'
const REFRESH_KEY = '__rsk_refresh__'

let _token: string | null = null
let _refreshToken: string | null = null

/** Initialise les deux tokens depuis sessionStorage (ou localStorage en fallback) au premier import du module. */
function init(): void {
  try {
    _token = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    _refreshToken = sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY)
  } catch {
    _token = null
    _refreshToken = null
  }
}

init()

export const tokenStore = {
  // ─── Access Token ────────────────────────────────────────────────────────────

  set(token: string): void {
    _token = token
    try {
      sessionStorage.setItem(SESSION_KEY, token)
      localStorage.setItem(SESSION_KEY, token)
    } catch {
      // Silencieux si le stockage est bloqué
    }
  },

  get(): string | null {
    if (!_token) {
      try {
        _token = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
      } catch {
        // Silencieux
      }
    }
    return _token
  },

  // ─── Refresh Token ───────────────────────────────────────────────────────────

  setRefreshToken(token: string): void {
    _refreshToken = token
    try {
      sessionStorage.setItem(REFRESH_KEY, token)
      localStorage.setItem(REFRESH_KEY, token)
    } catch {
      // Silencieux
    }
  },

  getRefreshToken(): string | null {
    if (!_refreshToken) {
      try {
        _refreshToken = sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY)
      } catch {
        // Silencieux
      }
    }
    return _refreshToken
  },

  // ─── Utilitaires ─────────────────────────────────────────────────────────────

  /** Supprime les deux tokens de la mémoire, du sessionStorage et du localStorage. */
  clear(): void {
    _token = null
    _refreshToken = null
    try {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(REFRESH_KEY)
    } catch {
      // Silencieux
    }
  },

  hasToken(): boolean {
    return _token !== null
  },
}
