Prompt Maquette

Créer une application de gestion professionnelle de boutiques nommée **AFD Textile**, destinée à la gestion complète d'un réseau de boutiques de tissus.

## Contexte du projet

AFD Textile est une entreprise spécialisée dans la vente de tissus. L'application doit fonctionner sur :

* Mobile Android et iPhone (priorité principale)
* Tablette Android et iPad (priorité principale)
* Desktop/Web (support secondaire)

L'application doit être moderne, rapide, intuitive, robuste, évolutive et adaptée à des utilisateurs peu familiers avec la technologie.

L'objectif est de centraliser :

* Gestion des produits
* Gestion du stock
* Gestion des ventes
* Gestion des créances clients
* Gestion de l'entrepôt central
* Gestion des transferts entre boutiques
* Gestion des utilisateurs
* Gestion des rapports
* Gestion des sauvegardes
* Gestion hors ligne

---

# Style UI/UX attendu

Créer une interface moderne inspirée de :

* Shopify POS
* Odoo
* Zoho Inventory
* Notion
* Stripe Dashboard

Principes :

* Design minimaliste
* Très lisible
* Responsive
* Navigation rapide
* Peu de clics
* Couleurs professionnelles

Palette :

* Bleu foncé #0F3D5E
* Bleu textile #1E88E5
* Blanc #FFFFFF
* Gris clair #F5F7FA
* Vert succès #22C55E
* Rouge alerte #EF4444
* Orange notification #F59E0B

Typographie :

* Inter
* Poppins

Design :

* Cartes modernes
* Coins arrondis
* Ombres légères
* Icônes Material Design
* Graphiques modernes

---

# Gestion des rôles

## Écran de connexion

Champs :

*Numero telephone ou Email
* Mot de passe

Boutons :

* Se connecter
* Mot de passe oublié
* ⁠Rester connecter sur cette appareil a cocher pour enregistrer la connexion
*

Après authentification :

### Rôle 1 : Boutiquier

Accès limité aux fonctionnalités autorisées.

### Rôle 2 : Gérant

Accès complet à toute la plateforme.

---

# Architecture de navigation

Créer une navigation par onglets :

Accueil

Produits

Stock

Ventes

Clients

Demandes

Notifications

Profil

Pour le gérant ajouter :

Dashboard Admin

Utilisateurs

Entrepôt

Rapports

Historique

Sauvegardes

Paramètres

---

# Module Tableau de bord

Créer un dashboard dynamique avec :

Cartes statistiques :

* Chiffre d'affaires du jour
* Chiffre d'affaires de la semaine
* Nombre de ventes
* Produits en stock
* Produits faibles en stock
* Créances clients
* Demandes en attente
* Alertes stock

Graphiques :

* Évolution des ventes
* Produits les plus vendus
* Stocks par boutique
* Stocks de l'entrepôt

---

# Module Gestion des produits

Créer :

Liste des produits

Recherche instantanée

Filtres avancés

Ajout produit

Modification

Suppression

Visualisation détaillée

Informations produit :

* Référence
* Nom du tissu
* Catégorie
* Couleur
* Prix de vente
* Quantité
* Unité
* Nombre de pièces
* Nombre de tonnes
* Images

---

# Module Gestion du stock

Afficher :

* Stock disponible
* Stock réservé
* Stock transféré
* Stock vendu

Fonctionnalités :

* Entrée stock
* Sortie stock
* Ajustement

Mise à jour automatique après chaque vente.

Alertes automatiques lorsque le stock atteint un seuil critique.

---

# Module Gestion des ventes

Créer :

Nouvelle vente

Recherche rapide du produit
Quantité acheter (Mètre, kilo, yard)
Calcul automatique :

* Sous-total
* Remise
* Total

Modes de paiement :

* Espèces
* Wave
* Orange Money
* Carte bancaire
* Autre

Enregistrement de la vente

Décrémentation automatique du stock après validation.

---

# Annulation d'une vente

Fonctionnalité sécurisée.

Processus :

1. Sélection de la vente.
2. Motif obligatoire.
3. Validation.
4. Réintégration automatique du stock.
5. Journalisation de l'opération.

Motifs :

* Erreur de saisie
* Retour client
* Produit défectueux
* Autre

---

# Gestion des clients et créances

Créer :

Liste clients

Fiche client

Historique achats

Historique paiements

Montants dus

Alertes créances

Informations :

* Nom
* Téléphone
* Adresse
* Solde dû
* Historique complet

---

# Relances clients

Relance manuelle :

* SMS
* WhatsApp

Templates prêts à utiliser :

"Bonjour [Nom], votre créance de [Montant] est toujours en attente. Merci de régulariser votre situation."

Bouton :

Envoyer via WhatsApp

Envoyer via SMS

---

# Module Entrepôt Central

Accès exclusif au gérant.

Fonctionnalités :

* Gestion des stocks de l'entrepôt
* Historique des entrées
* Historique des sorties

Informations :

* Référence
* Nom tissu
* Quantité
* Nombre de pièces
* Nombre de tonnes
* Date réception


---

# Gestion intelligente des demandes

Cas d'utilisation :

Un boutiquier cherche un tissu.

L'application doit automatiquement :

1. Vérifier dans sa boutique.
2. Vérifier dans les autres boutiques.
3. Vérifier dans l'entrepôt.
4. Identifier où le stock est disponible.
5. Créer une demande.

Écran demande :

* Produit
* Quantité
* Boutique demandeuse
* Source suggérée
* Priorité
* Date

Statuts :

* En attente
* Acceptée
* Refusée
* En cours de transfert
* Livrée

---

# Validation des demandes

Seul le gérant peut :

* Accepter
* Refuser
* Modifier la quantité

Après validation :

Le stock source est automatiquement décrémenté.

Le stock destination est automatiquement incrémenté.

Créer une notification automatique.

---

# Module Notifications

Notifications en temps réel :

* Nouvelle demande
* Validation
* Refus
* Stock faible
* Créance importante
* Sauvegarde effectuée

---

# Gestion des utilisateurs

Réservé au gérant.

Créer :

* Ajouter utilisateur
* Modifier utilisateur
* Désactiver utilisateur

Rôles :

* Gérant
* Boutiquier

Permissions détaillées.

---

# Historique des opérations

Tracer toutes les actions :

* Connexions
* Ventes
* Annulations
* Transferts
* Modifications
* Suppressions

Filtres :

* Date
* Utilisateur
* Boutique
* Action

---

# Rapports

Rapports journaliers

Rapports hebdomadaires

Rapports mensuels

Rapports annuels

Exporter :

* PDF
* Excel

Indicateurs :

* Ventes
* Produits
* Bénéfices
* Créances
* Stocks

---

# Sauvegarde des données

Créer :

* Sauvegarde automatique
* Sauvegarde manuelle
* Restauration

Historique complet des sauvegardes.

---

# Mode hors ligne

Fonctionnement même sans Internet.

Fonctionnalités hors ligne :

* Ventes
* Consultation stock
* Consultation produits
* Clients

Synchronisation automatique dès le retour de la connexion.

Afficher :

"Synchronisation en attente"

"Synchronisation réussie"

---

# Prototype Figma attendu

Créer :
*L’application complète 
* Wireframes complets
* Design System complet
* Composants réutilisables
* Prototype interactif
* Parcours utilisateur complet

Écrans minimum :

* Login
* Dashboard Gérant
* Produits
* Stock
* Vente
* Créances
* Entrepôt
* Demandes
* Validation des demandes
* Notifications
* Rapports
* Historique
* Utilisateurs
* Profil
* Paramètres

Toutes les boutiques doivent être synchronisés et avoir une différenciation de par le lieu et chaque boutique a son propre gérant et tout les gérants ont les mêmes droits 

Créer une expérience utilisateur premium, professionnelle, extrêmement fluide, moderne et prête pour un développement Flutter, React Native ou Next.js.

Tu dois strictement respecter les choses demander pas d’ajouts de fonction ou fonctionnalités