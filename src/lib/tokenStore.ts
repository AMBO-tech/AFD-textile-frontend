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

/** Initialise les deux tokens depuis sessionStorage au premier import du module. */
function init(): void {
  try {
    _token = sessionStorage.getItem(SESSION_KEY)
    _refreshToken = sessionStorage.getItem(REFRESH_KEY)
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
    } catch {
      // Silencieux si sessionStorage est bloqué
    }
  },

  get(): string | null {
    return _token
  },

  // ─── Refresh Token ───────────────────────────────────────────────────────────

  setRefreshToken(token: string): void {
    _refreshToken = token
    try {
      sessionStorage.setItem(REFRESH_KEY, token)
    } catch {
      // Silencieux
    }
  },

  getRefreshToken(): string | null {
    return _refreshToken
  },

  // ─── Utilitaires ─────────────────────────────────────────────────────────────

  /** Supprime les deux tokens de la mémoire et du sessionStorage. */
  clear(): void {
    _token = null
    _refreshToken = null
    try {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(REFRESH_KEY)
    } catch {
      // Silencieux
    }
  },

  hasToken(): boolean {
    return _token !== null
  },
}
