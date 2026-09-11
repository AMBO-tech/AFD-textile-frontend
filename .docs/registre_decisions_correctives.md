# Registre des Décisions Correctives & Gardes-Fous Techniques
## Plateforme de Gestion de Stock, Ventes et Créances — Secteur Textile

**Version : 1.0 (Finale)**  
**Date : 11 septembre 2026**  
**Portée : Document normatif suprême — En cas de divergence avec d'autres documents, CE document fait foi.**

---

## 🎯 1. Résumé des Arbitrages Métier & Simplifications MVP

| Sujet | Décision Validée pour le MVP | Règle Opérationnelle |
|---|---|---|
| **Surplus de Paiement** | **Rendu de monnaie direct** (Pas d'avoir, pas de garde d'argent). | Si le client donne 100 000 FCFA pour une dette de 80 000 FCFA : l'interface affiche *"Monnaie à rendre : 20 000 FCFA"*. L'encaissement enregistré est de **80 000 FCFA** (la caisse encaisse 100k et sort 20k de monnaie, impact net = 80k). |
| **Réaffectation Vendeur** | **Gestion simple (MVP < 20 users)**. | L'Owner peut modifier le rattachement boutique d'un vendeur dans `UsersModule`. Le trigger SQL vérifie simplement la cohérence en direct. |
| **Routes Auth** | **Routes courtes standardisées**. | `/api/v1/auth/otp/send` et `/api/v1/auth/otp/verify`. |
| **Horaires Crons** | **22h30** (Rapport journalier) & **Lundi 04h00** (Reset sessions). | `30 22 * * *` (fermeture des boutiques) et `0 4 * * 1` (renouvellement de sécurité hebdo). |

---

## 🛡️ 2. Les 8 Gardes-Fous Techniques Obligatoires (Anti-Bugs)

### 1. Comparaisons d'égalité sur `Prisma.Decimal` (Jamais `===`)
`Prisma.Decimal` est un objet `decimal.js`. Faire `soldeDu === 0` renvoie `false`.
* **Règle absolue** : Utiliser le helper centralisé `src/common/money.ts` :
```typescript
import { Prisma } from '@prisma/client';

export function computeStatutPaiement(
  montantTotal: Prisma.Decimal,
  montantPaye: Prisma.Decimal,
): 'NON_PAYE' | 'PARTIEL' | 'SOLDE' {
  if (montantPaye.gte(montantTotal)) return 'SOLDE';
  if (montantPaye.gt(0)) return 'PARTIEL';
  return 'NON_PAYE';
}

export function computeSoldeDu(
  montantTotal: Prisma.Decimal,
  montantPaye: Prisma.Decimal,
): Prisma.Decimal {
  if (montantPaye.gte(montantTotal)) return new Prisma.Decimal(0);
  return montantTotal.sub(montantPaye);
}
```

---

### 2. Génération Sérialisée des Références Factures (Anti-Collision P2002)
Pour éviter les doublons lors des ventes simultanées entre plusieurs boutiques :
* **Modèle Prisma dans `schema.prisma`** :
```prisma
model ReferenceCompteur {
  cle    String @id @db.VarChar(50)
  valeur Int    @default(0)

  @@map("reference_compteurs")
}
```
* **Table SQL dédiée** dans la migration initiale :
```sql
CREATE TABLE reference_compteurs (
  cle VARCHAR(50) PRIMARY KEY,
  valeur INTEGER NOT NULL DEFAULT 0
);
```
* **Incrémentation atomique dans la transaction Prisma** :
```typescript
const moisCle = `FAC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

const res = await tx.$queryRaw<Array<{ valeur: number }>>`
  INSERT INTO reference_compteurs (cle, valeur)
  VALUES (${moisCle}, 1)
  ON CONFLICT (cle) DO UPDATE SET valeur = reference_compteurs.valeur + 1
  RETURNING valeur;
`;

const numeroSeq = String(res[0].valeur).padStart(5, '0');
const referenceFacture = `${moisCle}-${numeroSeq}`; // ex: FAC-2026-09-00042
```

---

### 3. Prévention des Deadlocks Multi-Lignes (Tri par ID)
Lorsqu'une vente ou un transfert touche plusieurs produits, toujours **trier les lignes par `produitId` croissant** avant d'exécuter la boucle de verrous `SELECT ... FOR UPDATE` :
```typescript
const lignesTriees = [...lignesVente].sort((a, b) => a.produitId.localeCompare(b.produitId));
for (const ligne of lignesTriees) {
  await stockService.executeMovement(tx, { ... });
}
```

---

### 4. Justification Obligatoire lors de l'Arbitrage de Conflit Offline
La table `mouvements_stock` possède une contrainte `CHECK (type <> 'AJUSTEMENT' OR justification IS NOT NULL)`.
* Dans `SyncService.arbitrer()` lors du choix `REGULARISE` :
```typescript
await this.stockService.executeMovement(tx, {
  produitId: ligne.produitId,
  locationId: vente.boutiqueId,
  quantite: manque,
  sens: 'ENTREE',
  type: 'AJUSTEMENT',
  uniteUtilisee: ligne.uniteSaisie,
  utilisateurId: ownerId,
  justification: `Arbitrage conflit ${vente.referenceFacture} — régularisation physique`,
  referenceType: 'sync_conflict',
  referenceId: conflictId,
});
```

---

### 5. Soft-Delete Utilisateurs & Révocation Instantanée des Tokens
Pour préserver l'intégrité des clés étrangères sur l'historique des ventes et de l'audit :
```typescript
async deactivateUser(userId: string, ownerId: string) {
  return this.prisma.$transaction([
    this.prisma.user.update({
      where: { id: userId },
      data: { actif: false },
    }),
    this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
```

---

### 6. Anti-Flood sur l'Authentification OTP SMS
* Maximum **3 demandes d'envoi OTP / 15 minutes / numéro**.
* Maximum **5 tentatives de validation erronées** avant blocage temporaire de 15 minutes.

---

### 7. Configuration Cloudflare R2 (CORS & Cache Immutable)
* Configurer les règles CORS du bucket R2 pour autoriser le domaine frontend Vercel.
* Header HTTP obligatoire lors de l'upload des images de tissus :
  `Cache-Control: public, max-age=31536000, immutable`.

---

### 8. Épinglage Strict des Versions Dépendances
* **Node.js** : 20.x LTS
* **Backend** : NestJS 10.x, `@nestjs/platform-fastify` 10.x (Fastify 4.x), `@fastify/helmet` ^11, Prisma 6.x, `sharp` ^0.33.
* **Frontend** : React 18.x, Vite 5.x, `vite-plugin-pwa` ^0.21, Dexie.js ^4.x, TailwindCSS ^3.4.

---

## 🚀 3. Table des Endpoints REST Officiels

```text
POST   /api/v1/auth/otp/send             { identifier }
POST   /api/v1/auth/otp/verify           { identifier, otpCode }
POST   /api/v1/auth/boutiquier/activate  { telephone, otpCode, nouveauMotDePasse }
POST   /api/v1/auth/boutiquier/login     { telephone, motDePasse }
POST   /api/v1/auth/refresh              { refreshToken }

GET    /api/v1/users                     (OWNER)
POST   /api/v1/users                     (OWNER)
PATCH  /api/v1/users/:id                 (OWNER)
POST   /api/v1/users/:id/resend-otp      (OWNER)
DELETE /api/v1/users/:id                 (OWNER - Soft delete)

GET    /api/v1/locations                 (TOUS)
POST   /api/v1/locations                 (OWNER)
PATCH  /api/v1/locations/:id             (OWNER)

GET    /api/v1/produits                  (TOUS)
POST   /api/v1/produits                  (OWNER)
PATCH  /api/v1/produits/:id              (OWNER)

POST   /api/v1/ventes                    (BOUTIQUIER)
POST   /api/v1/ventes/:id/annuler        (OWNER ou Vendeur d'origine)

POST   /api/v1/encaissements             (TOUS - Mode FIFO ou Manuel)

POST   /api/v1/sync/sales                (BOUTIQUIER - Offline Sync)
POST   /api/v1/sync/conflicts/:id/arbitrer (OWNER)

POST   /api/v1/transferts/demande        (BOUTIQUIER)
POST   /api/v1/transferts/:id/valider    (OWNER - 1er disponible)
```
