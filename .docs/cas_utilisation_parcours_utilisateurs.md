# Cas d'utilisation et parcours utilisateurs
## Plateforme de gestion de stock, ventes et créances — Secteur textile

**Version : 3.0**  
**Date : 11 septembre 2026**  
**Document compagnon de : `modelisation_stock_creances.md` (v6.0)**  

---

## Légende

> 🔑 Règle métier tranchée (référence aux points tranchés du document de modélisation v6.0).

---

## 1. Portée

Ce document décrit **tous** les cas d'utilisation et parcours de bout en bout du système, sur le périmètre retenu : gestion du stock (entrepôt/boutique), transferts et réapprovisionnements, ventes/factures, encaissements (FIFO ou ventilation manuelle), créances, remboursements et arbitrage des conflits offline.

## 2. Acteurs

| Acteur | Description |
|---|---|
| **OWNER** | Un des 3 propriétaires. Portée globale sur toutes les boutiques et entrepôts. |
| **BOUTIQUIER** | Vendeur rattaché à une boutique unique. Portée limitée à sa boutique. |

---

## 3. Matrice synthétique des cas d'utilisation

| ID | Cas d'utilisation | Acteur |
|---|---|---|
| UC-01 | Se connecter (OTP Email/SMS pour Owner ; Tel+MDP / OTP SMS pour Boutiquier) | OWNER, BOUTIQUIER |
| UC-02 | Gérer les utilisateurs (Créer, modifier, affecter boutique, renvoyer OTP, désactiver) | OWNER |
| UC-03 | Gérer les emplacements (Créer, modifier, activer/désactiver Boutiques et Entrepôts) | OWNER |
| UC-04 | Créer un produit (avec photo, unité de stockage, longueur rouleau / poids kilo) | OWNER |
| UC-05 | Modifier un produit (prix indicatif / prix minimum d'alerte) | OWNER |
| UC-06 | Définir des conversions d'unités (Socle d'évolutivité future) | OWNER |
| UC-07 | Consulter le stock | OWNER, BOUTIQUIER (sa boutique) |
| UC-08 | Faire une entrée manuelle de stock | OWNER |
| UC-09 | Faire un ajustement de stock (avec justification obligatoire) | OWNER |
| UC-10 | Demander un réapprovisionnement (Demande de transfert) | BOUTIQUIER |
| UC-11 | Valider et exécuter un transfert (Premier Owner disponible, sélection de la source) | OWNER |
| UC-12 | Créer et exécuter un transfert directement | OWNER |
| UC-13 | Annuler un transfert (avant validation ou après validation avec rollback stock) | OWNER |
| UC-14 | Créer une vente / facture (Brouillon, gestion rouleaux décapités / kilos / mètres) | BOUTIQUIER |
| UC-15 | Confirmer une vente / facture (Décrément stock instantané et verrou SQL) | BOUTIQUIER |
| UC-16 | Enregistrer un encaissement global (Mode FIFO auto ou Ventilation manuelle) | BOUTIQUIER, OWNER |
| UC-17 | Annuler une vente avec traçabilité du remboursement de caisse | OWNER, BOUTIQUIER (vendeur) |
| UC-18 | Rattacher/créer un client sur une vente à crédit | BOUTIQUIER |
| UC-19 | Consulter les créances et l'état des factures (Statut: NON_PAYE, PARTIEL, SOLDE) | OWNER, BOUTIQUIER (sa boutique) |
| UC-20 | Consulter le journal d'audit | OWNER |
| UC-21 | Arbitrer les conflits de synchronisation Offline (Stock insuffisant) | OWNER |
| UC-22 | Consulter le dashboard journalier et la clôture de caisse | BOUTIQUIER |
| UC-23 | Consulter le dashboard global consolidé | OWNER |
| UC-24 | Télécharger & recevoir les rapports PDF automatiques (Crons Email) | OWNER |

---

## 4. Cas d'utilisation détaillés

### 4.1 Authentification et administration

#### UC-01 — Se connecter
- **Acteur** : OWNER, BOUTIQUIER
- **Précondition** : compte `actif = true`
- **Flux 1 — Connexion OWNER (OTP)** :
  1. Saisie Email ou Téléphone.
  2. Envoi OTP (Email prioritaire, ou SMS `dexchange-sms`).
  3. Validation de l'OTP (5 min de validité) $\rightarrow$ Tokens JWT (Access 15m, Refresh 7j) $\rightarrow$ Dashboard global.
- **Flux 2 — Connexion BOUTIQUIER (Quotidienne)** :
  1. Saisie Téléphone + Mot de passe personnel $\rightarrow$ Dashboard boutique.
- **Flux 3 — Première connexion BOUTIQUIER (Activation)** :
  1. Saisie Téléphone $\rightarrow$ Réception OTP par SMS $\rightarrow$ Définition du mot de passe personnel $\rightarrow$ Compte activé.

#### UC-02 — Gérer les utilisateurs (UsersModule)
- **Acteur** : OWNER
- **Flux nominal** :
  1. Création d'un boutiquier avec affectation obligatoire à une boutique (`location.type = 'BOUTIQUE'`).
  2. Modification des informations ou réaffectation à une autre boutique.
  3. Renvoyer un code OTP d'activation SMS si le boutiquier ne l'a pas reçu.
  4. Désactivation d'un compte (`actif = false`) $\rightarrow$ révocation instantanée de tous ses Refresh Tokens.

#### UC-03 — Gérer les emplacements (LocationsModule)
- **Acteur** : OWNER
- **Flux nominal** : Création, modification et activation/désactivation des points de vente (Boutiques) et des lieux de stockage centraux (Entrepôts).

---

### 4.2 Produits et gestion textile

#### UC-04 — Créer un produit
- **Acteur** : OWNER
- **Flux nominal** :
  1. Saisie nom, catégorie, couleur, motif.
  2. **Photo obligatoire du tissu** (upload Cloudflare R2 avec compression WebP).
  3. Sélection de l'unité de stockage (`METRE`, `KG`, `ROULEAU`).
  4. Si rouleau : saisie de la `longueur_rouleau_metres` contractuelle/standard (ex: 30m ou 6 yards).
  5. Si vente au kilo : saisie du grammage `poids_au_metre_kg`.
  6. Saisie `prix_indicatif` et `prix_minimum` (seuil d'avertissement pour négociation).

#### UC-05 — Modifier un produit
- **Acteur** : OWNER
- **Flux nominal** : Mise à jour des prix, visuels ou seuils. Les ventes passées conservent leur prix unitaire figé.

---

### 4.3 Stock, Réapprovisionnement & Transferts

#### UC-07 — Consulter le stock
- **Acteur** : OWNER (toutes localisations), BOUTIQUIER (sa boutique uniquement)
- **Règle** : Filtrage strict backend `location_id` pour le rôle BOUTIQUIER.

#### UC-08 — Faire une entrée manuelle de stock
- **Acteur** : OWNER
- **Flux nominal** : Sélection produit + localisation + quantité $\rightarrow$ Transaction avec `SELECT ... FOR UPDATE`, écriture `mouvement_stock` (`ENTREE_MANUELLE`), incrément du stock.

#### UC-09 — Faire un ajustement de stock
- **Acteur** : OWNER
- **Flux nominal** : Ajustement suite à inventaire physique (`ENTREE` ou `SORTIE`) avec **justification obligatoire**. Invariant `quantite >= 0` strictement respecté.

#### UC-10 — Demander un réapprovisionnement (Transfert)
- **Acteur** : BOUTIQUIER
- **Flux nominal** :
  1. Le boutiquier constate un besoin dans sa boutique.
  2. Sélectionne les tissus et quantités demandés.
  3. Valide la demande (`statut = 'DEMANDE'`).
  4. Les 3 Owners reçoivent une notification push/SMS.

#### UC-11 — Valider et exécuter un transfert (Multi-Owners)
- **Acteur** : OWNER (le premier disponible)
- **Flux nominal** :
  1. L'un des 3 Owners ouvre la demande en attente.
  2. Choisit l'emplacement source (*Entrepôt Central* ou *Boutique B*).
  3. Modifie éventuellement les quantités si nécessaire.
  4. Valide le transfert : transaction atomique verrouillant les stocks source et destination, débit source (`SORTIE`) et crédit destination (`ENTREE`), statut $\rightarrow$ `VALIDE`.

#### UC-13 — Annuler un transfert
- **Acteur** : OWNER
- **Règle** : Si transfert `VALIDE`, annulation possible uniquement si le stock de destination n'a pas encore été consommé $\rightarrow$ mouvements inverses automatiques.

---

### 4.4 Ventes, Facturation & Encaissements

#### UC-14 — Créer une vente / facture (Brouillon)
- **Acteur** : BOUTIQUIER
- **Flux nominal** :
  1. Sélection des tissus via la galerie photo ou la recherche rapide.
  2. Saisie des quantités avec flexibilité textile :
     - Au mètre.
     - Au kilo (pesée calculant la quantité exacte).
     - Au rouleau entier OU rouleau décapité (saisie de la longueur coupée en mètres).
  3. Ajustement du prix unitaire négocié (alerte UI si < `prix_minimum`).
  4. Vente en statut `DRAFT`.

#### UC-15 — Confirmer une vente / facture
- **Acteur** : BOUTIQUIER
- **Flux nominal (Transaction unique)** :
  1. `SELECT ... FOR UPDATE` sur les stocks.
  2. Vérification stricte `stock >= quantite`.
  3. Si crédit : vérification de la présence d'un client rattaché (`client_id`).
  4. Décrément du stock et génération des `mouvements_stock`.
  5. Attribution de la référence unique de facture (ex: `FAC-2026-09-00142`).
  6. Vente $\rightarrow$ `CONFIRMED`.

#### UC-16 — Enregistrer un encaissement (Double Mode)
- **Acteur** : BOUTIQUIER (sa boutique), OWNER (toutes boutiques)
- **Flux nominal** :
  1. Saisie du montant global reçu et du mode de paiement (`ESPECES`, `WAVE`, `ORANGE_MONEY`, `CHEQUE`).
  2. Choix du mode de ventilation :
     - **Mode 1 : FIFO Automatique (Par défaut)** : Imputation automatique sur les factures les plus anciennes.
     - **Mode 2 : Ventilation Manuelle** : Le boutiquier répartit librement le montant sur les factures spécifiques de son choix.
  3. Transaction : Création de l'entité parente `Encaissement` (reçu global) + insertion des `VentilationsReglement` + mise à jour instantanée de `montant_paye`, `solde_du` et `statut_paiement` (`NON_PAYE`, `PARTIEL`, `SOLDE`) sur chaque vente.

#### UC-17 — Annuler une vente avec Remboursement de Caisse
- **Acteur** : OWNER ou BOUTIQUIER (ayant réalisé la vente)
- **Flux nominal** :
  1. Saisie du motif d'annulation.
  2. Transaction atomique :
     - Restitution du stock via mouvement `ANNULATION` (`ENTREE`).
     - Si la vente avait déjà été encaissée : génération automatique d'un enregistrement **`Remboursement`** (`mouvement_caisse: SORTIE`, mode de restitution, motif, auteur).
     - Vente $\rightarrow$ `CANCELLED`.
     - Entrée dans l'`audit_log`.

---

### 4.5 Synchronisation & Conflits Offline

#### UC-21 — Arbitrer un conflit de synchronisation offline
- **Acteur** : OWNER
- **Contexte** : Une vente passée hors-ligne ne peut pas être décrémentée à la reconnexion car le stock central a été épuisé entre-temps.
- **Flux nominal** :
  1. La vente est isolée avec `synchronisation_status = 'CONFLICT_STOCK'` et `statut = 'EN_CONFLIT'`.
  2. L'Owner reçoit une alerte sur son dashboard avec 2 options en 1 clic :
     - **Option A : Régulariser le stock physique** $\rightarrow$ Création automatique d'un `AJUSTEMENT` et validation de la vente en `CONFIRMED`.
     - **Option B : Annuler la vente et rembourser le client** $\rightarrow$ Clôture du conflit et génération du `Remboursement`.

---

### 4.6 Dashboards, Caisse & Rapports PDF

#### UC-22 — Dashboard journalier & Clôture de caisse Boutiquier
- **Acteur** : BOUTIQUIER
- **Contenu** : Total ventes du jour, solde caisse théorique ($\sum \text{Encaissements Espèces} - \sum \text{Remboursements Espèces}$), créances de la boutique.

#### UC-23 — Dashboard global Owner
- **Acteur** : OWNER
- **Contenu** : Chiffre d'affaires global consolidé, encaissements par moyen de paiement, valorisation du stock, alertes de réapprovisionnement et arbitrage des conflits.

#### UC-24 — Rapports PDF Automatiques (Crons Email)
- **Acteur** : OWNER
- **Rapports programmés** :
  - **Quotidien à 22h30** : Bilan de la journée par boutique, caisses et créances.
  - **Hebdomadaire (Dimanche 18h00)** : Synthèse hebdo et performance commerciale.
  - **Mensuel (1er du mois à 06h00)** : Rapport financier consolidé et valorisation du stock.

---

## 5. Parcours Utilisateurs Clés

### P-01 — Vente d'un tissu au rouleau (décapité ou entier)
```
BOUTIQUIER
  → Sélectionne "Wax Hollande - Motif Floral" (Unité: ROULEAU, 30m par rouleau)
  → Option A : Choisit "1 Rouleau complet" → Quantité = 30m
  → Option B : Choisit "Décapiter / Vente au mètre" → Saisit 8,5 mètres
  → Confirme la vente → Le stock est décrémenté exactement du métrage vendu
```

### P-02 — Encaissement multi-factures avec ventilation manuelle
```
BOUTIQUIER
  → Client "Amadou Kane" verse 80 000 FCFA en Wave
  → Ouvre "Encaisser un règlement"
  → Bascule sur "Ventilation Manuelle" :
      - Facture A (mariage d'hier) : 50 000 FCFA
      - Facture B (dette ancienne) : 30 000 FCFA
  → Valide → 1 Reçu d'Encaissement créé + 2 Ventilations enregistrées + Facture A soldée
```

### P-03 — Annulation par le Boutiquier avec traçabilité de caisse
```
BOUTIQUIER
  → Annule une vente de 25 000 FCFA payée en espèces 10 minutes plus tôt
  → Saisit le motif : "Erreur de motif tissu constatée par le client"
  → Système : 
      1. Restaure le stock en boutique (+25m)
      2. Crée le Remboursement de 25 000 FCFA (Sortie de caisse espèces)
  → Le total espèces attendu en caisse diminue immédiatement de 25 000 FCFA
```

### P-04 — Demande de réapprovisionnement et validation Multi-Owners
```
BOUTIQUIER (Boutique Dakar)
  → Crée une demande de réapprovisionnement de 100m de Soie
OWNERS (3 Propriétaires)
  → Reçoivent tous les 3 la notification push/SMS
  → Owner 1 (le premier disponible) ouvre l'application
  → Sélectionne la source : "Entrepôt Central"
  → Valide le transfert → Le stock de l'entrepôt est débité et Dakar est approvisionné
```
