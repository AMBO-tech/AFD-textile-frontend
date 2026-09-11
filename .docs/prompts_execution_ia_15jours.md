# Playbook de Prompts IA — Référentiel des 52 Tâches ClickUp
## Prompts Prêts à l'Emploi pour Antigravity / Cursor / Claude 3.7 / Copilot

**Version : 4.0 (Exhaustive & Alignée à 100% sur les 52 Tâches ClickUp)**  
**Date : 11 septembre 2026**  
**Équipe : @Abdallah Diouf (Backend), @Mohamed Dieye Tine (Frontend), @El Hadji Boubacar Mbaye (Figma/UX)**  
**Stack : NestJS (Fastify) + Prisma ORM + PostgreSQL 16 | React PWA (Vite + TS + Tailwind/Shadcn + Dexie.js) | Cloudflare R2 | dexchange-sms | OVH & Vercel**

---

## Guide d'Utilisation
Chaque prompt ci-dessous est **totalement autonome et auto-suffisant**. Copiez-le directement dans la **description de la tâche ClickUp correspondante** ou injectez-le dans une session **Antigravity**.

---

# 🎨 GROUPE 1 : DESIGN ET ÉCRANS OWNER (FIGMA) — @El Hadji Boubacar Mbaye

### 🎯 Prompt : Concevoir le modal de remboursement de caisse
```text
Tu es un Lead UI/UX Designer expert Figma.
Conçois le modal de remboursement de caisse (responsive Mobile 390px & Desktop).

Éléments requis :
1. En-tête : "Annulation de Vente & Remboursement Client".
2. Rappel de la facture : Référence (ex: FAC-2026-09-00142), Nom du Client, Montant total encaissé en FCFA.
3. Sélecteur de mode de restitution : Espèces (Sortie tiroir-caisse), Wave, Orange Money, Virement bancaire.
4. Champ texte obligatoire : "Motif de l'annulation" (ex: Défaut tissu, Erreur métrage).
5. Avertissement caisse : "Ce montant sera déduit immédiatement du total espèces de la caisse journalière."
6. États du modal : Saisie nominale, Erreur de validation, Confirmation de succès.
```

---

### 🎯 Prompt : Concevoir le modal d’encaissement FIFO ou manuel
```text
Tu es un Lead UI/UX Designer expert Figma.
Conçois le modal d’encaissement des créances clients avec sélecteur de mode de ventilation (Mobile & Desktop).

Éléments requis :
1. Champ montant total versé en gros caractères FCFA + Sélecteur de moyen de paiement (Espèces, Wave, Orange Money, Chèque).
2. Calcul dynamique : Si montant reçu > solde dû, afficher bandeau vert "Monnaie à rendre : XX XXX FCFA".
3. Toggle Switch interactif :
   - Mode 1 : "Ventilation Automatique (FIFO)" (pré-ventilation sur les factures les plus anciennes).
   - Mode 2 : "Répartition Manuelle" (champs de saisie déverrouillés pour chaque facture impayée avec calcul du reste à imputer).
4. Écran de reçu de paiement validé partageable par WhatsApp/SMS.
```

---

### 🎯 Prompt : Concevoir l’écran de gestion des emplacements
```text
Tu es un Lead UI/UX Designer expert Figma.
Conçois l'écran de gestion des boutiques et entrepôts pour la console Owner Desktop.

Éléments requis :
1. Grille de cartes pour chaque emplacement : Type (Badge Entrepot / Boutique), Nom, Adresse, Téléphone, Nombre de vendeurs affectés, Statut (Actif/Inactif).
2. Modal "Créer / Modifier un Emplacement" : Champs Type, Nom, Adresse, Téléphone, Toggle Actif/Inactif.
3. États de l'écran : Chargement skeleton, Liste vide, Erreur API.
```

---

### 🎯 Prompt : Concevoir l’écran de gestion des utilisateurs et vendeurs
```text
Tu es un Lead UI/UX Designer expert Figma.
Conçois l'écran d'administration des utilisateurs pour la console Owner Desktop.

Éléments requis :
1. Tableau des utilisateurs : Avatar/Photo, Nom, Téléphone, Rôle (Owner / Boutiquier), Boutique assignée, Statut (Actif / En attente activation OTP / Inactif).
2. Modal "Ajouter un Boutiquier" : Nom, Téléphone, Sélecteur de Boutique obligatoire.
3. Menu d'actions : "Renvoyer code OTP SMS", "Changer de Boutique", "Désactiver le compte".
```

---

### 🎯 Prompt : Concevoir l’écran d’arbitrage des conflits offline
```text
Tu es un Lead UI/UX Designer expert Figma.
Conçois l'écran d'arbitrage des conflits de stock offline pour la console Owner Desktop.

Éléments requis :
1. Badge d'alerte en haut du dashboard : "⚠️ X ventes hors-ligne en conflit de stock".
2. Table des conflits : Référence Vente, Boutique, Vendeur, Tissu concerné, Quantité vendue hors-ligne, Manque de stock constaté.
3. Deux boutons d'action rapide par conflit :
   - Bouton Vert : "Régulariser par Ajustement Stock" (ouvre confirmation avec justification automatique).
   - Bouton Rouge : "Annuler la vente & Rembourser" (ouvre le modal de remboursement).
```

---

# 📱 GROUPE 2 : PAGES ET MODALS OWNER (FRONTEND) — @Mohamed Dieye Tine

### 🎯 Prompt : Développer la page de gestion des emplacements
```text
Tu es un Développeur Frontend React / Tailwind / Shadcn.
Développe la page `src/pages/owner/LocationsScreen.tsx` connectée au backend `LocationsModule`.

Spécifications :
1. Affichage en cartes des boutiques et entrepôts avec données TanStack Query (`GET /api/v1/locations`).
2. Modal de création / édition avec React Hook Form et Zod (`POST /api/v1/locations` et `PATCH /api/v1/locations/:id`).
3. Bouton toggle pour activer/désactiver un emplacement avec confirmation.

Fournis le code React TypeScript complet.
```

---

### 🎯 Prompt : Développer la page de gestion des utilisateurs
```text
Tu es un Développeur Frontend React / Tailwind / Shadcn.
Développe la page `src/pages/owner/UsersScreen.tsx` pour administrer les vendeurs et propriétaires.

Spécifications :
1. Table des utilisateurs connectée à `GET /api/v1/users`.
2. Modal d'ajout boutiquier avec sélection obligatoire de la boutique (`POST /api/v1/users`).
3. Actions rapides :
   - Renvoyer OTP SMS (`POST /api/v1/users/:id/resend-otp`).
   - Réassigner boutique (`PATCH /api/v1/users/:id`).
   - Désactiver le compte (`DELETE /api/v1/users/:id` - soft delete).

Fournis le code React TypeScript complet.
```

---

### 🎯 Prompt : Développer la page d’arbitrage des conflits offline
```text
Tu es un Développeur Frontend React / Tailwind.
Développe la page `src/pages/owner/ConflictsScreen.tsx` pour permettre à l'Owner de résoudre les conflits d'inventaire.

Spécifications :
1. Table des ventes en statut `CONFLICT_STOCK`.
2. Action "Régulariser" : Appel `POST /api/v1/sync/conflicts/:id/arbitrer` avec `{ action: 'REGULARISE' }`.
3. Action "Annuler & Rembourser" : Ouvre `RefundModal` puis appelle `{ action: 'CANCEL_REFUND', motif: string, modeRemboursement: string }`.

Fournis le composant React complet.
```

---

### 🎯 Prompt : Développer le modal de remboursement de vente
```text
Tu es un Développeur Frontend React / Tailwind.
Développe le composant `src/components/pos/RefundModal.tsx` pour l'annulation de vente et la sortie de caisse.

Spécifications :
1. Props : `venteId: string`, `referenceFacture: string`, `montantPaye: number`, `onSuccess: () => void`, `onClose: () => void`.
2. Formulaire avec mode de restitution (Espèces, Wave, Orange Money, Virement) et champ motif obligatoire.
3. Appel idempotent vers `POST /api/v1/ventes/:id/annuler`.

Fournis le code React TypeScript complet.
```

---

# ⚙️ GROUPE 3 : NOUVEAUX MODULES BACKEND MÉTIER — @Abdallah Diouf

### 🎯 Prompt : Développer le module EncaissementsModule
```text
Tu es un Architecte Backend NestJS.
Développe le module `EncaissementsModule` (`src/modules/encaissements/`) pour gérer les encaissements et règlements multi-factures.

Spécifications :
1. Endpoint `POST /api/v1/encaissements` :
   - Crée l'entité parente `Encaissement` (reçu `REC-YYYY-MM-XXXXX` généré via `reference_compteurs`).
   - Si `modeVentilation === 'FIFO_AUTO'` : Impute automatiquement sur les factures impayées du client triées par `createdAt ASC`.
   - Si `modeVentilation === 'MANUELLE'` : Valide que $\sum \text{allocations} \le \text{montantTotal}$.
   - Insère les lignes `VentilationReglement` et met à jour `montantPaye`, `soldeDu` et `statutPaiement` sur chaque vente sous transaction `$transaction`.

Fournis `encaissements.service.ts`, `encaissements.controller.ts`, et les DTOs.
```

---

### 🎯 Prompt : Développer le module LocationsModule
```text
Tu es un Développeur Backend NestJS.
Développe le module `LocationsModule` (`src/modules/locations/`) pour gérer les boutiques et entrepôts.

Spécifications :
1. Modèle Prisma `Location` : `id` (UUID), `type` (ENTREPOT | BOUTIQUE), `nom`, `adresse`, `telephone`, `actif`.
2. Endpoints :
   - `GET /api/v1/locations` : Liste des emplacements actifs.
   - `POST /api/v1/locations` : Création (Guards: `Roles('OWNER')`).
   - `PATCH /api/v1/locations/:id` : Modification / activation / désactivation.

Fournis `locations.controller.ts`, `locations.service.ts`, et `locations.module.ts`.
```

---

### 🎯 Prompt : Développer le module UsersModule
```text
Tu es un Développeur Backend NestJS.
Développe le module `UsersModule` (`src/modules/users/`) pour l'administration des utilisateurs et l'affectation aux boutiques.

Spécifications :
1. Endpoints (Guards: `Roles('OWNER')`) :
   - `GET /api/v1/users` : Liste complète des utilisateurs.
   - `POST /api/v1/users` : Création avec affectation obligatoire à une boutique pour les boutiquiers.
   - `PATCH /api/v1/users/:id` : Modification / Réaffectation de boutique.
   - `POST /api/v1/users/:id/resend-otp` : Renvoi de l'OTP SMS d'activation via `DexchangeSmsService`.
   - `DELETE /api/v1/users/:id` : Soft-delete (`actif = false`) et révocation immédiate des refresh tokens dans `refresh_tokens`.

Fournis `users.controller.ts`, `users.service.ts`, et `users.module.ts`.
```

---

### 🎯 Prompt : Développer l’arbitrage des conflits offline
```text
Tu es un Développeur Backend NestJS.
Développe l'endpoint d'arbitrage des conflits offline dans `src/modules/sync/sync.service.ts`.

Spécifications :
1. Endpoint `POST /api/v1/sync/conflicts/:id/arbitrer` (réservé OWNER) :
   - Si `action === 'REGULARISE'` : Exécute un mouvement `AJUSTEMENT` positif avec `justification = 'Arbitrage conflit {referenceFacture} — régularisation physique'` et valide la vente en `CONFIRMED`.
   - Si `action === 'CANCEL_REFUND'` : Annule la vente et génère la sortie de caisse `Remboursement`.

Fournis l'implémentation TypeScript complète.
```

---

# 🚀 GROUPE 4 : TÂCHES 01 À 19 (Sprint 1 & Début Sprint 2)

### 🎯 Prompt Task 01 : Design System & UI Components Textile (Figma / v0)
*(Voir Prompt Task 1.1 du Groupe 1)*

### 🎯 Prompt Task 02 : Maquettage des Écrans Boutiquier Mobile
*(Voir Prompt Task 1.2 du Groupe 1)*

### 🎯 Prompt Task 03 : Maquettage Console Owner telephone, desktop & Tablette
*(Voir Prompt Concevoir l'écran de gestion des emplacements/utilisateurs)*

---

### 🎯 Prompt Task 04 : Setup Repository Backend NestJS (Fastify + TypeScript)
```text
Tu es un Architecte Backend Senior expert NestJS.
Initialise la structure de base d'une API NestJS de production avec Fastify dans le dossier `./backend`.

Spécifications :
1. Adaptateur Fastify : `@nestjs/platform-fastify`.
2. Sécurité : `@fastify/helmet`, `cors`, `ValidationPipe` global.
3. Préfixe global : `/api/v1`.
4. Endpoint HealthCheck : `GET /api/v1/health`.
5. Configuration : `ConfigModule.forRoot({ isGlobal: true })` avec validation des variables `.env`.
6. Swagger : `@nestjs/swagger` sur `/api/v1/docs`.

Fournis `main.ts`, `app.module.ts`, et `health.controller.ts`.
```

---

### 🎯 Prompt Task 05 : Setup Repository Frontend React Vite PWA Tailwind
```text
Tu es un Lead Frontend Developer expert React PWA.
Configure le projet frontend React 18+ avec Vite, TypeScript, TailwindCSS et `vite-plugin-pwa` dans le dossier `./frontend`.

Spécifications :
1. `vite.config.ts` avec `VitePWA` (autoUpdate, manifest complet, cache Workbox).
2. React Router v6 et TanStack Query Provider (`QueryClientProvider`).
3. Composant `PwaInstallBanner.tsx` pour installation PWA.

Fournis `vite.config.ts`, `manifest.webmanifest`, et `PwaInstallBanner.tsx`.
```

---

### 🎯 Prompt Task 06 : Schéma Prisma PostgreSQL Complet (schema.prisma)
```text
Tu es un DBA PostgreSQL et expert Prisma ORM.
Génère le fichier `prisma/schema.prisma` v6.0 complet pour le secteur textile.

Modèles obligatoires :
- `User`, `RefreshToken`, `Location`, `Unite`, `UniteConversion`.
- `Produit` (uniteStockage: METRE/KG/ROULEAU, longueurRouleauMetres, poidsAuMetreKg, photoUrl).
- `Stock`, `MouvementStock`.
- `Transfert`, `LigneTransfert`.
- `Client`.
- `Vente` (referenceFacture unique, statutPaiement, soldeDu, montantTotal, montantPaye, synchronisationStatus).
- `LigneVente` (uniteSaisie, longueurDecoupeMetres).
- `Encaissement` (referenceRecu, modeVentilation: FIFO_AUTO/MANUELLE, statut).
- `VentilationReglement`.
- `Remboursement` (referenceRemboursement, modeRemboursement: ESPECES/WAVE/OM/VIREMENT).
- `AuditLog`.
- `ReferenceCompteur` (cle PK varchar 50, valeur int @default(0), @@map("reference_compteurs")).

Génère le fichier `prisma/schema.prisma` complet.
```

---

### 🎯 Prompt Task 07 : Triggers SQL d'Intégrité & Contraintes CHECK Métier
```text
Tu es un Spécialiste SQL PostgreSQL.
Écris le script SQL de migration personnalisé pour appliquer les contraintes d'intégrité métier strictes sur PostgreSQL.

Contraintes et triggers requis :
1. `ALTER TABLE stocks ADD CONSTRAINT check_stock_quantite_positive CHECK (quantite >= 0);`
2. `ALTER TABLE mouvements_stock ADD CONSTRAINT check_mouvement_quantite_positive CHECK (quantite > 0);`
3. `ALTER TABLE mouvements_stock ADD CONSTRAINT check_mouvement_justification CHECK (type <> 'AJUSTEMENT' OR justification IS NOT NULL);`
4. `CREATE TABLE IF NOT EXISTS reference_compteurs (cle VARCHAR(50) PRIMARY KEY, valeur INTEGER NOT NULL DEFAULT 0);`
5. Trigger d'intégrité User / Location (OWNER -> location_id NULL ; BOUTIQUIER -> location_id type BOUTIQUE).
6. Trigger d'intégrité Vente / Vendeur (`ventes.vendeur_id` rattaché à `ventes.boutique_id`).

Fournis le script SQL complet avec fonctions PL/pgSQL et triggers.
```

---

### 🎯 Prompt Task 08 : Script de Seed Initial Réaliste (prisma/seed.ts)
```text
Tu es un Développeur Backend TypeScript.
Écris le script `prisma/seed.ts` pour initialiser la base de données avec des données réelles de démarrage (Sénégal).

Données à insérer :
1. Unités : Mètre, Kilogramme, Rouleau, Yard.
2. Emplacements : 1 Entrepôt Central Dakar, 2 Boutiques pilotes (Sandaga, Thiès).
3. Utilisateurs : 3 Owners (Amadou Ba, Ousmane Sow, Ibrahima Diallo), 2 Boutiquiers de test.
4. Tissus réalistes : Wax Hollandais (Rouleau 5.48m), Bazin Riche (Mètre), Soie (Mètre), Lin (Kg).
5. Stocks positifs initiaux dans toutes les boutiques et entrepôt.

Fournis `prisma/seed.ts` complet.
```

---

### 🎯 Prompt Task 09 : Service Passerelle SMS dexchange-sms
```text
Tu es un Développeur NestJS.
Crée le service `DexchangeSmsService` dans `src/modules/sms/dexchange-sms.service.ts` pour envoyer des SMS transactionnels via l'API dexchange-sms.

Spécifications :
1. Méthode `sendOtp(toPhone: string, otpCode: string): Promise<{ success: boolean; messageId?: string; error?: string }>`.
2. Formatage international du numéro (+221...).
3. Message : `"Votre code de connexion Stock Textile est : {otpCode}. Valide 5 minutes."`
4. Mock en environnement dev/test pour logger dans la console.

Fournis `dexchange-sms.service.ts` et `sms.module.ts`.
```

---

### 🎯 Prompt Task 10 : Service d'Envoi d'Email OTP (SMTP OVH / Nodemailer)
```text
Tu es un Développeur Backend NestJS.
Crée le service `EmailService` dans `src/modules/email/email.service.ts` pour envoyer les emails OTP aux Owners via le SMTP SSL d'OVH (port 465).

Spécifications :
1. Méthode `sendOtpEmail(toEmail: string, ownerName: string, otpCode: string): Promise<boolean>`.
2. Template HTML élégant affichant le code OTP à 6 chiffres en gros caractères monospace.

Fournis `email.service.ts` et `email.module.ts`.
```

---

### 🎯 Prompt Task 11 : Module d'Authentification OTP & Activation Boutiquier (AuthModule)
```text
Tu es un Expert Sécurité NestJS.
Développe le module `AuthModule` complet gérant l'authentification OTP et mot de passe.

Endpoints requis :
1. `POST /api/v1/auth/otp/send` (Body: `{ identifier: string }`) avec anti-flood (max 3 envois / 15 min).
2. `POST /api/v1/auth/otp/verify` (Body: `{ identifier: string, otpCode: string }`) avec max 5 tentatives.
3. `POST /api/v1/auth/boutiquier/activate` (Body: `{ telephone: string, otpCode: string, nouveauMotDePasse: string }`).
4. `POST /api/v1/auth/boutiquier/login` (Body: `{ telephone: string, motDePasse: string }`).
5. `POST /api/v1/auth/refresh`.

Fournis `auth.controller.ts`, `auth.service.ts`, et les Guards JWT.
```

---

### 🎯 Prompt Task 12 : Gestionnaire de Session Hebdomadaire (Reset du Lundi & Refresh Tokens)
```text
Tu es un Architecte Sécurité NestJS.
Implémente la gestion des sessions avec Refresh Tokens révocables et expiration hebdomadaire le **lundi à 04h00 UTC**.

Spécifications :
1. Calcul de la date d'expiration au prochain lundi 04h00 UTC (`expires_at`).
2. Tâche Cron `@Cron('0 4 * * 1')` dans `AuthModule` pour révoquer automatiquement les sessions actives le lundi matin.
3. Révocation immédiate de tous les tokens d'un utilisateur si `actif = false`.

Fournis `token.service.ts` et `jwt-auth.guard.ts`.
```

---

### 🎯 Prompt Task 13 : Module Cloudflare R2 Upload & Optimisation WebP (MediaModule)
```text
Tu es un Développeur Backend NestJS.
Crée le service `MediaService` dans `src/modules/media/media.service.ts` pour uploader et compresser les photos de tissus vers Cloudflare R2.

Spécifications :
1. Client `@aws-sdk/client-s3` connecté au bucket R2.
2. Compression `sharp` : Max 1200px de large, format WebP qualité 80.
3. Headers d'upload : `Cache-Control: public, max-age=31536000, immutable`.
4. Endpoint `POST /api/v1/media/upload-tissu` (réservé OWNER).

Fournis `media.service.ts`, `media.controller.ts`, et `media.module.ts`.
```

---

### 🎯 Prompt Task 14 : Module Produits & Conversions d'Unités (ProduitsModule)
```text
Tu es un Développeur NestJS.
Développe le module `ProduitsModule` gérant le catalogue de tissus.

Spécifications :
1. DTO `CreateProduitDto` : reference, nom, photoUrl, uniteStockage (METRE/KG/ROULEAU), prixIndicatif, prixMinimum, longueurRouleauMetres, poidsAuMetreKg.
2. Endpoints `GET /api/v1/produits`, `POST /api/v1/produits`, `PATCH /api/v1/produits/:id`.

Fournis `produits.controller.ts`, `produits.service.ts`, et `produits.module.ts`.
```

---

### 🎯 Prompt Task 15 : Module Stock Transactionnel (Verrous SELECT FOR UPDATE)
```text
Tu es un Expert Base de Données et NestJS.
Crée le service `StockService` dans `src/modules/stock/stock.service.ts` avec verrous SQL `SELECT ... FOR UPDATE` triés par `produitId ASC` pour éliminer tout deadlock et stock négatif.

Méthode centrale :
```typescript
async executeMovement(
  tx: Prisma.TransactionClient,
  params: {
    produitId: string;
    locationId: string;
    quantite: Prisma.Decimal;
    sens: 'ENTREE' | 'SORTIE';
    type: MouvementType;
    uniteUtilisee: string;
    utilisateurId: string;
    justification?: string;
    referenceType?: string;
    referenceId?: string;
  }
): Promise<Stock>
```
Fournis `stock.service.ts`, `stock.controller.ts`, et les DTOs pour entrées manuelles et ajustements.
```

---

### 🎯 Prompt Task 16 : Base de Données Locale IndexedDB avec Dexie.js
```text
Tu es un Architecte Frontend React PWA.
Configure la base de données locale IndexedDB via **Dexie.js** (`src/db/localDb.ts`) pour rendre l'application 100% opérationnelle hors-ligne.

Tables Dexie.js :
1. `products` : id, reference, nom, photoUrl, uniteStockage, prixIndicatif, prixMinimum, longueurRouleauMetres, poidsAuMetreKg.
2. `stocks` : id, produitId, locationId, quantite.
3. `clients` : id, nom, telephone, entreprise.
4. `offline_queue` : id, type ('SALE' | 'PAYMENT'), payload (JSON), status ('PENDING' | 'SYNCED' | 'CONFLICT_STOCK'), createdAt, retryCount.

Fournis `src/db/localDb.ts` et les hooks React `useLocalStock()`, `useOfflineQueue()`.
```

---

### 🎯 Prompt Task 17 : Client HTTP Axios avec Intercepteurs & Auto-Refresh Token
```text
Tu es un Développeur Frontend React TypeScript.
Configure le client Axios `src/api/client.ts` avec gestion automatique du Bearer token et intercepteur de rafraîchissement 401.

Spécifications :
1. Injection automatique du `Authorization: Bearer <accessToken>` depuis le store Zustand/LocalStorage.
2. Intercepteur de réponse 401 : appel à `/api/v1/auth/refresh`, mise à jour du token et rejeu transparent des requêtes en attente.
3. Redirection vers `/login` si le refresh token est révoqué ou expiré.

Fournis `src/api/client.ts`.
```

---

### 🎯 Prompt Task 18 : Écrans UI d'Authentification & Activation Boutiquier
*(Voir Prompt Task 5.2 ci-dessus)*

---

### 🎯 Prompt Task 19 : Service de Calcul et Conversion Métier Textile (Mètre/Kilo/Rouleau)
```text
Tu es un Développeur Backend TypeScript.
Crée le service de calcul textile et les helpers monétaires dans `src/common/textile.ts` et `src/common/money.ts`.

Fonctions requises :
1. `convertKiloToMetres(poidsKg: number, grammageKgParMetre: number): number`
2. `calculateRouleauMetres(nombreRouleaux: number, longueurParRouleau: number): number`
3. `computeStatutPaiement(montantTotal: Prisma.Decimal, montantPaye: Prisma.Decimal): 'NON_PAYE' | 'PARTIEL' | 'SOLDE'` (avec `.gte()` et `.gt()`).
4. `computeSoldeDu(montantTotal: Prisma.Decimal, montantPaye: Prisma.Decimal): Prisma.Decimal`.
5. Tests unitaires Jest complets (`textile.spec.ts`, `money.spec.ts`).

Fournis les deux fichiers TypeScript et leurs suites de tests Jest.
```

---

# 📦 GROUPE 5 : TÂCHES 20 À 35 (Sprint 2 & Début Sprint 3)

### 🎯 Prompt Task 20 : Endpoint de Confirmation de Vente Atomique sous Transaction Prisma
```text
Tu es un Lead Backend Developer NestJS.
Développe le service `VentesService` (`src/modules/ventes/ventes.service.ts`) pour la création de factures de vente.

Spécifications :
1. Référence facture unique générée atomiquement via `reference_compteurs` (`FAC-YYYY-MM-XXXXX`).
2. Tri des lignes par `produitId ASC` avant verrouillage.
3. Calcul des métrages exacts (kilos, rouleaux décapités, mètres).
4. Décrément du stock via `StockService.executeMovement()`.
5. Calcul du statut de paiement avec `computeStatutPaiement()`.

Fournis `ventes.service.ts`, `ventes.controller.ts`, et les DTOs `CreateVenteDto`.
```

---

### 🎯 Prompt Task 21 : Vues SQL & Calcul Dynamique des Soldes et Créances
```text
Tu es un Développeur Backend NestJS & SQL.
Implémente le service `CreancesService` dans `src/modules/creances/creances.service.ts` pour restituer l'état exact des créances sans table dérivée redondante.

Endpoints :
1. `GET /api/v1/creances` (filtré par `boutiqueId` si Boutiquier, toutes boutiques si Owner).
2. Agrégation par client : Somme des montants factures - Somme des ventilations confirmées = Solde total dû.
3. Détail des factures impayées triées par ancienneté (`createdAt ASC`).

Fournis `creances.service.ts`, `creances.controller.ts`, et `creances.module.ts`.
```

---

### 🎯 Prompt Task 22 : Module de Ventilation FIFO des Règlements Globaux Multi-Créances
*(Voir Prompt Développer le module EncaissementsModule)*

---

### 🎯 Prompt Task 23 : Grille des Tissus PWA & Recherche Instantanée avec Cache Dexie
```text
Tu es un Développeur Frontend React Tailwind.
Crée le composant `src/components/pos/ProductGrid.tsx` affichant le catalogue de tissus pour la caisse tactile.

Fonctionnalités :
1. Grille tactile 2 colonnes (mobile 390px) et 4 colonnes (tablette/desktop).
2. Barre de recherche instantanée locale sur Dexie.js (nom, couleur, motif, catégorie).
3. Cartes avec photo WebP en cache, badge de stock restant en magasin et prix au mètre/rouleau/kg.
4. Clic ouvre `AddFabricModal`.

Fournis `ProductGrid.tsx` et `FabricCard.tsx`.
```

---

### 🎯 Prompt Task 24 : Modal d'Ajout au Panier Multi-Unités (Mètre / Kilo / Rouleau)
```text
Tu es un Développeur Frontend React Tailwind.
Crée le modal d'ajout d'article `src/components/pos/AddFabricModal.tsx`.

Fonctionnalités :
1. Onglets dynamiques selon l'unité de stockage du tissu :
   - Au Mètre : Saisie directe du métrage.
   - Au Kilo : Saisie du poids en kg converti en mètres en temps réel.
   - Au Rouleau : Choix "Rouleau complet" vs "Décapiter / Couper métrage".
2. Négociation de prix : Champ prix unitaire avec alerte orange si < `prixMinimum`.
3. Bouton "Ajouter au Panier".

Fournis le composant React complet.
```

---

### 🎯 Prompt Task 25 : Panier Tactile & Modal de Finalisation de Vente (Comptant / Crédit)
```text
Tu es un Développeur Frontend React Tailwind.
Développe le tiroir de panier `src/components/pos/CartDrawer.tsx` et le modal de finalisation `src/components/pos/CheckoutModal.tsx`.

Fonctionnalités :
1. Calcul du total en FCFA avec récapitulatif des lignes et des métrages.
2. Choix du type de vente :
   - Vente Comptant : Règlement immédiat.
   - Vente à Crédit : Recherche ou création rapide de client obligatoire (`Nom`, `Téléphone`).
3. Validation locale Dexie `offline_queue` si hors-ligne ou appel API direct si en ligne.

Fournis les composants React complets.
```

---

### 🎯 Prompt Task 26 : Écran des Créances Boutique (Vue Mobile & Alertes Ancienneté)
*(Voir Prompt Task 9.1)*

---

### 🎯 Prompt Task 27 : Modal Tactile d'Encaissement Global FIFO avec Pré-ventilation
*(Voir Prompt Task 9.2)*

---

### 🎯 Prompt Task 28 : SyncWorker & File d'Attente Offline Dexie (SyncManager)
*(Voir Prompt Task 10.1)*

---

### 🎯 Prompt Task 29 : Endpoint Backend de Synchronisation par Lot Idempotent (SyncModule)
*(Voir Prompt Task 10.2)*

---

### 🎯 Prompt Task 30 : Module Transferts Inter-Boutiques & Validation Atomique
```text
Tu es un Développeur Fullstack NestJS & React.
Développe le module `TransfertsModule` (`src/modules/transferts/`).

Spécifications :
1. Demande de réapprovisionnement créée par le Boutiquier (`POST /api/v1/transferts/demande`).
2. Notification aux 3 Owners.
3. Validation par le premier Owner disponible (`POST /api/v1/transferts/:id/valider`) avec sélection de la source et mouvements atomiques de sortie et entrée.

Fournis `transferts.service.ts`, `transferts.controller.ts`, et l'écran de gestion.
```

---

### 🎯 Prompt Task 31 : Annulation de Vente Réversible & Remboursements
```text
Tu es un Développeur Backend NestJS.
Implémente l'annulation de vente avec génération de sortie de caisse dans `VentesService`.

Spécifications :
1. `POST /api/v1/ventes/:id/annuler` (Accessible à l'Owner et au Boutiquier vendeur d'origine).
2. Restitution du stock en boutique via mouvement `ANNULATION` (`ENTREE`).
3. Création de l'entité `Remboursement` (id, referenceRemboursement `RMB-...`, montant, modeRemboursement, motif, auteurId).

Fournis le code TypeScript complet.
```

---

### 🎯 Prompt Task 32 : Dashboard Global Consolidé Desktop Owner
```text
Tu es un Lead Frontend React.
Crée le tableau de bord desktop Owner `src/pages/owner/DashboardScreen.tsx`.

Indicateurs :
1. KPIs : Chiffre d'affaires global, Total créances en cours, Valorisation du stock.
2. Clôture de caisse réelle : $\text{Caisse Réelle Espèces} = \sum \text{Encaissements Espèces} - \sum \text{Remboursements Espèces}$.
3. Graphiques de répartition par boutique et alertes en attente.

Fournis le code React TypeScript complet.
```

---

### 🎯 Prompt Task 33 : Journal d'Audit & Gestion des Accès Utilisateurs
```text
Tu es un Développeur Backend NestJS.
Crée le module `AuditLogModule` (`src/modules/audit/`) et l'intercepteur d'audit global.

Spécifications :
1. Intercepteur interceptant toutes les mutations (création vente, encaissement, annulation, ajustement stock, transfert).
2. Endpoint `GET /api/v1/audit` paginé avec filtres par utilisateur, ressource et date.

Fournis `audit.service.ts`, `audit.interceptor.ts`, et `audit.controller.ts`.
```

---

### 🎯 Prompt Task 34 : Moteur de Génération PDF pour Bilans Textile (PdfGeneratorService)
```text
Tu es un Développeur Backend NestJS.
Crée le service `PdfGeneratorService` dans `src/modules/reports/pdf-generator.service.ts` utilisant `pdfmake`.

Spécifications :
1. Compilation d'un document PDF professionnel : Logo de marque, tableau récapitulatif par boutique, ventilation des encaissements par moyen de paiement, détail des créances et alertes de stock.
2. Export en Buffer binaire rapide pour envoi email et téléchargement direct.

Fournis `pdf-generator.service.ts` et la définition des styles pdfmake.
```

---

### 🎯 Prompt Task 35 : Les 3 Cron Jobs & Envoi Automatique par Email
```text
Tu es un Développeur Backend NestJS.
Crée le service de crons `ReportsCron` dans `src/modules/reports/reports.cron.ts`.

Tâches programmées :
1. Quotidien à **22h30** (`@Cron('30 22 * * *')`) : Bilan de la journée post-fermeture.
2. Hebdomadaire le **dimanche à 18h00** (`@Cron('0 18 * * 0')`).
3. Mensuel le **1er du mois à 06h00** (`@Cron('0 6 1 * *')`).
4. Envoi d'email automatique aux 3 Owners avec le PDF en pièce jointe via `MailerModule`.

Fournis `reports.cron.ts` et `reports.module.ts`.
```

---

# 🚢 GROUPE 6 : DÉPLOIEMENT, TESTS ET MISE EN PRODUCTION (Tasks 36 à 39)

### 🎯 Prompt Task 36 : Provisioning Serveur VPS OVH (Docker Compose, Nginx SSL, Backups)
```text
Tu es un Ingénieur DevOps Senior.
Rédige la configuration complète de déploiement pour le serveur VPS OVH (Ubuntu 24.04).

Livrables requis :
1. `docker-compose.prod.yml` :
   - Service `postgres:16-alpine` avec volume persistant.
   - Service `backend` NestJS (Fastify en mode production).
   - Service `backup-cron` exécutant un `pg_dump` quotidien chiffré et poussé vers Cloudflare R2 (`backups-*`).
2. `nginx.conf` : Reverse proxy avec SSL Let's Encrypt, compression gzip, et headers de sécurité HTTPS.
3. Script de déploiement `deploy.sh`.

Fournis tous les fichiers de configuration commentés.
```

---

### 🎯 Prompt Task 37 : Déploiement Vercel PWA & Pipeline CI/CD GitHub Actions
```text
Tu es un Ingénieur DevOps & Frontend Lead.
Configure le déploiement de l'application PWA Frontend sur Vercel avec optimisation CDN et pipeline CI/CD GitHub Actions.

Livrables :
1. `vercel.json` : Rewrites SPA, headers de cache pour Service Worker et assets statiques.
2. Workflow GitHub Actions `.github/workflows/deploy.yml` : Tests automatisés, build PWA, et déploiement Vercel.

Fournis `vercel.json` et `deploy.yml`.
```

---

### 🎯 Prompt Task 38 : Suite de Tests E2E Playwright (Scénarios Hors-Ligne & Concurrence)
```text
Tu es un Ingénieur QA / Test Automation.
Écris les tests End-to-End Playwright (`e2e/critical-flows.spec.ts`) validant les parcours clés :

Scénarios à tester :
1. Vente au rouleau complet et vente au rouleau décapité (vérification du métrage décrémenté).
2. Vente hors-ligne (simulation coupure réseau) -> reconnexion -> synchronisation réussie.
3. Encaissement multi-factures avec sélection du mode FIFO vs Répartition manuelle et rendu de monnaie.
4. Annulation d'une vente par le boutiquier avec vérification de la création du Remboursement de caisse.

Fournis le fichier de test Playwright complet.
```

---

### 🎯 Prompt Task 39 : Recette Métier en Boutique Pilote, Guide 1-page WhatsApp & Go-Live
```text
Tu es le Responsable Déploiement & Chef de Projet.
Rédige le guide opérationnel de mise en production et le protocole de formation des boutiquiers pour le Jour 15.

Contenu du livrable :
1. Checklist technique pré-lancement (migrations, seed, SMS réels, SSL).
2. Guide de formation "15 minutes chrono" pour les boutiquiers (activation OTP, vente comptant, vente crédit, mode offline).

Fournis le document markdown complet `docs/guide_formation_golive.md`.
```
