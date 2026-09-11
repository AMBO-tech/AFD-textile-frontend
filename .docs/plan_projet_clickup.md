# Plan de Projet ClickUp — Référentiel Exact des 52 Tâches
## Plateforme de Gestion de Stock, Ventes et Créances — Secteur Textile

**Version : 4.0 (Synchronisation Totale avec l'Espace ClickUp)**  
**Date : 11 septembre 2026**  
**Équipe : @Abdallah Diouf (Backend), @Mohamed Dieye Tine (Frontend), @El Hadji Boubacar Mbaye (Figma/UX)**  

---

## 👥 1. Répartition par Responsable & Charge Estimée

| Responsable | Rôle | Nombre de Tâches | Charge Estimée |
|---|---|---|---|
| **@Abdallah Diouf** | Lead Backend (NestJS Fastify + Prisma + PostgreSQL) | **22 tâches** | 88 heures |
| **@Mohamed Dieye Tine** | Lead Frontend PWA (React + Vite + Dexie.js + Tailwind) | **18 tâches** | 76 heures |
| **@El Hadji Boubacar Mbaye** | Lead UI/UX Designer (Figma & Design System) | **8 tâches** | 32 heures |
| **DevOps & QA** | Déploiement OVH/Vercel, CI/CD, Tests Playwright & Go-Live | **4 tâches** | 14 heures |
| **TOTAL** | — | **52 tâches** | **210 heures** |

---

# 📁 LISTE EXHAUSTIVE DES 52 TÂCHES CLICKUP

## 🎨 Groupe 1 : Design et Écrans Owner (Figma) — @El Hadji Boubacar Mbaye

1. **[Concevoir le modal de remboursement de caisse]** (Figma) : En-tête facture/client/montant, restitution espèces/Wave/OM/virement, motif obligatoire, impact caisse.
2. **[Concevoir le modal d’encaissement FIFO ou manuel]** (Figma) : Montant et moyen de paiement, toggle FIFO/manuel, ventilation des factures, solde restant, reçu.
3. **[Concevoir l’écran de gestion des emplacements]** (Figma) : Cartes boutiques/entrepôts, modal création/modification, activation/désactivation, responsive.
4. **[Concevoir l’écran de gestion des utilisateurs et vendeurs]** (Figma) : Table utilisateurs, ajout boutiquier avec boutique obligatoire, renvoi OTP, désactivation.
5. **[Concevoir l’écran d’arbitrage des conflits offline]** (Figma) : Badge d’alerte, table des conflits, boutons régularisation stock et annulation/remboursement.

---

## 📱 Groupe 2 : Pages et Modals Owner (Frontend) — @Mohamed Dieye Tine

6. **[Développer la page de gestion des emplacements]** (`LocationsScreen.tsx`) : Cartes, création/modification, activation, synchronisation `LocationsModule`.
7. **[Développer la page de gestion des utilisateurs]** (`UsersScreen.tsx`) : Tableau responsive, création boutiquier, renvoi OTP, réassignation, désactivation.
8. **[Développer la page d’arbitrage des conflits offline]** (`ConflictsScreen.tsx`) : Liste des conflits, actions régulariser stock ou annuler/rembourser.
9. **[Développer le modal de remboursement de vente]** (`RefundModal.tsx`) : Facture/client/montant, modes restitution, motif obligatoire, impact caisse.

---

## ⚙️ Groupe 3 : Nouveaux Modules Backend Métier — @Abdallah Diouf

10. **[Développer le module EncaissementsModule]** : Entité parente `Encaissement`, reçu `REC-YYYY-MM-XXXXX`, FIFO automatique, ventilation manuelle, calcul monnaie rendue.
11. **[Développer le module LocationsModule]** : Endpoints GET, POST, PATCH locations, DTOs, permissions Owner, transactions et audit.
12. **[Développer le module UsersModule]** : CRUD utilisateurs, boutique obligatoire pour boutiquier, renvoi OTP SMS, soft-delete et révocation des refresh tokens.
13. **[Développer l’arbitrage des conflits offline]** (`SyncModule`) : Endpoint d’arbitrage Owner, actions `REGULARISE` (avec justification) et `CANCEL_REFUND`.

---

## 🚀 Groupe 4 : Tâches 01 à 19 (Sprint 1 & Début Sprint 2)

14. **[Task 01 : Design System & UI Components Textile (Figma / v0)]** (@El Hadji) : Tokens Tailwind, pavé numérique `NumericPad`, `FabricCard` avec photos et métrage.
15. **[Task 02 : Maquettage des Écrans Boutiquier Mobile]** (@El Hadji) : Login OTP, caisse/panier tactile, modal découpe rouleau / pesée kilo, reçu.
16. **[Task 03 : Maquettage Console Owner Desktop & Tablette]** (@El Hadji) : Dashboard consolidé, validation transferts, catalogue, journal d’audit.
17. **[Task 04 : Setup Repository Backend NestJS (Fastify + TypeScript)]** (@Abdallah) : NestJS Fastify, ConfigModule, Helmet, CORS, ValidationPipe, GET `/api/v1/health`.
18. **[Task 05 : Setup Repository Frontend React Vite PWA Tailwind]** (@Mohamed) : React 18, Vite, Tailwind/Shadcn, `vite-plugin-pwa`, `PwaInstallBanner`.
19. **[Task 06 : Schéma Prisma PostgreSQL Complet (schema.prisma)]** (@Abdallah) : UUIDv4, modèles complets, Decimal, `ReferenceCompteur`, `Encaissement`, `Remboursement`.
20. **[Task 07 : Triggers SQL d'Intégrité & Contraintes CHECK Métier]** (@Abdallah) : `CHECK (quantite >= 0)`, `CHECK (quantite > 0)`, table `reference_compteurs`, triggers User/Vente.
21. **[Task 08 : Script de Seed Initial Réaliste (prisma/seed.ts)]** (@Abdallah) : Unités, 1 entrepôt, 2 boutiques, 3 Owners, 2 boutiquiers, 12 tissus réalistes.
22. **[Task 09 : Service Passerelle SMS dexchange-sms]** (@Abdallah) : Axios typé, méthode `sendOtp`, timeouts/retry, mock dev/test.
23. **[Task 10 : Service d'Envoi d'Email OTP (SMTP OVH / Nodemailer)]** (@Abdallah) : SMTP SSL OVH port 465, `sendOtpEmail`, template HTML monospace.
24. **[Task 11 : Module d'Authentification OTP & Activation Boutiquier (AuthModule)]** (@Abdallah) : `/auth/otp/send`, `/auth/otp/verify`, activation boutiquier, login.
25. **[Task 12 : Gestionnaire de Session Hebdomadaire (Reset du Lundi)]** (@Abdallah) : Expiration lundi 04h00 UTC, table `refresh_tokens`, cron `0 4 * * 1`.
26. **[Task 13 : Module Cloudflare R2 Upload & Optimisation WebP (MediaModule)]** (@Abdallah) : Client S3/R2, Sharp WebP qualité 80, endpoint upload Owner, headers cache.
27. **[Task 14 : Module Produits & Conversions d'Unités (ProduitsModule)]** (@Abdallah) : `CreateProduitDto`, photo obligatoire, unités de stockage, filtrage stock.
28. **[Task 15 : Module Stock Transactionnel (Verrous SELECT FOR UPDATE)]** (@Abdallah) : `executeMovement` avec verrous SQL ordonnés par ID, invariant stock positif.
29. **[Task 16 : Base de Données Locale IndexedDB avec Dexie.js]** (@Mohamed) : Schéma Dexie v2, tables `products`, `stocks`, `clients`, `offline_queue`.
30. **[Task 17 : Client HTTP Axios avec Intercepteurs & Auto-Refresh Token]** (@Mohamed) : Bearer token, intercepteur 401 avec `/auth/refresh`, rejeu des requêtes.
31. **[Task 18 : Écrans UI d'Authentification & Activation Boutiquier]** (@Mohamed) : `LoginOwnerScreen.tsx`, `LoginBoutiquierScreen.tsx`, `ActivateAccountScreen.tsx`.
32. **[Task 19 : Service de Calcul et Conversion Métier Textile (Mètre/Kilo/Rouleau)]** (@Abdallah) : Fonctions de conversion kg/mètres, rouleaux décapités, tests unitaires Jest.

---

## 📦 Groupe 5 : Tâches 20 à 35 (Sprint 2 & Début Sprint 3)

33. **[Task 20 : Endpoint de Confirmation de Vente Atomique sous Transaction Prisma]** (@Abdallah) : Référence `FAC-...` via `reference_compteurs`, verrous stock, helpers Decimal.
34. **[Task 21 : Vues SQL & Calcul Dynamique des Soldes et Créances]** (@Abdallah) : Calcul `soldeDu` et `statutPaiement` (`NON_PAYE`, `PARTIEL`, `SOLDE`).
35. **[Task 22 : Module de Ventilation FIFO des Règlements Globaux Multi-Créances]** (@Abdallah) : Service d'imputation automatique des créances par ancienneté.
36. **[Task 23 : Grille des Tissus PWA & Recherche Instantanée avec Cache Dexie]** (@Mohamed) : `ProductGrid.tsx`, grille mobile 2 colonnes, badges stock, recherche locale.
37. **[Task 24 : Modal d'Ajout au Panier Multi-Unités (Mètre / Kilo / Rouleau)]** (@Mohamed) : `AddFabricModal.tsx`, onglets mètre/kilo/rouleau décapité, alerte prix min.
38. **[Task 25 : Panier Tactile & Modal de Finalisation de Vente (Comptant / Crédit)]** (@Mohamed) : `CartDrawer.tsx`, `CheckoutModal.tsx`, rattachement client, reçu.
39. **[Task 26 : Écran des Créances Boutique (Vue Mobile & Alertes Ancienneté)]** (@Mohamed) : `CreancesScreen.tsx`, liste débiteurs, factures impayées en accordéon.
40. **[Task 27 : Modal Tactile d'Encaissement Global FIFO avec Pré-ventilation]** (@Mohamed) : `EncaissementModal.tsx`, toggle FIFO/manuel, calcul monnaie rendue.
41. **[Task 28 : SyncWorker & File d'Attente Offline Dexie (SyncManager)]** (@Mohamed) : `syncWorker.ts`, écouteur réseau, flush automatique, décrément prédictif.
42. **[Task 29 : Endpoint Backend de Synchronisation par Lot Idempotent (SyncModule)]** (@Abdallah) : `POST /api/v1/sync/sales`, déduplication UUID, gestion `CONFLICT_STOCK`.
43. **[Task 30 : Module Transferts Inter-Boutiques & Validation Atomique]** (@Abdallah) : Demande réappro, notification 3 Owners, validation 1er disponible avec débit/crédit.
44. **[Task 31 : Annulation de Vente Réversible & Remboursements]** (@Abdallah) : Annulation Owner/Boutiquier vendeur, mouvement inverse stock, sortie caisse `Remboursement`.
45. **[Task 32 : Dashboard Global Consolidé Desktop Owner]** (@Mohamed) : `DashboardScreen.tsx`, KPIs CA/créances/stock, clôture caisse ($\sum \text{Encaissements} - \sum \text{Remboursements}$).
46. **[Task 33 : Journal d'Audit & Gestion des Accès Utilisateurs]** (@Abdallah) : `AuditLogModule`, intercepteurs d'audit, endpoint paginé avec diff JSON.
47. **[Task 34 : Moteur de Génération PDF pour Bilans Textile (PdfGeneratorService)]** (@Abdallah) : `pdfmake`, template élégant, caisse réelle, alertes stock.
48. **[Task 35 : Les 3 Cron Jobs & Envoi Automatique par Email]** (@Abdallah) : Daily 22h30 (`30 22 * * *`), Hebdo dimanche 18h00, Mensuel 1er du mois 06h00.

---

## 🚢 Groupe 6 : Déploiement, Tests et Mise en Production (Tasks 36 à 39)

49. **[Task 36 : Provisioning Serveur VPS OVH (Docker Compose, Nginx SSL, Backups)]** (DevOps) : Fastify + PostgreSQL 16, Nginx Let's Encrypt, backups R2 chiffrés.
50. **[Task 37 : Déploiement Vercel PWA & Pipeline CI/CD GitHub Actions]** (DevOps) : `vercel.json`, headers Service Worker/CDN, workflow GitHub Actions.
51. **[Task 38 : Suite de Tests E2E Playwright (Scénarios Hors-Ligne & Concurrence)]** (QA) : Tests automatisés parcours vente kilo/rouleau, offline, FIFO/manuel, remboursement.
52. **[Task 39 : Recette Métier en Boutique Pilote, Guide 1-page WhatsApp & Go-Live]** (Lead) : Protocole de 10 tests réels en boutique, guide de démarrage, ouverture officielle.
