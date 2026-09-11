# Modélisation des données
## Plateforme de gestion de stock, ventes et créances — Secteur textile

**Version : 6.0**  
**Date : 11 septembre 2026**  

---

## Légende

> 🔑 **Point tranché** — décision actée, à ne plus remettre en question sans raison forte.

---

## 1. Vue d'ensemble du flux

```text
ENTRÉE MANUELLE ─┐
                 ├──► STOCK (mouvements) ──► VENTE / FACTURE ──► ENCAISSEMENT ──► VENTILATION(S)
TRANSFERT ───────┘                                                     │
                                                               (Remboursement de caisse
                                                                  si annulation vente)
```

---

## 2. Rôles et utilisateurs

> 🔑 **Deux rôles uniquement** : `OWNER` (les 3 propriétaires, portée globale) et `BOUTIQUIER` (vendeur, portée limitée à sa boutique).

| Rôle | Portée | Peut | Ne peut pas |
|---|---|---|---|
| `OWNER` | Globale | Tout : stocks, ventes, créances, encaissements, clients, transferts, produits, utilisateurs (CRUD complet), boutiques/entrepôts (CRUD complet), entrées manuelles, ajustements, annulations avec remboursement, audit, dashboards globaux, arbitrage des conflits offline | — |
| `BOUTIQUIER` | Sa boutique uniquement | Voir le stock de sa boutique, enregistrer une vente, enregistrer un encaissement (FIFO ou ventilation manuelle), annuler **ses propres ventes** (avec remboursement de caisse tracé), consulter ventes/créances/encaissements de sa boutique, **demander un transfert (réapprovisionnement)**, voir son dashboard journalier | Modifier les produits, faire une entrée manuelle de stock, faire un ajustement, gérer les utilisateurs/boutiques, valider les transferts, voir les autres boutiques |

> 🔑 **Créances visibles par boutique, pas par vendeur** : un `BOUTIQUIER` voit les créances de toute sa boutique.

### `users`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| nom | varchar | NOT NULL |
| telephone | varchar | UNIQUE, NOT NULL |
| email | varchar | UNIQUE, NULL (utilisé pour les OWNER) |
| mot_de_passe_hash | varchar | NULL (défini lors de la 1ère connexion pour les boutiquiers) |
| premiere_connexion | boolean | NOT NULL, default true |
| otp_code_hash | varchar | NULL (hash du code temporaire) |
| otp_expires_at | timestamptz | NULL |
| role | enum('OWNER','BOUTIQUIER') | NOT NULL |
| location_id | FK → locations.id | NULL si OWNER ; NOT NULL + type BOUTIQUE si BOUTIQUIER |
| actif | boolean | NOT NULL, default true |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

> 🔑 **Authentification & OTP** :
> - **OWNER** : Connexion par code OTP envoyé par **Email** si `email` est renseigné ; sinon envoi par **SMS** via la passerelle `dexchange-sms`.
> - **BOUTIQUIER** : Créé par un `OWNER` (sans mot de passe au départ). À la première connexion, le boutiquier saisit son téléphone, reçoit un OTP par SMS (`dexchange-sms`), valide son compte (`premiere_connexion = false`) et configure son mot de passe. Les connexions suivantes se font via Téléphone + Mot de passe.

> 🔑 **Gestion des sessions (Access Token + Refresh Token)** :
> - Access Token (durée courte : 15 min).
> - Refresh Token stocké dans `refresh_tokens` (durée max : 7 jours, avec expiration hebdomadaire le lundi pour forcer le renouvellement sécurisé).
> - Révocation instantanée de tous les Refresh Tokens dès qu'un compte passe à `actif = false`.

### `refresh_tokens`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| user_id | FK → users.id | NOT NULL |
| token_hash | varchar | NOT NULL, UNIQUE |
| expires_at | timestamptz | NOT NULL |
| revoked_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |

### `locations`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| type | enum('ENTREPOT','BOUTIQUE') | NOT NULL |
| nom | varchar | NOT NULL |
| adresse | varchar | |
| telephone | varchar | |
| actif | boolean | NOT NULL, default true |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

---

## 3. Produits, Unités et Gestion Textile

> 🔑 **Unités de stockage & flexibilité textile** :
> 1. Chaque tissu a son **unité de stockage principale** (`unite_stockage` : `METRE`, `KG`, ou `ROULEAU`).
> 2. **Tissus au Rouleau** : Le produit porte sa `longueur_rouleau_metres` contractuelle/standard (ex: 30m ou 6 yards pour le Wax). Lors de la vente, le boutiquier peut :
>    - Vendre un **rouleau complet** (le stock décrémente 1 rouleau ou X mètres).
>    - **Décapiter / couper le rouleau** : Vente au mètre qui entame le rouleau et décrémente la quantité exacte de mètres.
> 3. **Tissus au Kilo** : La table `produits` porte le grammage `poids_au_metre_kg`. Lors de la vente à la balance, la quantité en kg saisie est décrémentée directement ou convertie en mètres.
> 4. **Table `unite_conversions`** : Conservée en base comme infrastructure d'extensibilité pour les évolutions futures.

### `unites`
| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| code | varchar | UNIQUE (ex: 'metre', 'kg', 'rouleau', 'yard') |
| nom | varchar | NOT NULL |

### `unite_conversions` (Socle d'évolutivité future)
| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| unite_source_id | FK → unites.id | NOT NULL |
| unite_cible_id | FK → unites.id | NOT NULL |
| facteur | numeric(18,6) | NOT NULL |
| UNIQUE | (unite_source_id, unite_cible_id) | |

### `produits`
| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| reference | varchar | UNIQUE |
| nom | varchar | NOT NULL |
| categorie | varchar | |
| couleur | varchar | |
| motif | varchar | |
| photo_url | text | NOT NULL (photo du tissu obligatoire pour reconnaissance visuelle) |
| unite_stockage | enum('METRE','KG','ROULEAU') | NOT NULL, default 'METRE' |
| unite_principale_id | FK → unites.id | NOT NULL |
| prix_indicatif | numeric(14,2) | NOT NULL (prix par défaut à l'unité de stockage) |
| prix_minimum | numeric(14,2) | NULL (seuil d'alerte non bloquant pour négociation) |
| longueur_rouleau_metres | numeric(10,2) | NULL (renseigné si le produit est stocké/vendu en rouleau) |
| poids_au_metre_kg | numeric(10,4) | NULL (grammage propre au produit pour la vente au kilo) |
| statut | enum('ACTIF','INACTIF') | NOT NULL, default 'ACTIF' |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

---

## 4. Stock et Mouvements

### `stocks`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| produit_id | FK → produits.id | NOT NULL |
| location_id | FK → locations.id | NOT NULL |
| quantite | numeric(18,3) | NOT NULL, default 0 |
| updated_at | timestamptz | NOT NULL |
| UNIQUE | (produit_id, location_id) | |
| CHECK | `quantite >= 0` | **Invariant absolu, aucune exception — zéro stock négatif** |

> 🔑 **Verrouillage transactionnel** : `SELECT ... FOR UPDATE` par ordre croissant d'ID lors de toute opération multi-lignes pour prévenir les interblocages (*deadlocks*).

### `mouvements_stock`

Table **append-only**. Toute correction se fait par mouvement inverse (`ANNULATION`).

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| type | enum('ENTREE_MANUELLE','VENTE','TRANSFERT','AJUSTEMENT','RETOUR','PERTE','ANNULATION') | NOT NULL |
| sens | enum('ENTREE','SORTIE') | NOT NULL |
| produit_id | FK → produits.id | NOT NULL |
| quantite | numeric(18,3) | NOT NULL |
| unite_utilisee | varchar | NOT NULL (ex: 'metre', 'kg', 'rouleau') |
| location_id | FK → locations.id | NOT NULL |
| justification | text | NULL |
| reference_type | varchar | ex: 'vente', 'transfert', 'ajustement' |
| reference_id | uuid | NULL selon type |
| utilisateur_id | FK → users.id | NOT NULL |
| created_at | timestamptz | NOT NULL |
| CHECK | `quantite > 0` | |
| CHECK | `type <> 'AJUSTEMENT' OR justification IS NOT NULL` | |

---

## 5. Transferts & Réapprovisionnement

### `transferts`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| reference | varchar | UNIQUE |
| location_source_id | FK → locations.id | NULL si demande initiale de réappro ; NOT NULL dès validation |
| location_destination_id | FK → locations.id | NOT NULL (boutique demandeuse) |
| statut | enum('DEMANDE','EN_TRANSIT','VALIDE','ANNULE') | NOT NULL, default 'DEMANDE' |
| demande_par_id | FK → users.id | NOT NULL (Boutiquier ou Owner) |
| valide_par_id | FK → users.id | NULL (premier Owner disponible qui valide) |
| motif_annulation | text | NULL |
| annule_par_id | FK → users.id | NULL |
| validated_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

> 🔑 **Workflow multi-owners réactif** :
> 1. Le Boutiquier fait une demande de réapprovisionnement pour sa boutique (`statut = 'DEMANDE'`).
> 2. Les 3 Owners reçoivent la notification push/SMS.
> 3. Le **premier Owner disponible** ouvre la demande, sélectionne l'emplacement source (*Entrepôt Central* ou *Boutique B*) et valide.
> 4. Le transfert s'exécute atomiquement en DB : débit de la source (`SORTIE`) et crédit de la destination (`ENTREE`).

### `lignes_transfert`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| transfert_id | FK → transferts.id | NOT NULL |
| produit_id | FK → produits.id | NOT NULL |
| quantite | numeric(18,3) | NOT NULL |
| unite | varchar | NOT NULL |

---

## 6. Ventes (Factures Commerciales Unifiées)

> 🔑 **Unification Vente = Facture** : La table `ventes` est le document commercial officiel. Elle contient les champs financiers pour le suivi direct du statut de paiement sans nécessiter de table `factures` redondante.

### `ventes`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| reference_facture | varchar | UNIQUE, NOT NULL (ex: `FAC-2026-09-00142`) |
| boutique_id | FK → locations.id | NOT NULL (type BOUTIQUE) |
| vendeur_id | FK → users.id | NOT NULL |
| client_id | FK → clients.id | NULL si vente comptant anonyme ; NOT NULL dès qu'il y a crédit |
| statut | enum('DRAFT','CONFIRMED','CANCELLED','EN_CONFLIT') | NOT NULL, default 'CONFIRMED' |
| statut_paiement | enum('NON_PAYE','PARTIEL','SOLDE') | NOT NULL, default 'NON_PAYE' |
| montant_total | numeric(14,2) | NOT NULL |
| montant_paye | numeric(14,2) | NOT NULL, default 0 (somme des ventilations confirmées) |
| solde_du | numeric(14,2) | NOT NULL (montant_total - montant_paye) |
| date_echeance | timestamptz | NULL (date limite de paiement si crédit accordé) |
| synchronisation_status | enum('SYNCED','PENDING','CONFLICT_STOCK') | NOT NULL, default 'SYNCED' |
| motif_annulation | text | NULL |
| annule_par_id | FK → users.id | NULL (Owner OU Boutiquier vendeur d'origine) |
| annule_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

> 🔑 **Annulation de vente & Droit du Vendeur** :
> - L'**Owner** et le **Boutiquier auteur de la vente** peuvent tous deux annuler la vente.
> - L'annulation déclenche : (1) Restitution du stock via mouvement `ANNULATION`, (2) Génération d'un enregistrement **`Remboursement`** dans le journal de caisse si la vente avait été encaissée.

### `lignes_vente`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| vente_id | FK → ventes.id | NOT NULL |
| produit_id | FK → produits.id | NOT NULL |
| quantite | numeric(18,3) | NOT NULL |
| unite_saisie | varchar | NOT NULL (ex: 'metre', 'kg', 'rouleau') |
| longueur_decoupe_metres | numeric(10,2) | NULL (si découpe d'un rouleau) |
| prix_unitaire_applique | numeric(14,2) | NOT NULL |
| remise_montant | numeric(14,2) | NOT NULL, default 0 |
| total_ligne | numeric(14,2) | NOT NULL |

### `reference_compteurs` (Compteur atomique anti-collisions)

| Colonne | Type | Contrainte |
|---|---|---|
| cle | varchar(50) | PK (ex: 'FAC-2026-09') |
| valeur | integer | NOT NULL, default 0 |

> 🔑 **Génération atomique des factures** : L'incrémentation sous verrou Postgres `INSERT ... ON CONFLICT (cle) DO UPDATE SET valeur = valeur + 1 RETURNING valeur` garantit des numéros séquentiels stricts sans trou ni doublon sous forte concurrence.

---

## 7. Encaissements, Ventilations & Remboursements (Audit Financier & Caisse)

### `encaissements` (Reçu de paiement global)

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| reference_recu | varchar | UNIQUE, NOT NULL (ex: `REC-2026-09-00089`) |
| client_id | FK → clients.id | NOT NULL |
| boutique_id | FK → locations.id | NOT NULL |
| user_id | FK → users.id | NOT NULL (personne ayant encaissé) |
| montant_total | numeric(14,2) | NOT NULL |
| mode_paiement | enum('ESPECES','WAVE','ORANGE_MONEY','CHEQUE','VIREMENT','AUTRE') | NOT NULL |
| reference_externe | varchar | NULL (numéro transaction Wave/OM ou chèque) |
| mode_ventilation | enum('FIFO_AUTO','MANUELLE') | NOT NULL, default 'FIFO_AUTO' |
| statut | enum('VALIDE','ANNULE') | NOT NULL, default 'VALIDE' |
| date_encaissement | timestamptz | NOT NULL |
| created_at | timestamptz | NOT NULL |

### `ventilations_reglement` (Lignes d'imputation aux factures)

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| encaissement_id | FK → encaissements.id | NOT NULL |
| vente_id | FK → ventes.id | NOT NULL |
| montant_impute | numeric(14,2) | NOT NULL |
| created_at | timestamptz | NOT NULL |

> 🔑 **Validation financière stricte** :
> - En mode `FIFO_AUTO` : Le système impute l'argent sur les factures impayées du client par ordre d'ancienneté (`created_at ASC`).
> - En mode `MANUELLE` : Le boutiquier spécifie les montants sur les factures voulues, avec la contrainte stricte : $\sum \text{montant\_impute} \le \text{montant\_total}$.
> - À chaque enregistrement, `ventes.montant_paye` et `ventes.statut_paiement` sont mis à jour instantanément dans la même transaction.

### `remboursements` (Traçabilité des sorties de caisse)

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid | PK (UUIDv4) |
| reference_remboursement | varchar | UNIQUE, NOT NULL (ex: `RMB-2026-09-00012`) |
| vente_id | FK → ventes.id | NOT NULL |
| encaissement_id | FK → encaissements.id | NULL |
| boutique_id | FK → locations.id | NOT NULL |
| montant | numeric(14,2) | NOT NULL |
| mode_remboursement | enum('ESPECES','WAVE','ORANGE_MONEY','VIREMENT') | NOT NULL |
| auteur_id | FK → users.id | NOT NULL (Owner ou Boutiquier) |
| motif | text | NOT NULL |
| created_at | timestamptz | NOT NULL |

> 🔑 **Calcul exact de la caisse journalière** :
> $$\text{Caisse Réelle Espèces} = \sum \text{Encaissements Espèces} - \sum \text{Remboursements Espèces}$$

---

## 8. Synchronisation & Résolution des Conflits Offline

```text
VENTE HORS-LIGNE (IndexedDB / UUIDv4) ──► SYNC RECONNEXION
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
         [ STOCK SUFFISANT ]                                         [ STOCK INSUFFISANT ]
                 │                                                             │
        statut = 'CONFIRMED'                                       statut = 'EN_CONFLIT'
        sync = 'SYNCED'                                            sync = 'CONFLICT_STOCK'
        Stock décrémenté                                           Alerte immédiate Owner
                                                                               │
                                                               ┌───────────────┴───────────────┐
                                                               ▼                               ▼
                                                        [ AJUSTEMENT ]                  [ ANNULATION ]
                                                      Owner régularise                 Vente annulée &
                                                      stock physique                 Client remboursé
```

---

## 9. Schéma Relationnel Synthétique

```text
locations ──< users
locations ──< stocks >── produits
locations ──< mouvements_stock
locations ──< transferts (source & destination)
locations ──< ventes (boutique)
locations ──< encaissements
locations ──< remboursements

produits ──< lignes_vente / stocks / mouvements_stock / lignes_transfert
produits >── unites (unite_principale)

clients ──< ventes
clients ──< encaissements

ventes ──< lignes_vente
ventes ──< ventilations_reglement >── encaissements
ventes ──< remboursements
ventes >── users (vendeur, annule_par)

users ──< encaissements
users ──< remboursements
users ──< audit_log
```
