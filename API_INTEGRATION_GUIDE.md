# 🔌 Guide d'Intégration API — Frontend AFD-Textile

Ce guide est destiné au développeur chargé de connecter l'interface React / Vite (`frontend`) à l'API REST NestJS / Fastify (`backend`).

---

## 📋 1. Architecture Globale & Démarrage Rapide

### 1.1 Environnements & Ports
* **Serveur Backend (NestJS + Fastify) :** `http://localhost:3000/api/v1`
* **Swagger OpenAPI interactif :** `http://localhost:3000/api/v1/docs`
* **Client Frontend (Vite + React) :** `http://localhost:5173`
* **Base de données :** PostgreSQL 16 (Prisma ORM)

### 1.2 Configuration Frontend (`.env`)
Créez un fichier `frontend/.env` à la racine de `frontend/` (modèle fourni dans `frontend/.env.example`) :
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 1.3 Client HTTP Axios Configuré
Le client Axios central est déjà prêt dans [`frontend/src/api/api.ts`](./src/api/api.ts) :
* Injection automatique du JWT dans le header `Authorization: Bearer <token>` via `tokenStore` et `useAuthStore`.
* Interception automatique des erreurs `401 Unauthorized` pour purger la session et rediriger vers `/login`.
* Helper utilitaire `getErrorMessage(error)` pour formater les retours d'erreur de `ValidationPipe`.

---

## 🔐 2. Authentification, Sécurité & Gestion des Rôles

### 2.1 Rôles Applicatifs & Permissions
| Rôle | Périmètre & Droits |
| :--- | :--- |
| `OWNER` (Gérant / Propriétaire) | Accès global multi-boutiques. Peut switcher de boutique, créer des tissus, ajuster les stocks, valider les transferts, inviter des collaborateurs et consulter les analytics avancées. |
| `BOUTIQUIER` (Vendeur / Caissier) | Périmètre strictement restreint à sa boutique d'assignation (`user.locationId`). Ne peut pas voir les autres magasins ni valider les transferts. |

### 2.2 Endpoints d'Authentification (`/auth`)
| Méthode & Route | Accès | Description | Payload Clé |
| :--- | :--- | :--- | :--- |
| `POST /auth/login` | Public | Connexion unifiée (téléphone sénégalais +221 ou email + mot de passe) | `{ "identifier": "+221770000001", "password": "..." }` |
| `POST /auth/otp/send` | Public | Envoi d'un code SMS / Email temporaire (valide 5 min) | `{ "identifier": "+221770000001" }` |
| `POST /auth/otp/verify` | Public | Vérification de l'OTP à 6 chiffres et délivrance des tokens | `{ "identifier": "+221770000001", "code": "123456" }` |
| `POST /auth/setup-password`| Public | Activation du compte via lien magique (token SHA-256) | `{ "token": "...", "password": "..." }` |
| `POST /auth/refresh` | Public | Renouvellement de l'Access Token (15 min) via Refresh Token | `{ "refreshToken": "..." }` |
| `GET /auth/me` | JWT | Profil et boutique de l'utilisateur connecté | Header `Authorization: Bearer <token>` |
| `POST /auth/logout` | JWT | Révocation des sessions | `{ "refreshToken": "..." }` (optionnel) |
| `PATCH /auth/change-password` | JWT | Modification du mot de passe | `{ "ancienMotDePasse": "...", "nouveauMotDePasse": "..." }` |

---

## 📦 3. Catalogue Textile & Produits (`/produits`)

### 3.1 Endpoints
| Méthode & Route | Accès | Paramètres / Query | Réponse |
| :--- | :--- | :--- | :--- |
| `GET /produits` | Public | `page`, `limit`, `search`, `categorieId`, `locationId`, `statut` | Liste paginée `{ data, meta }` |
| `GET /produits/:id` | Public | Paramètre `:id` (UUID), `locationId` (optionnel) | Fiche tissu + niveau de stock local |
| `GET /produits/reference/:ref` | Public | Paramètre `:ref` (ex: `WAX-HOL-001`) | Fiche tissu par référence exacte |
| `GET /produits/categories` | Public | Aucun | Liste des catégories (Wax, Bazin, Satin, etc.) |
| `GET /produits/unites` | Public | Aucun | Unités acceptées : `["METRE", "KG", "ROULEAU"]` |
| `POST /produits` | OWNER | Body: `CreateProduitDto` | Tissu créé avec photo Cloudflare R2 |
| `PATCH /produits/:id` | OWNER | Body: `UpdateProduitDto` | Tissu mis à jour |
| `DELETE /produits/:id` | OWNER | Aucun | Archivage logique (statut `INACTIF`) |
| `POST /produits/:id/conversion` | Public | Body: `ConversionQueryDto` | **Moteur de conversion textile** |

### 3.2 Moteur de Conversion Textile (`POST /produits/:id/conversion`)
> **Important :** Le frontend ne calcule pas lui-même les conversions physiques. Il délègue au backend pour garantir la conformité avec la densité du tissu et le prix plancher.
```json
// Requête :
{
  "longueurMetres": 12.5,
  "poidsKg": 3.125,
  "nombreRouleaux": 2,
  "prixUnitairePropose": 6000
}

// Réponse Backend :
{
  "produitId": "22222222-2222-4222-8222-222222222201",
  "longueurMetres": 12.5,
  "poidsKg": 3.125,
  "nombreRouleaux": 0.41,
  "prixUnitaireApplique": 6000,
  "prixPlancherConforme": true,
  "totalEstime": 75000
}
```

---

## 🏬 4. Gestion des Stocks & Transferts (`/stocks`)

### 4.1 Endpoints
| Méthode & Route | Accès | Description |
| :--- | :--- | :--- |
| `GET /stocks/niveaux` | OWNER, BOUTIQUIER | Liste des stocks physiques. Si Boutiquier, filtré automatiquement sur sa boutique. Paramètres : `locationId`, `search`, `alertOnly`, `page`, `limit`. |
| `GET /stocks/mouvements` | OWNER, BOUTIQUIER | Journal d'audit append-only des flux physiques (`ENTREE_MANUELLE`, `VENTE`, `TRANSFERT`, `AJUSTEMENT`, `PERTE`, `ANNULATION`). |
| `POST /stocks/mouvements` | OWNER | Approvisionnement direct ou déclaration de perte. |
| `POST /stocks/ajustement` | OWNER | Régularisation physique d'inventaire avec justification obligatoire. |
| `PATCH /stocks/:id/tarifs` | OWNER | Personnalisation du prix de vente, du prix plancher et du seuil d'alerte pour une boutique. |
| `GET /stocks/transferts` | OWNER, BOUTIQUIER | Liste paginée des demandes et ordres de transfert (`statut`, `locationId`, `page`, `limit`). |
| `POST /stocks/transferts/demande` | OWNER, BOUTIQUIER | Initier une demande de réassort (génère la référence `TRF-YYYY-MM-XXXX`). |
| `POST /stocks/transferts/:id/valider` | OWNER | Validation physique du transfert : déstockage source et réception destination dans une transaction atomique. Permet de choisir `locationSourceId` si non spécifié lors de la demande. |
| `POST /stocks/transferts/:id/annuler` | OWNER, BOUTIQUIER | Annulation ou rejet avec justification obligatoire. |

### 4.2 Payload d'Initiation de Transfert (`POST /stocks/transferts/demande`)
```json
{
  "locationSourceId": "11111111-1111-4111-8111-111111111104", // Entrepôt ou autre boutique (optionnel si demande boutiquier)
  "locationDestinationId": "11111111-1111-4111-8111-111111111101", // Boutique réceptrice
  "lignes": [
    {
      "produitId": "22222222-2222-4222-8222-222222222201",
      "quantite": 50,
      "unite": "METRE"
    }
  ],
  "note": "Réassort urgent avant la fête de la Korité"
}
```

---

## 🛒 5. Facturation & Caisse POS (`/ventes`)

### 5.1 Endpoints
| Méthode & Route | Accès | Description |
| :--- | :--- | :--- |
| `POST /ventes` | OWNER, BOUTIQUIER | Création atomique d'une facture de vente (comptant ou crédit) avec déstockage immédiat. Header recommandé : `Idempotency-Key`. |
| `GET /ventes` | OWNER, BOUTIQUIER | Liste paginée des ventes avec filtres (`boutiqueId`, `clientId`, `statut`, `dateDebut`, `dateFin`). |
| `GET /ventes/:id` | OWNER, BOUTIQUIER | Détail complet d'une vente avec ses lignes, remises et règlements. |
| `POST /ventes/:id/annuler` | OWNER, BOUTIQUIER | Annulation de vente avec réintégration immédiate en stock et émission d'un bon de remboursement. |
| `POST /ventes/sync-offline` | OWNER, BOUTIQUIER | Synchronisation par lot des tickets enregistrés hors-ligne (PWA Dexie.js). |

### 5.2 Payload d'une Vente (`POST /ventes`)
```json
{
  "boutiqueId": "11111111-1111-4111-8111-111111111101", // Requis si OWNER, optionnel si BOUTIQUIER
  "clientId": "33333333-3333-4333-8333-333333333301",   // Optionnel (null pour vente comptoir anonyme)
  "lignes": [
    {
      "produitId": "22222222-2222-4222-8222-222222222201",
      "quantite": 6.0,
      "uniteSaisie": "METRE",
      "prixUnitaireApplique": 7500,
      "remiseMontant": 0
    }
  ],
  "paiementInitial": {
    "montant": 45000,
    "modePaiement": "WAVE", // "ESPECES" | "WAVE" | "ORANGE_MONEY" | "VIREMENT" | "CHEQUE"
    "referenceExterne": "WAVE-SN-TX-987654"
  },
  "dateEcheance": "2026-10-15T00:00:00.000Z", // Si vente à crédit (solde > 0)
  "idempotencyKey": "dexie-tx-uuid-local"
}
```

---

## 👥 6. Clients & Gestion des Créances (`/clients`)

### 6.1 Endpoints
| Méthode & Route | Accès | Description |
| :--- | :--- | :--- |
| `GET /clients` | OWNER, BOUTIQUIER | Liste paginée et recherche textuelle (`search`, `hasUnpaidDebts`, `page`, `limit`). |
| `GET /clients/:id` | OWNER, BOUTIQUIER | Fiche client complète avec total d'achats, montant payé et solde débiteur en direct. |
| `GET /clients/:id/creances` | OWNER, BOUTIQUIER | Relevé des factures impayées ordonnées selon la méthode FIFO. |
| `POST /clients` | OWNER, BOUTIQUIER | Création d'une fiche client (`nom`, `telephone`, `adresse`, `email`, `plafondCredit`). |
| `PATCH /clients/:id` | OWNER, BOUTIQUIER | Mise à jour des coordonnées. |
| `DELETE /clients/:id` | OWNER | Archivage logique (statut `INACTIF`). |

---

## 💵 7. Règlements & Arrêté de Caisse (`/reglements`)

### 7.1 Endpoints
| Méthode & Route | Accès | Description |
| :--- | :--- | :--- |
| `POST /reglements` | OWNER, BOUTIQUIER | Enregistrement d'un encaissement sur créance avec ventilation FIFO ou manuelle. |
| `GET /reglements` | OWNER, BOUTIQUIER | Historique des reçus d'encaissement délivrés (`REC-YYYY-MM-XXXX`). |
| `GET /reglements/:id` | OWNER, BOUTIQUIER | Détail d'un reçu et répartition sur les factures réglées. |
| `GET /reglements/bilan-caisse` | OWNER, BOUTIQUIER | **Arrêté de caisse (Z de caisse)** : total espèces, Wave, Orange Money, chèques sur la période. |
| `POST /reglements/:id/annuler` | OWNER, BOUTIQUIER | Répudiation comptable d'un encaissement et réouverture de la dette sur les factures associées. |

### 7.2 Payload d'un Règlement (`POST /reglements`)
```json
{
  "clientId": "33333333-3333-4333-8333-333333333301",
  "boutiqueId": "11111111-1111-4111-8111-111111111101",
  "montant": 25000,
  "moyenPaiement": "ORANGE_MONEY",
  "modeVentilation": "FIFO_AUTO", // "FIFO_AUTO" ou "MANUELLE"
  "referencePaiement": "OM-SN-TX-554433",
  "note": "Acompte sur solde de septembre"
}
```

---

## 🏢 8. Emplacements, Utilisateurs & Décisionnel

### 8.1 Boutiques & Emplacements (`/locations`)
* `GET /locations` : Liste de tous les magasins et entrepôts.
* `GET /locations/:id` : Détails d'une boutique avec liste de ses vendeurs rattachés.
* `POST /locations` *(OWNER)* : Création d'une nouvelle succursale.
* `PATCH /locations/:id` *(OWNER)* : Modification des coordonnées.
* `PATCH /locations/:id/toggle-status` *(OWNER)* : Activation / suspension.

### 8.2 Utilisateurs & Invitations (`/users`) *(Réservé OWNER)*
* `GET /users` : Liste paginée des collaborateurs (`search`, `role`, `locationId`).
* `POST /users/invite` : Création et invitation d'un collaborateur (génère un token SHA-256 transmis par SMS/Email).
* `POST /users/:id/resend-invite` : Réémission d'une invitation expirée.
* `PATCH /users/:id` : Changement de rôle ou de boutique assignée.
* `PATCH /users/:id/toggle-status` : Suspension immédiate du compte.

### 8.3 Tableaux de Bord & Indicateurs Décisionnels (`/analytics`)
* `GET /analytics/kpis` : Synthèse exécutive (CA, encours créances, trésorerie, panier moyen, métrage vendu, variations N vs N-1).
* `GET /analytics/tendances-ventes` : Séries chronologiques par jour, semaine ou mois.
* `GET /analytics/top-tissus` : Palmarès des tissus les plus performants en valeur et volume.
* `GET /analytics/categories-repartition` : Répartition du CA par famille textile (camembert).
* `GET /analytics/benchmark-boutiques` *(OWNER)* : Comparatif de performance entre boutiques.
* `GET /analytics/balance-agee-creances` : Échéancier comptable (<30j, 30-60j, 60-90j, >90j).
* `GET /analytics/sante-stocks` : Valorisation globale du stock, taux de rotation, alertes de rupture.

### 8.4 Notifications Métier (`/notifications`)
* `GET /notifications` : Flux des alertes (stocks bas, transferts reçus, échéances de créance).
* `PATCH /notifications/:id/lire` : Marquer une alerte comme lue.
* `PATCH /notifications/tout-lire` : Tout acquitter d'un clic.

### 8.5 Téléversement Médias & Photos Cloudflare R2 (`/media`)
* `POST /media/upload-tissu` *(OWNER, `multipart/form-data`)* :
  - Champ : `file` (JPEG, PNG, WebP, max 5 Mo).
  - Traitement automatique backend : conversion WebP 80%, redimensionnement 1200px max, upload sur Cloudflare R2, retourne l'URL publique CDN et la miniature.

---

## 🛠️ 9. Guide de Transition : Du Mock Store vers l'API Vivante

Le frontend utilise actuellement le store Zustand [`frontend/src/data/useMockStore.ts`](./src/data/useMockStore.ts) alimenté par [`frontend/src/data/mock.ts`](./src/data/mock.ts).
Tous les modèles de données, identifiants (UUID v4) et actions du mock store ont été alignés à 100% avec les DTOs backend.

### 9.1 Stratégie Recommandée (TanStack Query)
Pour brancher les composants sans casser l'interface, nous recommandons de créer des custom hooks TanStack Query dans un dossier `frontend/src/services/` qui appellent l'instance Axios [`frontend/src/api/api.ts`](./src/api/api.ts).

#### Exemple : Service Produits (`frontend/src/services/productService.ts`)
```typescript
import { API } from '@/api/api';

export interface QueryProduitsParams {
  page?: number;
  limit?: number;
  search?: string;
  categorieId?: string;
  locationId?: string;
}

export const productService = {
  getProduits: async (params?: QueryProduitsParams) => {
    const { data } = await API.get('/produits', { params });
    return data;
  },

  getProduitById: async (id: string, locationId?: string) => {
    const { data } = await API.get(`/produits/${id}`, { params: { locationId } });
    return data;
  },

  calculateConversion: async (id: string, payload: { longueurMetres?: number; poidsKg?: number; nombreRouleaux?: number }) => {
    const { data } = await API.post(`/produits/${id}/conversion`, payload);
    return data;
  },
};
```

#### Exemple : Custom Hook React Query (`frontend/src/hooks/useProducts.ts`)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { productService, QueryProduitsParams } from '@/services/productService';

export function useProducts(params?: QueryProduitsParams) {
  return useQuery({
    queryKey: ['produits', params],
    queryFn: () => productService.getProduits(params),
  });
}

export function useProductConversion(produitId: string) {
  return useMutation({
    mutationFn: (payload: { longueurMetres?: number; poidsKg?: number; nombreRouleaux?: number }) =>
      productService.calculateConversion(produitId, payload),
  });
}
```

#### Exemple : Enregistrement de Vente (`frontend/src/services/saleService.ts`)
```typescript
import { API } from '@/api/api';

export const saleService = {
  createSale: async (payload: any) => {
    const idempotencyKey = crypto.randomUUID();
    const { data } = await API.post('/ventes', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return data;
  },
};
```

---

## 💡 10. Bonnes Pratiques & Check-List pour le Développeur Intégrateur

1. **UUID v4 Obligatoire :** Ne jamais transmettre de préfixes arbitraires (ex: `'b1'` ou `'p-wax'`). Tous les IDs de l'application sont validés par NestJS via `ParseUUIDPipe` ou `@IsUUID('4')`.
2. **Idempotence sur les Écritures Sensibles :** Toujours générer un en-tête `Idempotency-Key: crypto.randomUUID()` lors des soumissions de vente (`POST /ventes`) et de règlement (`POST /reglements`). Cela protège les caissiers contre les doubles facturations lors des déconnexions réseau.
3. **Périmètre Boutiquier :** Pour les utilisateurs avec le rôle `BOUTIQUIER`, ne pas forcer de `locationId` dans les requêtes de stock ou de vente : le serveur injecte automatiquement leur boutique rattachée à partir du token JWT.
4. **Gestion du Cache & Invalidation :** Après une vente (`POST /ventes`), toujours invalider les requêtes `['stocks']` et `['ventes']` pour rafraîchir instantanément les compteurs de métrages et le chiffre d'affaires.
5. **Swagger Interactif :** En cas de doute sur un champ optionnel ou un type d'énumération, consulter `http://localhost:3000/api/v1/docs` lorsque le serveur local tourne.
