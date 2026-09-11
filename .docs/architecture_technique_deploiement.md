# Architecture Technique & Guide de Déploiement
## Plateforme de Gestion de Stock, Ventes et Créances — Secteur Textile

**Version : 2.0**  
**Date : 11 septembre 2026**  
**Stack de Référence : NestJS (Fastify) + Prisma ORM + PostgreSQL 16 | React PWA + Vite + Tailwind/Shadcn + Dexie.js | Cloudflare R2 | dexchange-sms | OVHcloud & Vercel**

---

## 1. Vue d'Ensemble de l'Architecture

Le système repose sur une architecture découplée **PWA Offline-First** et **API REST transactionnelle** hautement résiliente :

```text
                               ┌──────────────────────────────────────────────────────────┐
                               │                    UTILISATEURS                          │
                               │                                                          │
                               │   [ BOUTIQUIER : Mobile / Tablette ]   [ OWNER : PC ]    │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                                                            │ HTTPS / CDN
                                                            ▼
                               ┌──────────────────────────────────────────────────────────┐
                               │                 FRONTEND PWA (VERCEL)                    │
                               │  - React 18+ / Vite / TypeScript                         │
                               │  - TailwindCSS + Shadcn/ui                               │
                               │  - Dexie.js (IndexedDB local)                            │
                               │  - Service Worker (Workbox PWA + Offline Queue)          │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                                                            │ API REST / JSON (HTTPS)
                                                            ▼
                               ┌──────────────────────────────────────────────────────────┐
                               │              SERVEUR BACKEND (OVH VPS / DOCKER)          │
                               │  Nginx Reverse Proxy + SSL Let's Encrypt                 │
                               │  └── NestJS (Fastify Adapter)                            │
                               │      ├── AuthModule (JWT Access/Refresh, OTP SMS/Email)  │
                               │      ├── UsersModule (CRUD Boutiquiers/Owners, OTP)      │
                               │      ├── LocationsModule (CRUD Boutiques & Entrepôts)    │
                               │      ├── SyncModule (UUID Deduplication, Outbox Worker)  │
                               │      ├── StockModule (Transactions Prisma & Lockings)    │
                               │      ├── VentesModule (Facturation, Kilo, Rouleau découpé)│
                               │      ├── EncaissementsModule (Paiements, FIFO & Manuel)  │
                               │      ├── RemboursementsModule (Sorties de caisse tracées)│
                               │      ├── TransfertsModule (Multi-Owners, Validation)     │
                               │      ├── MediaModule (R2 Upload, Sharp WebP Compression) │
                               │      ├── ReportsModule (Crons, PDF Generator & Mailer)   │
                               │      └── AuditModule (Intercepteurs d'audit complets)    │
                               └──────────────┬───────────────────────────┬───────────────┘
                                              │                           │
                   ┌──────────────────────────┴────────┐       ┌──────────┴───────────────┐
                   ▼                                   ▼       ▼                          ▼
      ┌─────────────────────────┐         ┌─────────────────────────┐  ┌────────────────────────┐
      │   BASE POSTGRESQL 16+   │         │    CLOUDFLARE R2 (S3)   │  │     DEXCHANGE-SMS      │
      │  - Prisma ORM           │         │  - Photos des tissus    │  │  - Envoi OTP par SMS   │
      │  - Triggers & Checks    │         │  - CDN Cloudflare       │  │  - Activation comptes  │
      │  - SELECT FOR UPDATE    │         │  - Zero Egress Fees     │  │  - Notifications       │
      └─────────────────────────┘         └─────────────────────────┘  └────────────────────────┘
```

---

## 2. Spécification Détaillée des Composants

### 2.1 Backend : NestJS + Prisma ORM
- **Framework** : NestJS avec adaptateur Fastify (gain de 30% de débit par rapport à Express).
- **ORM** : **Prisma ORM** (`@prisma/client` + `prisma`).
  - Gestion des migrations (`prisma migrate deploy`).
  - Exécution des transactions interactives `$transaction` avec verrous SQL natifs `SELECT ... FOR UPDATE` via `prisma.$queryRaw` ordonnés par ID (`ORDER BY id ASC`) pour garantir l'invariant `quantite >= 0` sans interblocage.
  - Extension Prisma Client pour l'audit automatique.
- **Validation** : `class-validator` et `class-transformer` pour la validation stricte des DTOs.
- **Sécurité** :
  - `helmet` via `@fastify/helmet`.
  - Rate limiting `@nestjs/throttler` (particulièrement sur les endpoints `/auth/otp/*`).
  - CORS configuré avec le domaine Vercel de production.

### 2.2 Base de Données : PostgreSQL 16
- **Clés primaires** : `UUIDv4` générés côté client ou backend (`gen_random_uuid()`).
- **Triggers DB & Contraintes** :
  - `CHECK (quantite >= 0)` sur la table `stocks`.
  - Triggers de cohérence rôle/localisation (`OWNER` sans localisation, `BOUTIQUIER` avec boutique obligatoire).
  - Triggers de vérification vendeur/boutique sur les ventes.

### 2.3 Frontend : React PWA (Vite + TypeScript)
- **UI Framework** : TailwindCSS + Shadcn/ui (Radix UI) pour une ergonomie moderne, tactile et accessible.
- **State Management & Caching** :
  - **TanStack Query (React Query)** pour la mise en cache des requêtes réseau, la gestion des états en ligne/hors-ligne et le refetching intelligent.
  - **Zustand** pour l'état applicatif global (session, panier de caisse, filtres).
- **Moteur Offline-First** :
  - **Dexie.js** (surcouche IndexedDB haute performance) : Stocke le catalogue des produits, les clients, les stocks de la boutique et la file d'attente des ventes offline (`offline_queue`).
  - **Service Worker (Workbox)** : Mise en cache des assets statiques (HTML/JS/CSS/icônes) et des photos des tissus.

### 2.4 Médias & Photos : Cloudflare R2
- **Stockage d'images S3-compatible** sans frais de bande passante sortante (*Zero Egress Fees*).
- **Traitement d'image** : Compression et conversion en **WebP** (résolution max 1200px, qualité 80, ~120 Ko par photo) côté client via `browser-image-compression` ou côté serveur via `sharp`.
- **Distribution** : Domaine personnalisé Cloudflare CDN (ex: `https://images.notredomaine.com/...`) avec headers `Cache-Control: public, max-age=31536000, immutable`.

### 2.5 Passerelle SMS : dexchange-sms
- **Service dédié NestJS** : `DexchangeSmsService` encapsulant les appels HTTP REST vers l'API dexchange-sms.
- **Sécurité des codes OTP** :
  - Code à 6 chiffres aléatoires (`crypto.randomInt(100000, 999999)`).
  - Stockage en DB sous forme de hash avec date d'expiration de 5 minutes.
  - Maximum 3 tentatives d'envoi par numéro toutes les 15 minutes (Anti-flood).

### 2.6 Moteur de Rapports Automatisés & Crons (`ReportsModule` & `AuthModule`)
- **Ordonnanceur** : `@nestjs/schedule`
- **Générateur PDF** : `pdfmake`
- **Crons programmés** :
  1. **Rapport Journalier (`@Cron('30 22 * * *')` - 22h30)** : Ventes du jour, clôtures de caisse réelles, créances et alertes stock (post-fermeture des boutiques).
  2. **Rapport Hebdomadaire (`@Cron('0 18 * * 0')` - Dimanche 18h00)** : Consolidation hebdomadaire et suivi du recouvrement.
  3. **Rapport Mensuel (`@Cron('0 6 1 * *')` - 1er du mois 06h00)** : Bilan complet et valorisation du stock restant.
  4. **Reset Hebdomadaire Sessions (`@Cron('0 4 * * 1')` - Lundi 04h00)** : Révocation automatique et renouvellement sécurisé de début de semaine.

---

## 3. Architecture de Synchronisation & Gestion des Conflits Offline

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROTOCOLE DE SYNCHRONISATION & CONFLITS                  │
│                                                                             │
│ 1. Saisie Hors-Ligne                                                        │
│    ├── Génération UUIDv4 local pour la vente et chaque ligne               │
│    ├── Décrément prédictif local dans Dexie.js (IndexedDB)                 │
│    └── Stockage dans `offline_queue` (statut: PENDING)                      │
│                                                                             │
│ 2. Reconnexion Réseau (Événement 'online')                                  │
│    ├── Le SyncManager PWA envoie le payload vers `POST /api/v1/sync/sales`  │
│                                                                             │
│ 3. Traitement Backend (Prisma Interactive Transaction)                      │
│    ├── Idempotence : si l'UUID existe déjà -> ignoré (200 OK)               │
│    ├── Verrouillage SQL : `SELECT ... FOR UPDATE` sur les stocks réels       │
│    ├── CAS A : Stock serveur SUFFISANT                                      │
│    │   ├── Stock décrémenté en base                                         │
│    │   ├── Vente confirmée (`statut = 'CONFIRMED'`, `sync = 'SYNCED'`)      │
│    │   └── 200 OK retourné -> Vente purgée de l'offline_queue               │
│    └── CAS B : Stock serveur INSUFFISANT (Conflit de vente concurrente)     │
│        ├── Vente enregistrée avec `statut = 'EN_CONFLIT'`                   │
│        ├── `synchronisation_status = 'CONFLICT_STOCK'`                      │
│        ├── Alerte instantanée push/dashboard pour les Owners                │
│        └── 200 OK (Statut Conflit) -> UI Boutiquier affiche alerte orange   │
│                                                                             │
│ 4. Résolution d'Arbitrage par l'Owner                                        │
│    ├── Choix 1 : Régularisation physique -> Création AJUSTEMENT stock -> OK│
│    └── Choix 2 : Annulation de la vente -> Génération Remboursement client  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Schéma Prisma de Référence (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  OWNER
  BOUTIQUIER
}

enum LocationType {
  ENTREPOT
  BOUTIQUE
}

enum ProductStatus {
  ACTIF
  INACTIF
}

enum UniteStockage {
  METRE
  KG
  ROULEAU
}

enum MouvementType {
  ENTREE_MANUELLE
  VENTE
  TRANSFERT
  AJUSTEMENT
  RETOUR
  PERTE
  ANNULATION
}

enum MouvementSens {
  ENTREE
  SORTIE
}

enum TransfertStatus {
  DEMANDE
  EN_TRANSIT
  VALIDE
  ANNULE
}

enum VenteStatus {
  DRAFT
  CONFIRMED
  CANCELLED
  EN_CONFLIT
}

enum StatutPaiement {
  NON_PAYE
  PARTIEL
  SOLDE
}

enum SyncStatus {
  SYNCED
  PENDING
  CONFLICT_STOCK
}

enum MoyenPaiement {
  ESPECES
  WAVE
  ORANGE_MONEY
  VIREMENT
  CHEQUE
  AUTRE
}

enum ModeVentilation {
  FIFO_AUTO
  MANUELLE
}

enum EncaissementStatus {
  VALIDE
  ANNULE
}

enum ModeRemboursement {
  ESPECES
  WAVE
  ORANGE_MONEY
  VIREMENT
}

model User {
  id                 String          @id @default(uuid()) @db.Uuid
  nom                String          @db.VarChar(255)
  telephone          String          @unique @db.VarChar(50)
  email              String?         @unique @db.VarChar(255)
  motDePasseHash     String?         @map("mot_de_passe_hash") @db.VarChar(255)
  premiereConnexion  Boolean         @default(true) @map("premiere_connexion")
  otpCodeHash        String?         @map("otp_code_hash") @db.VarChar(255)
  otpExpiresAt       DateTime?       @map("otp_expires_at") @db.Timestamptz()
  role               Role
  locationId         String?         @map("location_id") @db.Uuid
  actif              Boolean         @default(true)
  createdAt          DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt          DateTime        @updatedAt @map("updated_at") @db.Timestamptz()

  location           Location?       @relation(fields: [locationId], references: [id])
  refreshTokens      RefreshToken[]
  mouvementsStock    MouvementStock[]
  transfertsDemandes Transfert[]     @relation("DemandePar")
  transfertsValides  Transfert[]     @relation("ValidePar")
  transfertsAnnules  Transfert[]     @relation("AnnuleParTransfert")
  ventes             Vente[]         @relation("Vendeur")
  ventesAnnulees     Vente[]         @relation("AnnuleParVente")
  encaissements      Encaissement[]
  remboursements     Remboursement[]
  auditLogs          AuditLog[]

  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @unique @map("token_hash") @db.VarChar(255)
  expiresAt DateTime  @map("expires_at") @db.Timestamptz()
  revokedAt DateTime? @map("revoked_at") @db.Timestamptz()
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz()

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

model Location {
  id              String           @id @default(uuid()) @db.Uuid
  type            LocationType
  nom             String           @db.VarChar(255)
  adresse         String?          @db.VarChar(255)
  telephone       String?          @db.VarChar(50)
  actif           Boolean          @default(true)
  createdAt       DateTime         @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime         @updatedAt @map("updated_at") @db.Timestamptz()

  users           User[]
  stocks          Stock[]
  mouvementsStock MouvementStock[]
  transfertsSrc   Transfert[]      @relation("TransfertSource")
  transfertsDst   Transfert[]      @relation("TransfertDestination")
  ventes          Vente[]
  encaissements   Encaissement[]
  remboursements  Remboursement[]

  @@map("locations")
}

model Unite {
  id               String            @id @default(uuid()) @db.Uuid
  code             String            @unique @db.VarChar(50)
  nom              String            @db.VarChar(100)

  produits         Produit[]
  conversionsSrc   UniteConversion[] @relation("UniteSource")
  conversionsCible UniteConversion[] @relation("UniteCible")

  @@map("unites")
}

model UniteConversion {
  id            String   @id @default(uuid()) @db.Uuid
  uniteSourceId String   @map("unite_source_id") @db.Uuid
  uniteCibleId  String   @map("unite_cible_id") @db.Uuid
  facteur       Decimal  @db.Decimal(18, 6)

  uniteSource   Unite    @relation("UniteSource", fields: [uniteSourceId], references: [id])
  uniteCible    Unite    @relation("UniteCible", fields: [uniteCibleId], references: [id])

  @@unique([uniteSourceId, uniteCibleId])
  @@map("unite_conversions")
}

model Produit {
  id                    String          @id @default(uuid()) @db.Uuid
  reference             String          @unique @db.VarChar(100)
  nom                   String          @db.VarChar(255)
  categorie             String?         @db.VarChar(100)
  couleur               String?         @db.VarChar(100)
  motif                 String?         @db.VarChar(100)
  photoUrl              String          @map("photo_url") @db.Text
  uniteStockage         UniteStockage   @default(METRE) @map("unite_stockage")
  unitePrincipaleId     String          @map("unite_principale_id") @db.Uuid
  prixIndicatif         Decimal         @map("prix_indicatif") @db.Decimal(14, 2)
  prixMinimum           Decimal?        @map("prix_minimum") @db.Decimal(14, 2)
  longueurRouleauMetres Decimal?        @map("longueur_rouleau_metres") @db.Decimal(10, 2)
  poidsAuMetreKg        Decimal?        @map("poids_au_metre_kg") @db.Decimal(10, 4)
  statut                ProductStatus   @default(ACTIF)
  createdAt             DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt             DateTime        @updatedAt @map("updated_at") @db.Timestamptz()

  unitePrincipale       Unite           @relation(fields: [unitePrincipaleId], references: [id])
  stocks                Stock[]
  mouvementsStock       MouvementStock[]
  lignesTransfert       LigneTransfert[]
  lignesVente           LigneVente[]

  @@map("produits")
}

model Stock {
  id         String   @id @default(uuid()) @db.Uuid
  produitId  String   @map("produit_id") @db.Uuid
  locationId String   @map("location_id") @db.Uuid
  quantite   Decimal  @default(0) @db.Decimal(18, 3)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  produit    Produit  @relation(fields: [produitId], references: [id])
  location   Location @relation(fields: [locationId], references: [id])

  @@unique([produitId, locationId])
  @@map("stocks")
}

model MouvementStock {
  id             String        @id @default(uuid()) @db.Uuid
  type           MouvementType
  sens           MouvementSens
  produitId      String        @map("produit_id") @db.Uuid
  quantite       Decimal       @db.Decimal(18, 3)
  uniteUtilisee  String        @map("unite_utilisee") @db.VarChar(50)
  locationId     String        @map("location_id") @db.Uuid
  justification  String?       @db.Text
  referenceType  String?       @map("reference_type") @db.VarChar(50)
  referenceId    String?       @map("reference_id") @db.Uuid
  utilisateurId  String        @map("utilisateur_id") @db.Uuid
  createdAt      DateTime      @default(now()) @map("created_at") @db.Timestamptz()

  produit        Produit       @relation(fields: [produitId], references: [id])
  location       Location      @relation(fields: [locationId], references: [id])
  utilisateur    User          @relation(fields: [utilisateurId], references: [id])

  @@map("mouvements_stock")
}

model Transfert {
  id                    String          @id @default(uuid()) @db.Uuid
  reference             String          @unique @db.VarChar(100)
  locationSourceId      String?         @map("location_source_id") @db.Uuid
  locationDestinationId String          @map("location_destination_id") @db.Uuid
  statut                TransfertStatus @default(DEMANDE)
  demandePar            String          @map("demande_par") @db.Uuid
  validePar             String?         @map("valide_par") @db.Uuid
  motifAnnulation       String?         @map("motif_annulation") @db.Text
  annulePar             String?         @map("annule_par") @db.Uuid
  createdAt             DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt             DateTime        @updatedAt @map("updated_at") @db.Timestamptz()
  validatedAt           DateTime?       @map("validated_at") @db.Timestamptz()

  locationSource        Location?       @relation("TransfertSource", fields: [locationSourceId], references: [id])
  locationDestination   Location        @relation("TransfertDestination", fields: [locationDestinationId], references: [id])
  demandeur             User            @relation("DemandePar", fields: [demandePar], references: [id])
  valideur              User?           @relation("ValidePar", fields: [validePar], references: [id])
  annuleur              User?           @relation("AnnuleParTransfert", fields: [annulePar], references: [id])
  lignes                LigneTransfert[]

  @@map("transferts")
}

model LigneTransfert {
  id          String    @id @default(uuid()) @db.Uuid
  transfertId String    @map("transfert_id") @db.Uuid
  produitId   String    @map("produit_id") @db.Uuid
  quantite    Decimal   @db.Decimal(18, 3)
  unite       String    @db.VarChar(50)

  transfert   Transfert @relation(fields: [transfertId], references: [id], onDelete: Cascade)
  produit     Produit   @relation(fields: [produitId], references: [id])

  @@map("lignes_transfert")
}

model Client {
  id            String         @id @default(uuid()) @db.Uuid
  nom           String         @db.VarChar(255)
  telephone     String?        @db.VarChar(50)
  entreprise    String?        @db.VarChar(255)
  adresse       String?        @db.VarChar(255)
  notes         String?        @db.Text
  statut        ProductStatus  @default(ACTIF)
  createdAt     DateTime       @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime       @updatedAt @map("updated_at") @db.Timestamptz()

  ventes        Vente[]
  encaissements Encaissement[]

  @@map("clients")
}

model Vente {
  id                    String                 @id @default(uuid()) @db.Uuid
  referenceFacture      String                 @unique @map("reference_facture") @db.VarChar(100)
  boutiqueId            String                 @map("boutique_id") @db.Uuid
  vendeurId             String                 @map("vendeur_id") @db.Uuid
  clientId              String?                @map("client_id") @db.Uuid
  statut                VenteStatus            @default(CONFIRMED)
  statutPaiement        StatutPaiement         @default(NON_PAYE) @map("statut_paiement")
  montantTotal          Decimal                @map("montant_total") @db.Decimal(14, 2)
  montantPaye           Decimal                @default(0) @map("montant_paye") @db.Decimal(14, 2)
  soldeDu               Decimal                @map("solde_du") @db.Decimal(14, 2)
  dateEcheance          DateTime?              @map("date_echeance") @db.Timestamptz()
  synchronisationStatus SyncStatus             @default(SYNCED) @map("synchronisation_status")
  motifAnnulation       String?                @map("motif_annulation") @db.Text
  annuleParId           String?                @map("annule_par_id") @db.Uuid
  annuleAt              DateTime?              @map("annule_at") @db.Timestamptz()
  createdAt             DateTime               @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt             DateTime               @updatedAt @map("updated_at") @db.Timestamptz()

  boutique              Location               @relation(fields: [boutiqueId], references: [id])
  vendeur               User                   @relation("Vendeur", fields: [vendeurId], references: [id])
  client                Client?                @relation(fields: [clientId], references: [id])
  annulePar             User?                  @relation("AnnuleParVente", fields: [annuleParId], references: [id])
  lignes                LigneVente[]
  ventilations          VentilationReglement[]
  remboursements        Remboursement[]

  @@map("ventes")
}

model LigneVente {
  id                    String   @id @default(uuid()) @db.Uuid
  venteId               String   @map("vente_id") @db.Uuid
  produitId             String   @map("produit_id") @db.Uuid
  quantite              Decimal  @db.Decimal(18, 3)
  uniteSaisie           String   @map("unite_saisie") @db.VarChar(50)
  longueurDecoupeMetres Decimal? @map("longueur_decoupe_metres") @db.Decimal(10, 2)
  prixUnitaireApplique  Decimal  @map("prix_unitaire_applique") @db.Decimal(14, 2)
  remiseMontant         Decimal  @default(0) @map("remise_montant") @db.Decimal(14, 2)
  totalLigne            Decimal  @map("total_ligne") @db.Decimal(14, 2)

  vente                 Vente    @relation(fields: [venteId], references: [id], onDelete: Cascade)
  produit               Produit  @relation(fields: [produitId], references: [id])

  @@map("lignes_vente")
}

model Encaissement {
  id               String                 @id @default(uuid()) @db.Uuid
  referenceRecu    String                 @unique @map("reference_recu") @db.VarChar(100)
  clientId         String                 @map("client_id") @db.Uuid
  boutiqueId       String                 @map("boutique_id") @db.Uuid
  userId           String                 @map("user_id") @db.Uuid
  montantTotal     Decimal                @map("montant_total") @db.Decimal(14, 2)
  modePaiement     MoyenPaiement          @map("mode_paiement")
  referenceExterne String?                @map("reference_externe") @db.VarChar(100)
  modeVentilation  ModeVentilation        @default(FIFO_AUTO) @map("mode_ventilation")
  statut           EncaissementStatus     @default(VALIDE)
  dateEncaissement DateTime               @default(now()) @map("date_encaissement") @db.Timestamptz()
  createdAt        DateTime               @default(now()) @map("created_at") @db.Timestamptz()

  client           Client                 @relation(fields: [clientId], references: [id])
  boutique         Location               @relation(fields: [boutiqueId], references: [id])
  utilisateur      User                   @relation(fields: [userId], references: [id])
  ventilations     VentilationReglement[]
  remboursements   Remboursement[]

  @@map("encaissements")
}

model VentilationReglement {
  id             String       @id @default(uuid()) @db.Uuid
  encaissementId String       @map("encaissement_id") @db.Uuid
  venteId        String       @map("vente_id") @db.Uuid
  montantImpute  Decimal      @map("montant_impute") @db.Decimal(14, 2)
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz()

  encaissement   Encaissement @relation(fields: [encaissementId], references: [id], onDelete: Cascade)
  vente          Vente        @relation(fields: [venteId], references: [id])

  @@map("ventilations_reglement")
}

model Remboursement {
  id                     String            @id @default(uuid()) @db.Uuid
  referenceRemboursement String            @unique @map("reference_remboursement") @db.VarChar(100)
  venteId                String            @map("vente_id") @db.Uuid
  encaissementId         String?           @map("encaissement_id") @db.Uuid
  boutiqueId             String            @map("boutique_id") @db.Uuid
  montant                Decimal           @db.Decimal(14, 2)
  modeRemboursement      ModeRemboursement @map("mode_remboursement")
  auteurId               String            @map("auteur_id") @db.Uuid
  motif                  String            @db.Text
  createdAt              DateTime          @default(now()) @map("created_at") @db.Timestamptz()

  vente                  Vente             @relation(fields: [venteId], references: [id])
  encaissement           Encaissement?     @relation(fields: [encaissementId], references: [id])
  boutique               Location          @relation(fields: [boutiqueId], references: [id])
  auteur                 User              @relation(fields: [auteurId], references: [id])

  @@map("remboursements")
}

model AuditLog {
  id             String   @id @default(uuid()) @db.Uuid
  utilisateurId  String   @map("utilisateur_id") @db.Uuid
  action         String   @db.VarChar(100)
  ressourceType  String   @map("ressource_type") @db.VarChar(50)
  ressourceId    String   @map("ressource_id") @db.Uuid
  ancienneValeur Json?    @map("ancienne_valeur")
  nouvelleValeur Json?    @map("nouvelle_valeur")
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz()

  utilisateur    User     @relation(fields: [utilisateurId], references: [id])

  @@map("audit_log")
}

model ReferenceCompteur {
  cle    String @id @db.VarChar(50)
  valeur Int    @default(0)

  @@map("reference_compteurs")
}
```

---

## 5. Endpoints REST API Principaux

| Module | Méthode | Route | Description | Rôles Autorisés |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/otp/send` | Envoi code OTP (Email/SMS) | Public |
| | `POST` | `/api/v1/auth/otp/verify` | Validation OTP & émission tokens | Public |
| | `POST` | `/api/v1/auth/login` | Connexion classique Boutiquier | Public |
| | `POST` | `/api/v1/auth/refresh` | Renouvellement Access Token | Public (Refresh Token) |
| **Users** | `GET` | `/api/v1/users` | Liste des utilisateurs | OWNER |
| | `POST` | `/api/v1/users` | Création d'un utilisateur & affectation | OWNER |
| | `PATCH` | `/api/v1/users/:id` | Modification / Réassignation boutique | OWNER |
| | `POST` | `/api/v1/users/:id/resend-otp`| Renvoi OTP d'activation SMS | OWNER |
| | `DELETE` | `/api/v1/users/:id` | Désactivation & révocation tokens | OWNER |
| **Locations**| `GET` | `/api/v1/locations` | Liste boutiques et entrepôts | OWNER, BOUTIQUIER |
| | `POST` | `/api/v1/locations` | Création d'une boutique/entrepôt | OWNER |
| | `PATCH` | `/api/v1/locations/:id` | Modification boutique | OWNER |
| **Produits** | `GET` | `/api/v1/produits` | Catalogue complet (avec photos WebP) | Tous |
| | `POST` | `/api/v1/produits` | Création produit (Upload R2) | OWNER |
| **Stocks** | `GET` | `/api/v1/stocks` | Consultation stocks (scopé boutique) | Tous |
| | `POST` | `/api/v1/stocks/entree`| Entrée manuelle de stock | OWNER |
| | `POST` | `/api/v1/stocks/ajustement`| Ajustement physique justifié | OWNER |
| **Ventes** | `POST` | `/api/v1/ventes` | Enregistrement vente directe | BOUTIQUIER |
| | `POST` | `/api/v1/ventes/:id/annuler`| Annulation avec Remboursement de caisse | OWNER, BOUTIQUIER vendeur |
| **Encaissements**| `POST` | `/api/v1/encaissements` | Encaissement (Mode FIFO ou Manuel) | Tous |
| **Sync** | `POST` | `/api/v1/sync/sales` | Synchronisation des ventes offline | BOUTIQUIER |
| | `POST` | `/api/v1/sync/conflicts/:id/arbitrer`| Résolution de conflit d'inventaire | OWNER |
| **Transferts**| `POST` | `/api/v1/transferts/demande`| Demande réapprovisionnement | BOUTIQUIER |
| | `POST` | `/api/v1/transferts/:id/valider`| Validation & sélection source | OWNER (1er disponible) |
| **Reports** | `GET` | `/api/v1/reports/daily/pdf`| Téléchargement rapport PDF journalier | OWNER |
