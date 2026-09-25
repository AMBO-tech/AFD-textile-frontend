/**
 * tokenStore — jetons de session (accès 15 min + rafraîchissement 7 jours).
 *
 * Stockés dans localStorage pour que la session survive à la fermeture de l'onglet ou du
 * navigateur pendant les 7 jours du jeton de rafraîchissement (durée fixée par le serveur,
 * JWT_REFRESH_EXPIRATION). Chaque rafraîchissement renvoie un nouveau jeton de 7 jours :
 * la session ne s'arrête qu'après 7 jours sans utilisation, ou à la déconnexion.
 *
 * Les lectures passent toujours par le stockage : tous les onglets voient le dernier jeton
 * émis, ce qui évite qu'un onglet réutilise un jeton de rafraîchissement déjà consommé
 * (le serveur interprète une réutilisation comme un vol et révoque toutes les sessions).
 */

const SESSION_KEY = '__rsk_session__'
const REFRESH_KEY = '__rsk_refresh__'

let _token: string | null = null
let _refreshToken: string | null = null

const lire = (cle: string): string | null => {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

const ecrire = (cle: string, valeur: string | null): void => {
  try {
    if (valeur) localStorage.setItem(cle, valeur)
    else localStorage.removeItem(cle)
  } catch {
    // Stockage bloqué (navigation privée stricte) : la session reste en mémoire pour cet onglet.
  }
}

/** Reprend une session ouverte avant ce changement (elle vivait dans sessionStorage). */
function migrerDepuisSessionStorage(): void {
  try {
    for (const cle of [SESSION_KEY, REFRESH_KEY]) {
      const ancienne = sessionStorage.getItem(cle)
      if (ancienne && !localStorage.getItem(cle)) localStorage.setItem(cle, ancienne)
      sessionStorage.removeItem(cle)
    }
  } catch {
    // Ignoré : pas de migration possible sans stockage.
  }
}

migrerDepuisSessionStorage()
_token = lire(SESSION_KEY)
_refreshToken = lire(REFRESH_KEY)

export const tokenStore = {
  // ─── Access Token ────────────────────────────────────────────────────────────

  set(token: string): void {
    _token = token
    ecrire(SESSION_KEY, token)
  },

  get(): string | null {
    return lire(SESSION_KEY) ?? _token
  },

  // ─── Refresh Token ───────────────────────────────────────────────────────────

  setRefreshToken(token: string): void {
    _refreshToken = token
    ecrire(REFRESH_KEY, token)
  },

  getRefreshToken(): string | null {
    return lire(REFRESH_KEY) ?? _refreshToken
  },

  // ─── Utilitaires ─────────────────────────────────────────────────────────────

  /** Supprime les deux jetons (déconnexion ou session expirée). */
  clear(): void {
    _token = null
    _refreshToken = null
    ecrire(SESSION_KEY, null)
    ecrire(REFRESH_KEY, null)
  },

  hasToken(): boolean {
    return this.get() !== null
  },
}
