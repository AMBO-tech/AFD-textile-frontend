# 📚 Spécification Complète de l'API REST — AFD-Textile

Documentation exhaustive de référence pour l'équipe Frontend et les intégrations tierces.
Toutes les routes, paramètres, en-têtes, corps de requêtes JSON, réponses et codes d'erreur y sont détaillés.

---

## 🌐 1. Conventions Générales & Configuration

### URLs de Base
* **Développement :** `http://localhost:3000/api/v1` (ou `http://localhost:8000/api/v1`)
* **Production :** `https://api.ambotech.sn/api/v1`

### En-têtes HTTP Standards
| Header | Description | Requis |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` (ou `multipart/form-data` pour upload) | Oui |
| `Accept` | `application/json` | Oui |
| `Authorization` | `Bearer <access_token_jwt>` | Oui (sauf routes `@Public`) |
| `Idempotency-Key` | Chaîne unique UUID/Dexie pour éviter les doubles écritures | Optionnel (Recommandé sur `POST /ventes`, `POST /reglements`) |

### Rôles Utilisateurs (`Role`)
* `OWNER` : Propriétaire du réseau (accès total multi-boutiques, administration, audit, inventaire, réassort).
* `BOUTIQUIER` : Vendeur / Caissier en boutique (portée limitée à sa boutique assignée).

### Format Standard de Pagination
Les requêtes de liste acceptent généralement les paramètres suivants :
```typescript
{
  "page": 1,        // Numéro de page (défaut: 1)
  "limit": 20,      // Nombre d'éléments par page (défaut: 20, max: 100)
  "search": "bazin" // Recherche textuelle libre
}
```

Format de réponse paginée standard :
```json
{
  "data": [ /* liste des éléments */ ],
  "meta": {
    "total": 125,
    "page": 1,
    "limit": 20,
    "totalPages": 7
  }
}
```

---

## 🔐 2. Authentification & Sessions (`/auth`)

### 2.1. Connexion unifiée (Mot de passe)
* **Route :** `POST /api/v1/auth/login`
* **Accès :** Public
* **Description :** Connexion via numéro de téléphone sénégalais ou email + mot de passe.

#### Corps de Requête (Request Body)
```json
{
  "identifier": "+221770000001", // string (Email ou Téléphone avec indicatif)
  "password": "Password123!"     // string (min 8 car.)
}
```

#### Réponse Succès (`200 OK`)
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refreshToken": "d7a8f9c2e1b4a3...",
  "expiresIn": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "nom": "Moussa Diop",
    "telephone": "+221770000001",
    "email": "moussa@afd-textile.sn",
    "role": "BOUTIQUIER",
    "locationId": "550e8400-e29b-41d4-a716-446655440002",
    "locationNom": "Boutique Sandaga Principal",
    "premiereConnexion": false
  }
}
```

#### Erreurs Possibles
* `400 Bad Request` : Identifiant ou mot de passe manquant/mal formaté.
* `401 Unauthorized` : Identifiants incorrects ou compte inactif.

---

### 2.2. Demande de code OTP (Connexion sans mot de passe / Récupération)
* **Route :** `POST /api/v1/auth/otp/send`
* **Accès :** Public
* **Description :** Envoie un code à 6 chiffres par SMS ou Email (valable 5 minutes).

#### Corps de Requête
```json
{
  "identifier": "+221770000001" // string (Téléphone ou Email)
}
```

#### Réponse Succès (`200 OK`)
```json
{
  "success": true,
  "message": "Un code de connexion à 6 chiffres a été envoyé par SMS au +221770000001.",
  "channel": "SMS"
}
```

---

### 2.3. Vérification du code OTP
* **Route :** `POST /api/v1/auth/otp/verify`
* **Accès :** Public
* **Description :** Vérifie le code à 6 chiffres et délivre la paire de tokens JWT.

#### Corps de Requête
```json
{
  "identifier": "+221770000001",
  "code": "849201" // string (exactement 6 chiffres)
}
```

#### Réponse Succès (`200 OK`) : Structure identique à `2.1 Login`.
#### Erreurs Possibles
* `400 Bad Request` : Code OTP invalide ou expiré (> 5 min).

---

### 2.4. Activation du compte via lien magique (Première connexion)
* **Route :** `POST /api/v1/auth/setup-password`
* **Accès :** Public
* **Description :** Définit le mot de passe initial grâce au token d'invitation SHA-256 reçu par SMS/Email.

#### Corps de Requête
```json
{
  "token": "invitation_token_hash_hex_string",
  "password": "NouveauPassword123!"
}
```

#### Réponse Succès (`200 OK`) : Structure identique à `2.1 Login`.

---

### 2.5. Rafraîchissement des tokens (Rotation JWT)
* **Route :** `POST /api/v1/auth/refresh`
* **Accès :** Public
* **Description :** Renouvelle l'Access Token expiré via le Refresh Token.

#### Corps de Requête
```json
{
  "refreshToken": "d7a8f9c2e1b4a3..."
}
```

#### Réponse Succès (`200 OK`) : Paire de nouveaux tokens `{ accessToken, refreshToken, expiresIn, user }`.

---

### 2.6. Profil de l'utilisateur connecté
* **Route :** `GET /api/v1/auth/me`
* **Accès :** `JWT-auth` (Tous les rôles)

#### Réponse Succès (`200 OK`)
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "nom": "Moussa Diop",
    "telephone": "+221770000001",
    "email": "moussa@afd-textile.sn",
    "role": "BOUTIQUIER",
    "locationId": "550e8400-e29b-41d4-a716-446655440002",
    "locationNom": "Boutique Sandaga Principal"
  }
}
```

---

### 2.7. Déconnexion
* **Route :** `POST /api/v1/auth/logout`
* **Accès :** `JWT-auth`
* **Corps de Requête :** `{ "refreshToken": "string" }` (optionnel)
* **Réponse Succès (`200 OK`) :** `{ "success": true, "message": "Déconnexion réussie." }`

---

## 👥 3. Clients & Créances (`/clients`)

### 3.1. Liste paginée et recherche des clients
* **Route :** `GET /api/v1/clients`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Query Parameters :**
  - `search` (optionnel) : Recherche par nom, téléphone, entreprise.
  - `statut` (optionnel) : `'ACTIF'` | `'INACTIF'`.
  - `avecDetteSeulement` (optionnel, boolean) : `true` pour lister uniquement les clients ayant un solde débiteur > 0.
  - `page` (défaut: 1), `limit` (défaut: 20).

#### Réponse Succès (`200 OK`)
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nom": "Amadou Diallo",
      "telephone": "+221771234567",
      "entreprise": "Atelier Couture Élite",
      "adresse": "Marché HLM, Dakar",
      "notes": "Client fidèle, règle chaque samedi",
      "statut": "ACTIF",
      "totalDu": 450000,
      "nombreFacturesImpayees": 2,
      "createdAt": "2026-09-01T10:00:00.000Z",
      "updatedAt": "2026-09-12T15:30:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### 3.2. Création d'un client
* **Route :** `POST /api/v1/clients`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)

#### Corps de Requête
```json
{
  "nom": "Fatou Bintou Sow",       // Requis
  "telephone": "+221782223344",    // Optionnel
  "entreprise": "Sow Confection",  // Optionnel
  "adresse": "Sandaga, Dakar",     // Optionnel
  "notes": "Commande des rouleaux de soie" // Optionnel
}
```

#### Réponse Succès (`201 Created`)
Retourne l'objet `Client` créé.

---

### 3.3. Détails d'un client et solde comptable
* **Route :** `GET /api/v1/clients/:id`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Path Param :** `id` (UUID du client)

#### Réponse Succès (`200 OK`)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nom": "Amadou Diallo",
  "telephone": "+221771234567",
  "entreprise": "Atelier Couture Élite",
  "adresse": "Marché HLM, Dakar",
  "notes": "Client fidèle",
  "statut": "ACTIF",
  "totalAchats": 2500000,
  "totalPaye": 2050000,
  "totalDu": 450000,
  "nombreFactures": 12,
  "nombreFacturesImpayees": 2,
  "createdAt": "2026-09-01T10:00:00.000Z",
  "updatedAt": "2026-09-12T15:30:00.000Z"
}
```

---

### 3.4. Relevé des créances et factures impayées (FIFO)
* **Route :** `GET /api/v1/clients/:id/creances`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Description :** Utilisé pour la ventilation financière et la relance des créances.

#### Réponse Succès (`200 OK`)
```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "clientNom": "Amadou Diallo",
  "clientTelephone": "+221771234567",
  "totalSoldeDu": 450000,
  "nombreFacturesImpayees": 2,
  "facturesImpayees": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "referenceFacture": "FAC-2026-09-0012",
      "boutiqueNom": "Boutique Sandaga Principal",
      "statut": "CONFIRMEE",
      "statutPaiement": "PARTIEL",
      "montantTotal": 300000,
      "montantPaye": 100000,
      "soldeDu": 200000,
      "dateEcheance": "2026-09-20T00:00:00.000Z",
      "createdAt": "2026-09-05T14:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "referenceFacture": "FAC-2026-09-0025",
      "boutiqueNom": "Boutique Sandaga Principal",
      "statut": "CONFIRMEE",
      "statutPaiement": "NON_PAYE",
      "montantTotal": 250000,
      "montantPaye": 0,
      "soldeDu": 250000,
      "dateEcheance": "2026-09-25T00:00:00.000Z",
      "createdAt": "2026-09-10T11:00:00.000Z"
    }
  ],
  "historiqueEncaissements": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440045",
      "referenceRecu": "REC-2026-09-0010",
      "montantTotal": 100000,
      "modePaiement": "WAVE",
      "referenceExterne": "WAV-TX-998877",
      "dateEncaissement": "2026-09-05T15:00:00.000Z"
    }
  ]
}
```

---

### 3.5. Mise à jour d'un client
* **Route :** `PATCH /api/v1/clients/:id`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Corps de Requête :** `{ "nom": "...", "telephone": "...", "adresse": "...", "notes": "..." }`

---

### 3.6. Archivage d'un client
* **Route :** `DELETE /api/v1/clients/:id`
* **Accès :** `JWT-auth` (`OWNER` uniquement)
* **Description :** Bascule le statut à `INACTIF` sans supprimer l'historique de factures.

---

## 🧵 4. Produits & Catalogue Textile (`/produits`)

### 4.1. Liste des Catégories de Tissus
* **Route :** `GET /api/v1/produits/categories`
* **Accès :** Public

#### Réponse Succès (`200 OK`)
```json
[
  { "id": "uuid-1", "code": "WAX", "nom": "Wax Hollandais & Africain", "description": "Tissus imprimés 100% coton" },
  { "id": "uuid-2", "code": "BAZIN", "nom": "Getzner & Bazin Riche", "description": "Bazin teinté et blanc haute qualité" },
  { "id": "uuid-3", "code": "SOIE", "nom": "Soie & Mousseline", "description": "Tissus fluides et habillés" },
  { "id": "uuid-4", "code": "DENTELLE", "nom": "Dentelle & Guipure", "description": "Broderies et dentelles de fête" }
]
```

---

### 4.2. Liste des Unités de Mesure
* **Route :** `GET /api/v1/produits/unites`
* **Accès :** Public
* **Réponse Succès (`200 OK`) :** `[ { "id": "uuid", "code": "METRE", "nom": "Mètre linéaire" }, ... ]`

---

### 4.3. Recherche et catalogue paginé
* **Route :** `GET /api/v1/produits`
* **Accès :** Public
* **Query Parameters :**
  - `search` : Recherche textuelle (nom, référence, motif, couleur).
  - `categorieId` : Filtrer par famille de tissus.
  - `uniteStockage` : `'METRE'` | `'KG'` | `'ROULEAU'`.
  - `statut` : `'ACTIF'` | `'INACTIF'` (défaut: `ACTIF`).
  - `locationId` : Si fourni, inclut le champ `quantiteEnStock` pour cette boutique/entrepôt.
  - `page`, `limit`.

#### Réponse Succès (`200 OK`)
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440099",
      "reference": "WAX-HOL-001",
      "nom": "Wax Hollandais Vlisco Super-Wax",
      "categorie": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "code": "WAX",
        "nom": "Wax Hollandais & Africain"
      },
      "couleur": "Bleu Roi & Or",
      "motif": "Fleurs Sauvages",
      "photoUrl": "https://media.ambotech.sn/fabrics/wax-001.webp",
      "uniteStockage": "METRE",
      "unitePrincipale": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "code": "METRE",
        "nom": "Mètre linéaire"
      },
      "prixIndicatif": 7500,
      "prixMinimum": 6500,
      "longueurRouleauMetres": 5.48,
      "poidsAuMetreKg": 0.25,
      "statut": "ACTIF",
      "quantiteEnStock": 124.5,
      "createdAt": "2026-09-11T08:00:00.000Z",
      "updatedAt": "2026-09-11T08:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 4.4. Recherche par référence exacte (Code-barres / Scanner)
* **Route :** `GET /api/v1/produits/reference/:ref`
* **Accès :** Public
* **Exemple :** `GET /api/v1/produits/reference/WAX-HOL-001`

---

### 4.5. Création d'un tissu
* **Route :** `POST /api/v1/produits`
* **Accès :** `JWT-auth` (`OWNER` uniquement)

#### Corps de Requête
```json
{
  "reference": "BAZ-GETZ-002",
  "nom": "Bazin Riche Getzner Teinté Indigo",
  "categorieId": "550e8400-e29b-41d4-a716-446655440000",
  "unitePrincipaleId": "550e8400-e29b-41d4-a716-446655440001",
  "uniteStockage": "METRE",
  "couleur": "Indigo",
  "motif": "Brillant Uni",
  "photoUrl": "https://media.ambotech.sn/fabrics/getz-002.webp",
  "prixIndicatif": 12000,
  "prixMinimum": 10500,
  "longueurRouleauMetres": 10.0,
  "poidsAuMetreKg": 0.35
}
```

---

### 4.6. Moteur de Simulation de Conversion Textile (Panier & Balance)
* **Route :** `POST /api/v1/produits/:id/conversion`
* **Accès :** Public
* **Description :** Convertit automatiquement un poids pesé sur la balance en métrage équivalent ou calcule le prix d'un rouleau complet.

#### Corps de Requête
```json
{
  "quantite": 2.5,
  "uniteSaisie": "KG", // 'METRE' | 'KG' | 'ROULEAU'
  "prixUnitaireSouhaite": 12000
}
```

#### Réponse Succès (`200 OK`)
```json
{
  "produitId": "550e8400-e29b-41d4-a716-446655440099",
  "quantiteSaisie": 2.5,
  "uniteSaisie": "KG",
  "metresEquivalents": 7.14,
  "prixTotalCalcule": 85680,
  "prixMinimumRespecte": true,
  "alertePrixPlancher": null
}
```

---

## 📦 5. Stocks & Mouvements Physiques (`/stocks`)

### 5.1. Consultation des Niveaux de Stock
* **Route :** `GET /api/v1/stocks/niveaux`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER` - *automatiquement restreint à sa boutique si Boutiquier*)
* **Query Parameters :**
  - `locationId` : Filtrer par emplacement (Boutique Sandaga, Entrepôt Central...).
  - `categorieId` : Filtrer par catégorie de tissu.
  - `enAlerteSeulement` (boolean) : `true` pour n'afficher que les articles sous le seuil d'alerte.
  - `page`, `limit`.

#### Réponse Succès (`200 OK`)
```json
{
  "data": [
    {
      "id": "stock-uuid-1",
      "produitId": "550e8400-e29b-41d4-a716-446655440099",
      "produitNom": "Super Bazin Riche Getzner Blanc",
      "produitReference": "BAZ-GETZ-001",
      "produitPhotoUrl": "https://media.ambotech.sn/fabrics/baz-001.webp",
      "uniteStockage": "METRE",
      "locationId": "550e8400-e29b-41d4-a716-446655440002",
      "locationNom": "Boutique Sandaga Principal",
      "locationType": "BOUTIQUE",
      "quantite": 8.5,
      "estEnAlerte": true,
      "updatedAt": "2026-09-12T10:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### 5.2. Journal des Mouvements de Stock (Traçabilité Immuable)
* **Route :** `GET /api/v1/stocks/mouvements`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Query Parameters :** `produitId`, `locationId`, `type` (`ENTREE_MANUELLE`, `VENTE`, `TRANSFERT`, `AJUSTEMENT`, `RETOUR`, `PERTE`, `ANNULATION`), `dateDebut`, `dateFin`.

---

### 5.3. Exécution d'un Mouvement Direct (Arrivage Conteneur / Perte)
* **Route :** `POST /api/v1/stocks/mouvements`
* **Accès :** `JWT-auth` (`OWNER` uniquement)

#### Corps de Requête
```json
{
  "type": "ENTREE_MANUELLE",
  "sens": "ENTREE",
  "produitId": "550e8400-e29b-41d4-a716-446655440099",
  "locationId": "550e8400-e29b-41d4-a716-446655440002",
  "quantite": 500.0,
  "uniteUtilisee": "METRE",
  "justification": "Réception Conteneur C-2026-09 Vlisco"
}
```

---

### 5.4. Régularisation d'Inventaire Physique (Ajustement)
* **Route :** `POST /api/v1/stocks/ajustement`
* **Accès :** `JWT-auth` (`OWNER` uniquement)

#### Corps de Requête
```json
{
  "produitId": "550e8400-e29b-41d4-a716-446655440099",
  "locationId": "550e8400-e29b-41d4-a716-446655440002",
  "quantiteAjustement": 2.5,
  "sens": "SORTIE", // 'ENTREE' ou 'SORTIE'
  "justification": "Écart constaté lors du comptage physique du samedi (chutes abîmées)"
}
```

---

### 5.5. Transferts & Réapprovisionnements inter-boutiques

#### Lister les transferts
* `GET /api/v1/stocks/transferts` (Query: `statut`, `locationId`, `page`, `limit`)

#### Initier une demande de transfert (Boutiquier ou Owner)
* `POST /api/v1/stocks/transferts/demande`
```json
{
  "locationSourceId": "uuid-entrepot-central", // Optionnel à la demande
  "locationDestinationId": "uuid-boutique-sandaga",
  "lignes": [
    {
      "produitId": "550e8400-e29b-41d4-a716-446655440099",
      "quantite": 50.0,
      "unite": "METRE"
    }
  ]
}
```

#### Valider et déstocker le transfert (Owner uniquement)
* `POST /api/v1/stocks/transferts/:id/valider`
* Corps optionnel : `{ "locationSourceId": "uuid-entrepot-source" }`

#### Annuler un transfert
* `POST /api/v1/stocks/transferts/:id/annuler`
* Corps : `{ "motif": "Rupture de stock à l'entrepôt" }`

---

## 🧾 6. Ventes & Facturation Commerciale (`/ventes`)

### 6.1. Créer une Facture de Vente (Comptoir ou Crédit Client)
* **Route :** `POST /api/v1/ventes`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Description :** 
  - Décrémente le stock physique en temps réel avec verrouillage pessimiste SQL.
  - Enregistre le paiement initial éventuel (comptoir).
  - Génère la référence facture `FAC-YYYY-MM-XXXX`.

#### Corps de Requête
```json
{
  "boutiqueId": "550e8400-e29b-41d4-a716-446655440002", // Optionnel si Boutiquier (déduit du token)
  "clientId": "550e8400-e29b-41d4-a716-446655440000",   // Optionnel pour vente anonyme au comptoir
  "lignes": [
    {
      "produitId": "550e8400-e29b-41d4-a716-446655440099",
      "quantite": 6.0,
      "uniteSaisie": "METRE",
      "longueurDecoupeMetres": 6.0,
      "prixUnitaireApplique": 7500,
      "remiseMontant": 0
    },
    {
      "produitId": "550e8400-e29b-41d4-a716-446655440098",
      "quantite": 1.0,
      "uniteSaisie": "ROULEAU",
      "longueurDecoupeMetres": 10.0,
      "prixUnitaireApplique": 110000,
      "remiseMontant": 5000
    }
  ],
  "paiementInitial": {
    "montant": 100000,
    "modePaiement": "WAVE", // 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT' | 'CHEQUE'
    "referenceExterne": "WAV-TX-849204"
  },
  "dateEcheance": "2026-10-15T00:00:00.000Z", // Requis si soldeDu > 0 et client identifié
  "idempotencyKey": "dexie-tx-uuid-local"
}
```

#### Réponse Succès (`201 Created`)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "referenceFacture": "FAC-2026-09-0015",
  "boutiqueId": "550e8400-e29b-41d4-a716-446655440002",
  "boutiqueNom": "Boutique Sandaga Principal",
  "vendeurId": "550e8400-e29b-41d4-a716-446655440001",
  "vendeurNom": "Moussa Diop",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "clientNom": "Amadou Diallo",
  "clientTelephone": "+221771234567",
  "statut": "CONFIRMEE",
  "statutPaiement": "PARTIEL",
  "montantTotal": 150000,
  "montantPaye": 100000,
  "soldeDu": 50000,
  "dateEcheance": "2026-10-15T00:00:00.000Z",
  "synchronisationStatus": "SYNCHRONISE",
  "lignes": [
    {
      "id": "ligne-1",
      "produitId": "550e8400-e29b-41d4-a716-446655440099",
      "produitNom": "Wax Hollandais Vlisco Super-Wax",
      "produitReference": "WAX-HOL-001",
      "quantite": 6.0,
      "uniteSaisie": "METRE",
      "longueurDecoupeMetres": 6.0,
      "prixUnitaireApplique": 7500,
      "remiseMontant": 0,
      "totalLigne": 45000
    },
    {
      "id": "ligne-2",
      "produitId": "550e8400-e29b-41d4-a716-446655440098",
      "produitNom": "Bazin Riche Getzner Blanc",
      "produitReference": "BAZ-GETZ-001",
      "quantite": 1.0,
      "uniteSaisie": "ROULEAU",
      "longueurDecoupeMetres": 10.0,
      "prixUnitaireApplique": 110000,
      "remiseMontant": 5000,
      "totalLigne": 105000
    }
  ],
  "createdAt": "2026-09-13T16:00:00.000Z",
  "updatedAt": "2026-09-13T16:00:00.000Z"
}
```

---

### 6.2. Liste des Factures de Vente
* **Route :** `GET /api/v1/ventes`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Query Parameters :** `boutiqueId`, `clientId`, `vendeurId`, `statut` (`CONFIRMEE`, `ANNULEE`), `statutPaiement` (`NON_PAYE`, `PARTIEL`, `SOLDE`), `dateDebut`, `dateFin`, `page`, `limit`.

---

### 6.3. Détails d'une Facture
* **Route :** `GET /api/v1/ventes/:id`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)

---

### 6.4. Annuler une Facture de Vente
* **Route :** `POST /api/v1/ventes/:id/annuler`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Description :** Réintègre immédiatement les métrages en stock et génère un bon de remboursement pour les sommes déjà encaissées.

#### Corps de Requête
```json
{
  "motif": "Erreur de métrage saisie par le client"
}
```

---

### 6.5. Synchronisation par Lot des Ventes Hors-Ligne (PWA Dexie.js)
* **Route :** `POST /api/v1/ventes/sync-offline`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)

#### Corps de Requête
```json
{
  "ventes": [
    { /* Objet CreateSaleDto avec idempotencyKey */ },
    { /* Objet CreateSaleDto avec idempotencyKey */ }
  ]
}
```

#### Réponse Succès (`200 OK`)
```json
{
  "total": 2,
  "reussies": 2,
  "echecs": 0,
  "details": [
    {
      "status": "SUCCESS",
      "idempotencyKey": "dexie-tx-1",
      "referenceFacture": "FAC-2026-09-0016",
      "data": { /* VenteResponseDto */ }
    }
  ]
}
```

---

## 💰 7. Règlements & Caisse (`/reglements`)

### 7.1. Enregistrer un Encaissement Client (Règlement de Créance)
* **Route :** `POST /api/v1/reglements`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Description :** Encaissement d'un montant pour solder une ou plusieurs factures selon la ventilation FIFO automatique ou manuelle.

#### Corps de Requête (Ventilation FIFO Automatique)
```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "montantTotal": 150000,
  "modePaiement": "ORANGE_MONEY", // 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT' | 'CHEQUE'
  "referenceExterne": "OM-TX-492019",
  "modeVentilation": "FIFO_AUTO"
}
```

#### Corps de Requête (Ventilation Manuelle)
```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "montantTotal": 150000,
  "modePaiement": "ESPECES",
  "modeVentilation": "MANUELLE",
  "ventilationsManuelles": [
    { "venteId": "uuid-facture-1", "montant": 100000 },
    { "venteId": "uuid-facture-2", "montant": 50000 }
  ]
}
```

#### Réponse Succès (`201 Created`)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "referenceRecu": "REC-2026-09-0022",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "clientNom": "Amadou Diallo",
  "boutiqueId": "550e8400-e29b-41d4-a716-446655440002",
  "boutiqueNom": "Boutique Sandaga Principal",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "userNom": "Moussa Diop",
  "montantTotal": 150000,
  "modePaiement": "ORANGE_MONEY",
  "referenceExterne": "OM-TX-492019",
  "modeVentilation": "FIFO_AUTO",
  "statut": "VALIDE",
  "dateEncaissement": "2026-09-13T16:30:00.000Z",
  "ventilations": [
    {
      "id": "vent-1",
      "venteId": "uuid-facture-1",
      "referenceFacture": "FAC-2026-09-0012",
      "montantImpute": 150000,
      "createdAt": "2026-09-13T16:30:00.000Z"
    }
  ],
  "createdAt": "2026-09-13T16:30:00.000Z"
}
```

---

### 7.2. Arrêté & Bilan de Caisse Périodique
* **Route :** `GET /api/v1/reglements/bilan-caisse`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Query Parameters :** `boutiqueId`, `dateDebut`, `dateFin`.

#### Réponse Succès (`200 OK`)
```json
{
  "boutiqueId": "550e8400-e29b-41d4-a716-446655440002",
  "boutiqueNom": "Boutique Sandaga Principal",
  "dateDebut": "2026-09-13T00:00:00.000Z",
  "dateFin": "2026-09-13T23:59:59.999Z",
  "totalEncaissements": 1450000,
  "nombreTransactions": 18,
  "parModePaiement": [
    { "modePaiement": "ESPECES", "total": 650000, "nombreTransactions": 10 },
    { "modePaiement": "WAVE", "total": 500000, "nombreTransactions": 5 },
    { "modePaiement": "ORANGE_MONEY", "total": 300000, "nombreTransactions": 3 }
  ],
  "totalRemboursements": 25000,
  "soldeNetCaisseEspeces": 625000
}
```

---

### 7.3. Annuler un Reçu de Règlement
* **Route :** `POST /api/v1/reglements/:id/annuler`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Corps :** `{ "motif": "Chèque rejeté par la banque" }`

---

## 📅 8. Sessions Hebdomadaires du Lundi (`/sessions-hebdo`)

### 8.1. Bilan Consolidé de Session Hebdomadaire (Lundi Textile)
* **Route :** `GET /api/v1/sessions-hebdo/resume`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Query Parameters :** `annee` (ex: 2026), `numeroSemaine` (ex: 37), `boutiqueId` (optionnel).

#### Réponse Succès (`200 OK`)
```json
{
  "labelSemaine": "Semaine 37 (07/09/2026 - 13/09/2026)",
  "dateDebut": "2026-09-07T00:00:00.000Z",
  "dateFin": "2026-09-13T23:59:59.999Z",
  "numeroSemaine": 37,
  "annee": 2026,
  "chiffreAffaires": 4200000,
  "montantEncaisse": 3500000,
  "nouvellesCreances": 700000,
  "tauxRecouvrementPct": 83.33,
  "metresVendus": 680.5,
  "nombreVentes": 88,
  "topVentesSemaine": [
    {
      "produitNom": "Super Bazin Riche Getzner Blanc",
      "reference": "BAZ-GETZ-001",
      "metresVendus": 125.0,
      "chiffreAffaires": 1250000
    }
  ],
  "creancesPrioritaires": [
    {
      "clientId": "client-uuid-1",
      "clientNom": "Amadou Diallo",
      "clientTelephone": "+221771234567",
      "totalDu": 450000,
      "joursAncienneteMax": 42
    }
  ],
  "reapprovisionnementsUrgents": 3,
  "dateGeneration": "2026-09-14T06:00:00.000Z"
}
```

---

### 8.2. Suggestions de Réapprovisionnement de Stock
* **Route :** `GET /api/v1/sessions-hebdo/reappro-suggestions`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)

#### Réponse Succès (`200 OK`)
```json
{
  "totalSuggestions": 5,
  "nombreUrgentes": 2,
  "suggestions": [
    {
      "produitId": "550e8400-e29b-41d4-a716-446655440099",
      "produitNom": "Super Bazin Riche Getzner Blanc",
      "produitReference": "BAZ-GETZ-001",
      "categorieNom": "Getzner & Bazin Riche",
      "boutiqueId": "uuid-boutique-sandaga",
      "boutiqueNom": "Boutique Sandaga Principal",
      "stockActuelBoutique": 3.5,
      "seuilAlerte": 15.0,
      "stockDisponibleEntrepot": 120.0,
      "quantiteSuggereeTransfert": 30.0,
      "unite": "METRE",
      "priorite": "URGENT",
      "entrepotSourceId": "uuid-entrepot-central",
      "entrepotSourceNom": "Entrepôt Central Bel-Air"
    }
  ]
}
```

---

### 8.3. Déclencher Manuellement la Session du Lundi
* **Route :** `POST /api/v1/sessions-hebdo/declencher`
* **Accès :** `JWT-auth` (`OWNER` uniquement)
* **Corps :** `{ "annee": 2026, "numeroSemaine": 37 }`

---

## 📊 9. Tableau de Bord & Analytics (`/analytics`)

Toutes les routes de ce module acceptent les filtres : `boutiqueId`, `dateDebut`, `dateFin`, `periodePredefinie` (`'aujourdhui'` | `'cette_semaine'` | `'ce_mois'` | `'ce_trimestre'` | `'cette_annee'`).

### 9.1. KPIs Exécutifs (avec N vs N-1)
* **Route :** `GET /api/v1/analytics/kpis`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Indicateurs retournés :** `caFactureNet`, `variationCaFactureNetPct`, `caEncaisse`, `variationCaEncaissePct`, `soldeCreancesEnAttente`, `tauxRecouvrementPct`, `panierMoyen`, `metresLineairesVendus`, `valeurStockDisponible`.

---

### 9.2. Tendances Chronologiques des Ventes
* **Route :** `GET /api/v1/analytics/tendances-ventes`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Réponse :** Liste chronologique avec points pour graphiques Recharts `{ date, label, caFacture, caEncaisse, nombreVentes }`.

---

### 9.3. Palmarès des Tissus les Plus Performants
* **Route :** `GET /api/v1/analytics/top-tissus`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)

---

### 9.4. Répartition du CA par Catégorie de Tissu
* **Route :** `GET /api/v1/analytics/categories-repartition`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Réponse :** Camembert de parts de marché `{ categorieId, categorieNom, chiffreAffaires, pourcentageCa, metresVendus }`.

---

### 9.5. Benchmark Comparatif des Boutiques
* **Route :** `GET /api/v1/analytics/benchmark-boutiques`
* **Accès :** `JWT-auth` (`OWNER` uniquement)

---

### 9.6. Balance Âgée des Créances
* **Route :** `GET /api/v1/analytics/balance-agee-creances`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Réponse :**
```json
{
  "totalCreances": 2700000,
  "tranches": [
    { "tranche": "0-30 jours", "montantTotal": 1500000, "nombreFactures": 8, "nombreClients": 6 },
    { "tranche": "31-60 jours", "montantTotal": 800000, "nombreFactures": 4, "nombreClients": 3 },
    { "tranche": "61-90 jours", "montantTotal": 300000, "nombreFactures": 2, "nombreClients": 2 },
    { "tranche": "+90 jours", "montantTotal": 100000, "nombreFactures": 1, "nombreClients": 1 }
  ]
}
```

---

### 9.7. Diagnostic & Santé des Stocks
* **Route :** `GET /api/v1/analytics/sante-stocks`
* **Accès :** `JWT-auth` (`OWNER`, `BOUTIQUIER`)
* **Réponse :** Valeur marchande totale, références en alerte de réassort, ruptures, métrage total en stock.

---

## 🛡️ 10. Audit & Sécurité Immuable (`/audit`)

### 10.1. Liste des Traces d'Audit
* **Route :** `GET /api/v1/audit`
* **Accès :** `JWT-auth` (`OWNER` uniquement)
* **Query Parameters :** `utilisateurId`, `action`, `ressourceType`, `ressourceId`, `dateDebut`, `dateFin`, `page`, `limit`.

---

### 10.2. Détails d'un Événement d'Audit (Snapshots JSON Avant/Après)
* **Route :** `GET /api/v1/audit/:id`
* **Accès :** `JWT-auth` (`OWNER` uniquement)

#### Réponse Succès (`200 OK`)
```json
{
  "id": "audit-uuid-1",
  "utilisateurId": "user-uuid-1",
  "utilisateurNom": "Moussa Diop",
  "action": "VENTE_CONFIRMEE",
  "ressourceType": "VENTE",
  "ressourceId": "vente-uuid-1",
  "ancienneValeur": null,
  "nouvelleValeur": {
    "referenceFacture": "FAC-2026-09-0015",
    "montantTotal": 150000,
    "statutPaiement": "PARTIEL"
  },
  "createdAt": "2026-09-13T16:00:00.000Z"
}
```

---

## 🖼️ 11. Médias & Documents Cloudflare R2 (`/media`)

### 11.1. Téléversement & Optimisation WebP d'une Photo de Tissu
* **Route :** `POST /api/v1/media/upload-tissu`
* **Accès :** `JWT-auth` (`OWNER` uniquement)
* **Format :** `multipart/form-data`
* **Payload :** Champ `file` (Image JPEG/PNG/WebP, max 5 Mo).
* **Traitement serveur :** Redimensionnement max 1200px, conversion automatique en WebP qualité 80, génération de vignette.

#### Réponse Succès (`201 Created`)
```json
{
  "success": true,
  "url": "https://media.ambotech.sn/fabrics/550e8400-e29b-41d4-a716-446655440099.webp",
  "key": "fabrics/550e8400-e29b-41d4-a716-446655440099.webp",
  "size": 184520,
  "mimeType": "image/webp"
}
```

---

### 11.2. Téléversement d'un Document PDF
* **Route :** `POST /api/v1/media/upload-document`
* **Accès :** `JWT-auth` (`OWNER` uniquement)
* **Format :** `multipart/form-data`
* **Query Parameter :** `type` (`'reports'` | `'invoices'` | `'receipts'` | `'general'`).
* **Payload :** Champ `file` (Fichier PDF, max 10 Mo).

---

### 11.3. Suppression d'un Média sur Cloudflare R2
* **Route :** `DELETE /api/v1/media?key=fabrics/uuid.webp`
* **Accès :** `JWT-auth` (`OWNER` uniquement)

---

## 💓 12. Santé & Diagnostic (`/health`)

* **Route :** `GET /api/v1/health`
* **Accès :** Public
* **Description :** Vérifie la disponibilité du serveur et teste la connectivité PostgreSQL 16.

#### Réponse Succès (`200 OK`)
```json
{
  "status": "ok",
  "timestamp": "2026-09-13T22:20:00.000Z",
  "uptime": 3600.5,
  "environment": "development",
  "database": {
    "status": "connected",
    "provider": "postgresql"
  },
  "memory": {
    "rss": "45 MB",
    "heapUsed": "25 MB"
  }
}
```
