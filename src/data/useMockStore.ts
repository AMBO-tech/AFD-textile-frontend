import { create } from 'zustand';
import {
  BOUTIQUES,
  CATEGORIES_DATA,
  PRODUITS,
  CLIENTS,
  VENTES,
  DEMANDES,
  UTILISATEURS,
  ENTREPOT,
  NOTIFICATIONS,
  HISTORIQUE,
  SAUVEGARDES,
  VENTES_SEMAINE,
  TOP_PRODUITS,
  formatMontant,
} from './mock';

export type Produit = typeof PRODUITS[0];
export type Boutique = typeof BOUTIQUES[0];
export type Categorie = typeof CATEGORIES_DATA[0];
export type Demande = typeof DEMANDES[0] & { unite?: string };
export type Vente = typeof VENTES[0] & { panierRef?: string };
export type ClientItem = typeof CLIENTS[0];
export type NotificationItem = typeof NOTIFICATIONS[0];
export type HistoriqueItem = typeof HISTORIQUE[0];
export type SauvegardeItem = typeof SAUVEGARDES[0];
export type UtilisateurItem = typeof UTILISATEURS[0];
export type EntrepotItem = typeof ENTREPOT[0];

export interface LigneProduitCreance {
  produitId: string;
  nom: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
}

export interface PaiementCreance {
  id: string;
  montant: number;
  mode: string;
  date: string;
}

export interface Creance {
  id: string;
  date: string;
  lignes: LigneProduitCreance[];
  montantTotal: number;
  paiements: PaiementCreance[];
}

export interface ClientDetailed {
  id: string;
  nom: string;
  telephone: string;
  adresse: string;
  boutique: string;
  boutiqueId: string;
  creances: Creance[];
}

export interface SessionUser {
  role: 'gerant' | 'boutiquier';
  nom: string;
  boutiqueId?: string;
}

interface MockStoreState {
  session: SessionUser | null;
  produits: Produit[];
  categories: Categorie[];
  boutiques: Boutique[];
  ventes: Vente[];
  clients: ClientDetailed[];
  demandes: Demande[];
  utilisateurs: UtilisateurItem[];
  entrepot: EntrepotItem[];
  notifications: NotificationItem[];
  historique: HistoriqueItem[];
  sauvegardes: SauvegardeItem[];

  // Actions
  setSession: (session: SessionUser | null) => void;
  
  // Stock
  adjustStock: (produitId: string, qteChange: number, motif: string, auteur?: string) => void;
  addProduit: (nouveauProduit: Omit<Produit, 'id'>) => Produit;
  updateProduit: (id: string, modifs: Partial<Produit>) => void;
  addCategorie: (nouvelleCat: Categorie) => void;
  
  // Ventes
  addVente: (nouvelleVente: Omit<Vente, 'id'>) => Vente;
  cancelVente: (venteId: string, motif: string, auteur?: string) => void;

  // Clients & Créances
  addClient: (nouveauClient: { nom: string; telephone: string; adresse: string; boutiqueId: string }) => ClientDetailed;
  addCreance: (clientId: string, lignes: LigneProduitCreance[], date?: string) => void;
  recordPaiement: (clientId: string, creanceId: string, montant: number, mode: string, auteur?: string) => void;

  // Demandes & Transferts
  createDemande: (nouvelleDemande: Omit<Demande, 'id' | 'statut' | 'date'>) => Demande;
  updateDemandeStatut: (demandeId: string, statut: Demande['statut'], qteAccordee?: number) => void;
  createTransfert: (params: { produitNom: string; sourceId: string; destId: string; quantite: number; unite: string; pieces?: number; auteur: string }) => void;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;

  // Sauvegardes
  triggerSauvegarde: (type?: 'manuelle' | 'automatique') => void;

  // Utilisateurs
  addUtilisateur: (nouvelUtilisateur: Omit<UtilisateurItem, 'id' | 'derniereConnexion'>) => UtilisateurItem;
  updateUtilisateur: (id: string, modifs: Partial<UtilisateurItem>) => void;
  toggleUtilisateurActif: (id: string) => void;
}

// Initialisation des clients détaillés
const INITIAL_CLIENTS: ClientDetailed[] = CLIENTS.map((c) => ({
  id: c.id,
  nom: c.nom,
  telephone: c.telephone,
  adresse: c.adresse,
  boutique: c.boutique,
  boutiqueId: c.boutique,
  creances: c.solde > 0 ? [{
    id: 'cr_init_' + c.id,
    date: '12/09/2026',
    lignes: [{
      produitId: '',
      nom: 'Marchandises diverses',
      quantite: 1,
      unite: 'pièce',
      prixUnitaire: c.solde,
    }],
    montantTotal: c.solde,
    paiements: [],
  }] : [],
}));

export const useMockStore = create<MockStoreState>((set, get) => ({
  session: null,
  produits: [...PRODUITS],
  categories: [...CATEGORIES_DATA],
  boutiques: [...BOUTIQUES],
  ventes: [...VENTES],
  clients: INITIAL_CLIENTS,
  demandes: [...DEMANDES],
  utilisateurs: [...UTILISATEURS],
  entrepot: [...ENTREPOT],
  notifications: [...NOTIFICATIONS],
  historique: [...HISTORIQUE],
  sauvegardes: [...SAUVEGARDES],

  setSession: (session) => set({ session }),

  adjustStock: (produitId, qteChange, motif, auteur) => {
    const state = get();
    const target = state.produits.find((p) => p.id === produitId);
    if (!target) return;

    const nouvelleQte = Math.max(0, target.quantite + qteChange);
    const updatedProduits = state.produits.map((p) =>
      p.id === produitId ? { ...p, quantite: nouvelleQte } : p
    );

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);
    const currentUser = auteur || state.session?.nom || 'Système';

    const newHisto: HistoriqueItem = {
      id: 'h' + (state.historique.length + 1),
      action: qteChange > 0 ? 'Entrée stock' : 'Ajustement stock',
      details: `${motif} (${qteChange > 0 ? '+' : ''}${qteChange} ${target.unite} sur ${target.nom})`,
      utilisateur: currentUser,
      boutique: target.boutique,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'stock',
    };

    set({
      produits: updatedProduits,
      historique: [newHisto, ...state.historique],
    });
  },

  addProduit: (nouveauProduit) => {
    const state = get();
    const newId = 'p' + (state.produits.length + 1);
    const fullProd: Produit = { ...nouveauProduit, id: newId };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);
    const currentUser = state.session?.nom || 'Gérant';

    const newHisto: HistoriqueItem = {
      id: 'h' + (state.historique.length + 1),
      action: 'Ajout produit',
      details: `Nouveau modèle créé : ${fullProd.nom} (${fullProd.categorie})`,
      utilisateur: currentUser,
      boutique: fullProd.boutique,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'catalogue',
    };

    set({
      produits: [fullProd, ...state.produits],
      historique: [newHisto, ...state.historique],
    });

    return fullProd;
  },

  updateProduit: (id, modifs) => {
    set((state) => ({
      produits: state.produits.map((p) => (p.id === id ? { ...p, ...modifs } : p)),
    }));
  },

  addCategorie: (nouvelleCat) => {
    set((state) => ({
      categories: [nouvelleCat, ...state.categories],
    }));
  },

  addVente: (nouvelleVente) => {
    const state = get();
    const newId = 'v' + (state.ventes.length + 1);
    const fullVente: Vente = { ...nouvelleVente, id: newId };

    // Décrémenter le stock du produit vendu
    const updatedProduits = state.produits.map((p) => {
      if (p.id === fullVente.produitId || p.nom.toLowerCase() === fullVente.produit.toLowerCase()) {
        return { ...p, quantite: Math.max(0, p.quantite - fullVente.quantite) };
      }
      return p;
    });

    // Journal d'audit
    const newHisto: HistoriqueItem = {
      id: 'h' + (state.historique.length + 1),
      action: 'Vente',
      details: `Vente ${fullVente.typeVente === 'credit' ? 'à crédit' : 'validée'} - ${fullVente.produit} - ${fullVente.quantite}${fullVente.unite} - ${formatMontant(fullVente.montant)} (${fullVente.paiement}) - Client ${fullVente.client}`,
      utilisateur: fullVente.vendeur,
      boutique: fullVente.boutique,
      date: `${fullVente.date} ${fullVente.heure}`,
      typeAction: 'vente',
    };

    set({
      ventes: [fullVente, ...state.ventes],
      produits: updatedProduits,
      historique: [newHisto, ...state.historique],
    });

    return fullVente;
  },

  cancelVente: (venteId, motif, auteur) => {
    const state = get();
    const target = state.ventes.find((v) => v.id === venteId);
    if (!target || target.statut === 'annulée') return;

    // Réinjecter le stock
    const updatedProduits = state.produits.map((p) => {
      if (p.id === target.produitId || p.nom.toLowerCase() === target.produit.toLowerCase()) {
        return { ...p, quantite: p.quantite + target.quantite };
      }
      return p;
    });

    const updatedVentes = state.ventes.map((v) =>
      v.id === venteId ? { ...v, statut: 'annulée' as const } : v
    );

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);
    const currentUser = auteur || state.session?.nom || 'Gérant';

    const newHisto: HistoriqueItem = {
      id: 'h' + (state.historique.length + 1),
      action: 'Annulation',
      details: `Annulation vente #${venteId} - ${target.produit} (${target.quantite}${target.unite}) - Motif : ${motif}`,
      utilisateur: currentUser,
      boutique: target.boutique,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'annulation',
    };

    set({
      ventes: updatedVentes,
      produits: updatedProduits,
      historique: [newHisto, ...state.historique],
    });
  },

  addClient: (nouveauClient) => {
    const state = get();
    const newId = 'c' + (state.clients.length + 1);
    const fullClient: ClientDetailed = {
      id: newId,
      nom: nouveauClient.nom,
      telephone: nouveauClient.telephone,
      adresse: nouveauClient.adresse,
      boutique: nouveauClient.boutiqueId,
      boutiqueId: nouveauClient.boutiqueId,
      creances: [],
    };

    set({ clients: [fullClient, ...state.clients] });
    return fullClient;
  },

  addCreance: (clientId, lignes, date) => {
    const state = get();
    const now = new Date();
    const dateStr = date || now.toLocaleDateString('fr-FR');
    const montantTotal = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);

    const newCreance: Creance = {
      id: 'cr' + Date.now(),
      date: dateStr,
      lignes,
      montantTotal,
      paiements: [],
    };

    const targetClient = state.clients.find((c) => c.id === clientId);
    const updatedClients = state.clients.map((c) =>
      c.id === clientId ? { ...c, creances: [newCreance, ...c.creances] } : c
    );

    const newHisto: HistoriqueItem = {
      id: 'h' + (state.historique.length + 1),
      action: 'Créance',
      details: `Nouvelle créance de ${formatMontant(montantTotal)} enregistrée pour ${targetClient?.nom || 'Client'}`,
      utilisateur: state.session?.nom || 'Vendeur',
      boutique: targetClient?.boutiqueId || 'b1',
      date: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      typeAction: 'creance',
    };

    set({
      clients: updatedClients,
      historique: [newHisto, ...state.historique],
    });
  },

  recordPaiement: (clientId, creanceId, montant, mode, auteur) => {
    const state = get();
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const targetClient = state.clients.find((c) => c.id === clientId);

    const newPaiement: PaiementCreance = {
      id: 'p' + Date.now(),
      montant,
      mode,
      date: dateStr,
    };

    const updatedClients = state.clients.map((c) => {
      if (c.id !== clientId) return c;
      const updatedCreances = c.creances.map((cr) => {
        if (cr.id !== creanceId) return cr;
        return { ...cr, paiements: [newPaiement, ...cr.paiements] };
      });
      return { ...c, creances: updatedCreances };
    });

    const newHisto: HistoriqueItem = {
      id: 'h' + (state.historique.length + 1),
      action: 'Paiement créance',
      details: `Règlement créance : ${targetClient?.nom} a versé ${formatMontant(montant)} via ${mode}`,
      utilisateur: auteur || state.session?.nom || 'Vendeur',
      boutique: targetClient?.boutiqueId || 'b1',
      date: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      typeAction: 'creance',
    };

    set({
      clients: updatedClients,
      historique: [newHisto, ...state.historique],
    });
  },

  createDemande: (nouvelleDemande) => {
    const state = get();
    const newId = 'd' + (state.demandes.length + 1);
    const dateStr = new Date().toISOString().split('T')[0];
    const fullDemande: Demande = {
      ...nouvelleDemande,
      id: newId,
      statut: 'en_attente',
      date: dateStr,
    };

    // Notification associée
    const newNotif: NotificationItem = {
      id: 'n' + (state.notifications.length + 1),
      type: 'demande',
      message: `Nouvelle demande de ${fullDemande.demandeur} : ${fullDemande.produit} (${fullDemande.quantite}m)`,
      date: `${dateStr} ${new Date().toTimeString().slice(0, 5)}`,
      lu: false,
      boutique: fullDemande.boutique_source,
    };

    set({
      demandes: [fullDemande, ...state.demandes],
      notifications: [newNotif, ...state.notifications],
    });

    return fullDemande;
  },

  updateDemandeStatut: (demandeId, statut, qteAccordee) => {
    set((state) => ({
      demandes: state.demandes.map((d) => {
        if (d.id !== demandeId) return d;
        return {
          ...d,
          statut,
          quantite: qteAccordee !== undefined ? qteAccordee : d.quantite,
        };
      }),
    }));
  },

  createTransfert: ({ produitNom, sourceId, destId, quantite, unite, pieces, auteur }) => {
    const state = get();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    // Ajuster le stock source (diminuer) et destination (augmenter)
    const updatedProduits = state.produits.map((p) => {
      if (p.nom.toLowerCase() === produitNom.toLowerCase()) {
        if (p.boutique === sourceId) {
          return { ...p, quantite: Math.max(0, p.quantite - quantite) };
        }
        if (p.boutique === destId) {
          return { ...p, quantite: p.quantite + quantite };
        }
      }
      return p;
    });

    const getNomEmplacement = (id: string) => {
      if (id === 'entrepot') return 'Entrepôt Central';
      return state.boutiques.find((b) => b.id === id)?.nom || id;
    };

    const newHisto: HistoriqueItem = {
      id: 'h' + (state.historique.length + 1),
      action: 'Transfert',
      details: `Transfert expédié : ${quantite}${unite} ${produitNom} (${getNomEmplacement(sourceId)} → ${getNomEmplacement(destId)})`,
      utilisateur: auteur || state.session?.nom || 'Gérant',
      boutique: sourceId,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'transfert',
    };

    set({
      produits: updatedProduits,
      historique: [newHisto, ...state.historique],
    });
  },

  markNotificationRead: (notifId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notifId ? { ...n, lu: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, lu: true })),
    }));
  },

  triggerSauvegarde: (type = 'manuelle') => {
    const state = get();
    const now = new Date();
    const newId = 's' + (state.sauvegardes.length + 1);
    const newSauvegarde: SauvegardeItem = {
      id: newId,
      type,
      taille: '12.8 Mo',
      date: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      statut: 'succès',
    };

    const newNotif: NotificationItem = {
      id: 'n' + (state.notifications.length + 1),
      type: 'sauvegarde',
      message: `Sauvegarde ${type} effectuée avec succès`,
      date: newSauvegarde.date,
      lu: false,
      boutique: state.session?.boutiqueId || 'b1',
    };

    set({
      sauvegardes: [newSauvegarde, ...state.sauvegardes],
      notifications: [newNotif, ...state.notifications],
    });
  },

  addUtilisateur: (nouvelUtilisateur) => {
    const state = get();
    const newId = 'u' + (state.utilisateurs.length + 1);
    const fullUser: UtilisateurItem = {
      ...nouvelUtilisateur,
      id: newId,
      derniereConnexion: 'Jamais',
    };

    set({ utilisateurs: [fullUser, ...state.utilisateurs] });
    return fullUser;
  },

  updateUtilisateur: (id, modifs) => {
    set((state) => ({
      utilisateurs: state.utilisateurs.map((u) =>
        u.id === id ? { ...u, ...modifs } : u
      ),
    }));
  },

  toggleUtilisateurActif: (id) => {
    set((state) => ({
      utilisateurs: state.utilisateurs.map((u) =>
        u.id === id ? { ...u, actif: !u.actif } : u
      ),
    }));
  },
}));

export { VENTES_SEMAINE, TOP_PRODUITS, formatMontant };
