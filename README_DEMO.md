# 🧵 AFD Textile - Guide de Démonstration & Déploiement

Plateforme omnicanale moderne de gestion commerciale, logistique et multi-boutiques pour le secteur textile (Côte d'Ivoire & Sénégal). Conçue et intégrée selon les maquettes Figma Proceed pixel-perfect.

---

## 🚀 Démarrage Rapide

### Configuration du Port
Le serveur de développement est verrouillé sur le port **5173 strict** pour garantir la cohérence des sessions :
```bash
npm run dev -- --port 5173 --strictPort
```
URL d'accès : [http://localhost:5173](http://localhost:5173)

---

## 👤 Comptes Démo Disponibles

| Rôle | Identifiant | Mot de passe | Permissions |
| :--- | :--- | :--- | :--- |
| **Gérant / Administrateur** | `amadou.diallo@afd-textile.sn` (ou `amadou@afd.sn`) | `afd2026` | Accès intégral : KPIs, validation des transferts, gestion utilisateurs, rapports financiers |
| **Boutiquier / Vendeur** | `ibrahima.sarr@afd-textile.sn` | `afd2026` | Encaissement POS, catalogue produits, inventaire boutique, relances clients |

*Note : Des boutons d'accès rapide en 1 clic sont également disponibles directement sur la page de connexion.*

---

## 🗺️ Cartographie des Routes

Toutes les routes supportent les alias en français et en anglais avec redirection automatique :

| Fonctionnalité | Route Principale | Alias Anglais | Description |
| :--- | :--- | :--- | :--- |
| **Connexion** | `/login` | - | Split-card avec gradients bleus et motifs textiles |
| **Tableau de Bord** | `/dashboard` | - | Cockpit 8 KPIs, graphiques Recharts (CA hebdo, top tissus) |
| **Inventaire & Catalogue** | `/inventaire` | `/inventory` | Accordéon par catégories, alertes de seuil critique, ajustement de stock |
| **Point de Vente (POS)** | `/ventes` | `/sales` | Grille produits, panier dynamique, paiements Wave / Orange Money / Espèces |
| **Clients & Créances** | `/clients` | - | Suivi des créances en cours, relance directe WhatsApp / SMS |
| **Entrepôt Central** | `/entrepot` | `/warehouse` | Stocks en réserve, transferts inter-boutiques et mouvements logistiques |
| **Demandes de Réappro** | `/demandes` | `/requests` | Demandes de transfert en attente, validation / refus en 1 clic pour gérants |
| **Utilisateurs & Équipe** | `/utilisateurs` | `/users` | Affectation des boutiques, mot de passe temporaire et rôles |
| **Rapports Financiers** | `/rapports` | `/reports` | Filtres par période (Jour, Semaine, Mois, Année), exports PDF/Excel |
| **Journal d'Activité** | `/historique` | `/history` | Timeline d'audit de toutes les opérations de vente et logistique |
| **Paramètres** | `/parametres` | `/settings` | Configuration des boutiques et alertes système |
| **Profil Utilisateur** | `/profil` | `/profile` | Informations personnelles et déconnexion |
| **Notifications** | `/notifications` | - | Centre d'alertes temps réel |
| **Sauvegardes** | `/sauvegardes` | `/backups` | Instantanés manuels cloud et historique des sauvegardes |

---

## 🔌 Architecture API & Résilience Réseau

- **Mode Connecté** : Les requêtes HTTP pointent vers l'API backend REST configurée via `VITE_API_URL` (défaut : `http://localhost:3000/api/v1`).
- **Mode Résilience / Offline** : Si le serveur API est indisponible ou hors ligne, les intercepteurs Axios et hooks React Query loggent un avertissement (`console.warn`) et injectent automatiquement des données de secours cohérentes avec la maquette Figma sans interrompre la démonstration.

---

## 📦 Commandes de Déploiement

### Prévisualisation locale de la version de production :
```bash
npm run build
npm run preview -- --port 4173
```

### Déploiement Vercel :
```bash
vercel --prod
```

### Déploiement Docker (Optionnel) :
```bash
docker build -t afd-textile-frontend .
docker run -p 5173:80 afd-textile-frontend
```
