/** Base de l'API (absolue en développement / production séparée, relative derrière un proxy). */
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/+$/, '');

/**
 * Adresse publique du bucket Cloudflare R2 (domaine r2.dev ou domaine personnalisé), si l'accès
 * public est activé. Les photos sont alors lues directement chez Cloudflare (CDN) ; sinon l'API
 * les sert depuis le bucket privé.
 */
const MEDIA_URL = (import.meta.env.VITE_MEDIA_URL || '').replace(/\/+$/, '');

/** Nom de fichier d'une photo de tissu générée au téléversement : <uuid>.webp ou <uuid>_thumb.webp. */
const PHOTO_TISSU = /(?:^|\/)(?:fabrics|media\/tissus)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:_thumb)?\.webp)(?:[?#]|$)/i;

/**
 * Adresse affichable d'une photo de tissu. Les photos enregistrées peuvent porter une adresse
 * illisible par le navigateur (ancienne adresse simulée localhost:3000/media, point d'accès privé
 * du bucket R2, domaine public mal configuré) : toute photo de tissu reconnue est donc lue
 * - chez Cloudflare R2 directement quand VITE_MEDIA_URL est défini (<MEDIA_URL>/fabrics/<fichier>),
 * - sinon par l'API (GET /media/tissus/:fichier), qui la lit dans le bucket privé.
 * Les autres adresses (aperçu local blob:, images externes) sont conservées telles quelles.
 */
export function urlPhoto(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('blob:') || src.startsWith('data:')) return src;
  const photo = PHOTO_TISSU.exec(src);
  if (!photo) return src;
  return MEDIA_URL ? `${MEDIA_URL}/fabrics/${photo[1]}` : `${API_URL}/media/tissus/${photo[1]}`;
}
