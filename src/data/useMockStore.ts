import { create } from 'zustand';
import {
  BOUTIQUES,
  CATEGORIES_DATA,
  CATALOGUE_PRODUITS,
  INITIAL_STOCKS,
  CLIENTS,
  VENTES,
  DEMANDES,
  UTILISATEURS,
  ENTREPOT,
  NOTIFICATIONS,
  HISTORIQUE,
  VENTES_SEMAINE,
  TOP_PRODUITS,
  formatMontant,
  BOUTIQUE_IDS,
  DEFAULT_BOUTIQUE_ID,
  ENTREPOT_ID,
  PRODUIT_IDS,
  CLIENT_IDS,
  USER_IDS,
} from './mock';

export interface Produit {
  id: string;
  reference?: string;
  nom: string;
  categorie: string;
  couleur?: string;
  motif?: string;
  photo?: string;
  description?: string;
  // Champs optionnels de rétrocompatibilité pour interfaces legacy
  prix?: number;
  prixVente?: number;
  prixMinimal?: number;
  quantite?: number;
  unite?: string;
  seuil?: number;
  pieces?: number;
  boutique?: string;
}

export interface StockItem {
  id: string;
  produitId: string;
  boutiqueId: string;
  quantite: number;
  unite: string;
  prixVente: number;
  prixMinimal: number;
  seuil: number;
  pieces?: number;
}

export interface StockEnriched extends Produit {
  stockId: string;
  produitId: string;
  boutiqueId: string;
  boutique: string;
  quantite: number;
  unite: string;
  prix: number;
  prixVente: number;
  prixMinimal: number;
  seuil: number;
  pieces?: number;
}

export interface Boutique {
  id: string;
  code: string;
  nom: string;
  type: 'BOUTIQUE' | 'ENTREPOT';
  lieu: string;
  adresse: string;
  telephone: string;
  gerant: string;
  actif: boolean;
}

export interface Categorie {
  nom: string;
  photo: string;
}

export interface Demande {
  id: string;
  produit: string;
  quantite: number;
  unite?: string;
  boutique_demande: string;
  boutique_source: string;
  statut: 'en_attente' | 'acceptee' | 'en_transfert' | 'livree' | 'refusee';
  priorite: 'basse' | 'normale' | 'haute';
  date: string;
  demandeur: string;
}

export interface Vente {
  id: string;
  client: string;
  produit: string;
  produitId: string;
  quantite: number;
  unite: string;
  montant: number;
  remise: number;
  paiement: string;
  date: string;
  heure: string;
  statut: 'validée' | 'annulée';
  boutique: string;
  vendeur: string;
  typeVente: 'comptant' | 'credit';
  panierRef?: string;
}

export interface ClientItem {
  id: string;
  nom: string;
  telephone: string;
  adresse: string;
  solde: number;
  boutique: string;
}

export interface NotificationItem {
  id: string;
  type: 'stock_faible' | 'demande' | 'creance' | 'validation' | 'boutique' | 'transfert' | string;
  message: string;
  date: string;
  lu: boolean;
  boutique: string;
}

export interface HistoriqueItem {
  id: string;
  action: string;
  details: string;
  utilisateur: string;
  boutique: string;
  date: string;
  typeAction: 'vente' | 'stock' | 'connexion' | 'transfert' | 'annulation' | 'creance' | 'catalogue' | string;
}

export interface UtilisateurItem {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: 'gerant' | 'boutiquier';
  boutique: string;
  actif: boolean;
  derniereConnexion: string;
  invitationToken?: string;
  invitationExpiresAt?: string;
  premiereConnexion?: boolean;
}

export interface EntrepotItem {
  id: string;
  nom: string;
  quantite: number;
  pieces: number;
  tonnes: number;
  dateReception: string;
  fournisseur: string;
}

export interface LigneProduitCreance {
  id?: string;
  produitId: string;
  nom: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  totalLigne?: number;
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

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const LEGACY_LOCATION_MAP: Record<string, string> = {
  b1: BOUTIQUE_IDS.PLATEAU,
  b2: BOUTIQUE_IDS.PIKINE,
  b3: BOUTIQUE_IDS.THIES,
  'b-ent': BOUTIQUE_IDS.ENTREPOT,
  entrepot: BOUTIQUE_IDS.ENTREPOT,
};

export const normalizeLocationId = (id?: string): string => {
  if (!id) return DEFAULT_BOUTIQUE_ID;
  return LEGACY_LOCATION_MAP[id] || id;
};

const matchesLocation = (a?: string, b?: string) => {
  if (!a || !b) return false;
  if (a === b) return true;
  const normA = normalizeLocationId(a);
  const normB = normalizeLocationId(b);
  if (normA === normB) return true;
  const isEntrepotA = normA === ENTREPOT_ID || a === 'entrepot' || a === 'b-ent';
  const isEntrepotB = normB === ENTREPOT_ID || b === 'entrepot' || b === 'b-ent';
  return isEntrepotA && isEntrepotB;
};

interface MockStoreState {
  session: SessionUser | null;
  produits: Produit[];
  stocks: StockItem[];
  categories: Categorie[];
  boutiques: Boutique[];
  ventes: Vente[];
  clients: ClientDetailed[];
  demandes: Demande[];
  utilisateurs: UtilisateurItem[];
  entrepot: EntrepotItem[];
  notifications: NotificationItem[];
  historique: HistoriqueItem[];

  // Selectors
  getStocksEnriched: (boutiqueId?: string) => StockEnriched[];
  getStockItem: (produitId: string, boutiqueId: string) => StockItem | undefined;
  getCatalogueProduit: (produitId: string) => Produit | undefined;

  // Actions
  setSession: (session: SessionUser | null) => void;
  
  // Stock & Catalogue
  adjustStock: (produitOrStockId: string, qteChange: number, motif: string, auteur?: string, boutiqueId?: string) => void;
  upsertStockItem: (item: {
    produitId: string;
    boutiqueId: string;
    quantite: number;
    unite: string;
    prixVente: number;
    prixMinimal?: number;
    seuil?: number;
    pieces?: number;
  }) => StockItem;
  addProduit: (nouveauProduit: Omit<Produit, 'id'>) => Produit;
  updateProduit: (id: string, modifs: Partial<Produit>) => void;
  deleteProduit: (id: string) => void;
  addCategorie: (nouvelleCat: Categorie) => void;
  
  // Ventes
  addVente: (nouvelleVente: Omit<Vente, 'id'>) => Vente;
  cancelVente: (venteId: string, motif: string, auteur?: string) => void;

  // Clients & Créances (Ventes à crédit / Commandes en gros)
  addClient: (nouveauClient: { nom: string; telephone: string; adresse: string; boutiqueId: string }) => ClientDetailed;
  addCreance: (
    clientId: string,
    lignes: LigneProduitCreance[],
    date?: string,
    acompte?: number,
    modeAcompte?: string
  ) => void;
  recordPaiement: (clientId: string, creanceId: string, montant: number, mode: string, auteur?: string) => void;

  // Boutiques & Emplacements
  addBoutique: (nouvelleBoutique: {
    nom: string;
    code: string;
    type: 'BOUTIQUE' | 'ENTREPOT';
    lieu: string;
    adresse: string;
    telephone: string;
    gerant: string;
  }) => Boutique;
  updateBoutique: (id: string, modifs: Partial<Boutique>) => void;
  toggleBoutiqueActif: (id: string) => void;

  // Demandes & Transferts
  createDemande: (nouvelleDemande: Omit<Demande, 'id' | 'statut' | 'date'>) => Demande;
  updateDemandeStatut: (
    demandeId: string,
    statut: Demande['statut'],
    qteAccordee?: number,
    sourceBoutiqueId?: string,
    managerName?: string
  ) => void;
  createTransfert: (params: { produitNom: string; sourceId: string; destId: string; quantite: number; unite: string; pieces?: number; auteur: string }) => void;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;

  // Utilisateurs & Invitations (Flow A)
  addUtilisateur: (nouvelUtilisateur: Omit<UtilisateurItem, 'id' | 'derniereConnexion'>) => UtilisateurItem;
  updateUtilisateur: (id: string, modifs: Partial<UtilisateurItem>) => void;
  toggleUtilisateurActif: (id: string) => void;
  resendInvitation: (id: string) => { token: string; activationUrl: string };
  activateUserPassword: (token: string, newPassword: string) => boolean;
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
    id: generateUUID(),
    date: '18/09/2026',
    lignes: [{
      produitId: PRODUIT_IDS.WAX_HOLLANDAIS,
      nom: 'Marchandises diverses (Tissus de qualité)',
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
  produits: [...CATALOGUE_PRODUITS],
  stocks: [...INITIAL_STOCKS],
  categories: [...CATEGORIES_DATA],
  boutiques: [...BOUTIQUES],
  ventes: [...VENTES],
  clients: INITIAL_CLIENTS,
  demandes: [...DEMANDES],
  utilisateurs: [...UTILISATEURS],
  entrepot: [...ENTREPOT],
  notifications: [...NOTIFICATIONS],
  historique: [...HISTORIQUE],

  setSession: (session) => set({ session }),

  getStocksEnriched: (boutiqueId?: string) => {
    const { produits, stocks } = get();
    const filteredStocks = boutiqueId && boutiqueId !== 'tous'
      ? stocks.filter((s) => matchesLocation(s.boutiqueId, boutiqueId))
      : stocks;

    return filteredStocks.map((s) => {
      const p = produits.find((prod) => prod.id === s.produitId) || {
        id: s.produitId,
        nom: 'Tissu inconnu',
        categorie: 'Général',
        couleur: '',
        photo: '',
        reference: '',
      };

      const enriched: StockEnriched = {
        ...p,
        stockId: s.id,
        produitId: s.produitId,
        boutiqueId: s.boutiqueId,
        boutique: s.boutiqueId,
        quantite: s.quantite,
        unite: s.unite,
        prix: s.prixVente,
        prixVente: s.prixVente,
        prixMinimal: s.prixMinimal,
        seuil: s.seuil,
        pieces: s.pieces,
      };
      return enriched;
    });
  },

  getStockItem: (produitId: string, boutiqueId: string) => {
    return get().stocks.find(
      (s) => s.produitId === produitId && matchesLocation(s.boutiqueId, boutiqueId)
    );
  },

  getCatalogueProduit: (produitId: string) => {
    return get().produits.find((p) => p.id === produitId);
  },

  adjustStock: (produitOrStockId, qteChange, motif, auteur, boutiqueId) => {
    const state = get();
    const targetBoutique = boutiqueId || state.session?.boutiqueId;

    let targetStock: StockItem | undefined;
    const updatedStocks = state.stocks.map((s) => {
      const isMatch =
        s.id === produitOrStockId ||
        (s.produitId === produitOrStockId &&
          (!targetBoutique || matchesLocation(s.boutiqueId, targetBoutique)));

      if (isMatch && !targetStock) {
        targetStock = s;
        return { ...s, quantite: Math.max(0, s.quantite + qteChange) };
      }
      return s;
    });

    if (!targetStock) return;

    const prod = state.produits.find((p) => p.id === targetStock?.produitId);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);
    const currentUser = auteur || state.session?.nom || 'Système';

    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: qteChange > 0 ? 'Entrée stock' : 'Ajustement stock',
      details: `${motif} (${qteChange > 0 ? '+' : ''}${qteChange} ${targetStock.unite} sur ${prod?.nom || targetStock.produitId})`,
      utilisateur: currentUser,
      boutique: targetStock.boutiqueId,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'stock',
    };

    set({
      stocks: updatedStocks,
      historique: [newHisto, ...state.historique],
    });
  },

  upsertStockItem: (item) => {
    const state = get();
    const existingIndex = state.stocks.findIndex(
      (s) => s.produitId === item.produitId && matchesLocation(s.boutiqueId, item.boutiqueId)
    );
    let updatedStocks: StockItem[];
    let resultingItem: StockItem;

    if (existingIndex >= 0) {
      const existing = state.stocks[existingIndex];
      resultingItem = {
        ...existing,
        quantite: existing.quantite + item.quantite,
        prixVente: item.prixVente || existing.prixVente,
        prixMinimal: item.prixMinimal ?? existing.prixMinimal,
        unite: item.unite || existing.unite,
        seuil: item.seuil ?? existing.seuil,
        pieces: item.pieces ?? existing.pieces,
      };
      updatedStocks = [...state.stocks];
      updatedStocks[existingIndex] = resultingItem;
    } else {
      resultingItem = {
        id: generateUUID(),
        produitId: item.produitId,
        boutiqueId: normalizeLocationId(item.boutiqueId),
        quantite: item.quantite,
        unite: item.unite,
        prixVente: item.prixVente,
        prixMinimal: item.prixMinimal ?? Math.round(item.prixVente * 0.9),
        seuil: item.seuil ?? 10,
        pieces: item.pieces ?? Math.ceil(item.quantite / 20),
      };
      updatedStocks = [...state.stocks, resultingItem];
    }

    const prod = state.produits.find((p) => p.id === item.produitId);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Mise en stock',
      details: `Mise en stock de ${item.quantite} ${item.unite} sur ${prod?.nom || item.produitId} (${formatMontant(item.prixVente)}/u, Min: ${formatMontant(resultingItem.prixMinimal)})`,
      utilisateur: state.session?.nom || 'Gérant',
      boutique: item.boutiqueId,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'stock',
    };

    set({
      stocks: updatedStocks,
      historique: [newHisto, ...state.historique],
    });

    return resultingItem;
  },

  addProduit: (nouveauProduit) => {
    const state = get();
    const newId = generateUUID();
    const fullProd: Produit = {
      ...nouveauProduit,
      id: newId,
      reference: nouveauProduit.reference || `AFD-${newId.slice(0, 8).toUpperCase()}`,
    };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);
    const currentUser = state.session?.nom || 'Gérant';

    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Ajout catalogue',
      details: `Nouveau modèle de tissu créé : ${fullProd.nom} (${fullProd.categorie})`,
      utilisateur: currentUser,
      boutique: 'Catalogue AFD',
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

  deleteProduit: (id) => {
    set((state) => ({
      produits: state.produits.filter((p) => p.id !== id),
      stocks: state.stocks.filter((s) => s.produitId !== id),
    }));
  },

  addCategorie: (nouvelleCat) => {
    set((state) => ({
      categories: [nouvelleCat, ...state.categories],
    }));
  },

  addVente: (nouvelleVente) => {
    const state = get();
    const newId = generateUUID();
    const fullVente: Vente = { ...nouvelleVente, id: newId };
    const targetBoutique = normalizeLocationId(fullVente.boutique || state.session?.boutiqueId);

    // Décrémenter le stock physique de la boutique correspondante
    const updatedStocks = state.stocks.map((s) => {
      const isTargetProd =
        s.produitId === fullVente.produitId ||
        s.id === fullVente.produitId ||
        state.produits.find((p) => p.id === s.produitId)?.nom.toLowerCase() ===
          fullVente.produit.toLowerCase();

      if (isTargetProd && matchesLocation(s.boutiqueId, targetBoutique)) {
        return {
          ...s,
          quantite: Math.max(0, s.quantite - fullVente.quantite),
        };
      }
      return s;
    });

    // Journal d'audit
    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Vente',
      details: `Vente ${fullVente.typeVente === 'credit' ? 'à crédit' : 'validée'} - ${fullVente.produit} - ${fullVente.quantite}${fullVente.unite} - ${formatMontant(fullVente.montant)} (${fullVente.paiement}) - Client ${fullVente.client}`,
      utilisateur: fullVente.vendeur,
      boutique: targetBoutique,
      date: `${fullVente.date} ${fullVente.heure}`,
      typeAction: 'vente',
    };

    set({
      ventes: [fullVente, ...state.ventes],
      stocks: updatedStocks,
      historique: [newHisto, ...state.historique],
    });

    return fullVente;
  },

  cancelVente: (venteId, motif, auteur) => {
    const state = get();
    const target = state.ventes.find((v) => v.id === venteId);
    if (!target || target.statut === 'annulée') return;

    const targetBoutique = normalizeLocationId(target.boutique || state.session?.boutiqueId);

    // Réinjecter dans le stock physique de la boutique correspondante
    let stockFound = false;
    let updatedStocks = state.stocks.map((s) => {
      const isTargetProd =
        s.produitId === target.produitId ||
        s.id === target.produitId ||
        state.produits.find((p) => p.id === s.produitId)?.nom.toLowerCase() ===
          target.produit.toLowerCase();

      if (isTargetProd && matchesLocation(s.boutiqueId, targetBoutique)) {
        stockFound = true;
        return {
          ...s,
          quantite: s.quantite + target.quantite,
        };
      }
      return s;
    });

    // Si aucun stock existant n'est trouvé pour ce produit dans cette boutique, création d'une ligne
    if (!stockFound && target.produitId) {
      const newStockRow: StockItem = {
        id: generateUUID(),
        produitId: target.produitId,
        boutiqueId: targetBoutique,
        quantite: target.quantite,
        unite: target.unite || 'mètre',
        prixVente: Math.round(target.montant / target.quantite),
        prixMinimal: Math.round((target.montant / target.quantite) * 0.9),
        seuil: 10,
      };
      updatedStocks = [...updatedStocks, newStockRow];
    }

    const updatedVentes = state.ventes.map((v) =>
      v.id === venteId ? { ...v, statut: 'annulée' as const } : v
    );

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);
    const currentUser = auteur || state.session?.nom || 'Gérant';

    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Annulation',
      details: `Annulation vente #${venteId} - ${target.produit} (${target.quantite}${target.unite}) - Réinjection stock ${targetBoutique} - Motif : ${motif}`,
      utilisateur: currentUser,
      boutique: targetBoutique,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'annulation',
    };

    // Si c'est une vente à crédit, réajuster le dossier client
    let updatedClients = state.clients;
    if (target.typeVente === 'credit' && target.client) {
      updatedClients = state.clients.map((c) => {
        if (c.nom.toLowerCase() !== target.client.toLowerCase()) return c;
        return {
          ...c,
          creances: c.creances.filter((cr) => {
            const matchProd = cr.lignes.some(
              (l) => l.produitId === target.produitId || l.nom.toLowerCase() === target.produit.toLowerCase()
            );
            return !(matchProd && Math.abs(cr.montantTotal - target.montant) < 100);
          }),
        };
      });
    }

    set({
      ventes: updatedVentes,
      stocks: updatedStocks,
      clients: updatedClients,
      historique: [newHisto, ...state.historique],
    });
  },

  addClient: (nouveauClient) => {
    const state = get();
    const newId = generateUUID();
    const targetBoutique = normalizeLocationId(nouveauClient.boutiqueId);
    const fullClient: ClientDetailed = {
      id: newId,
      nom: nouveauClient.nom,
      telephone: nouveauClient.telephone,
      adresse: nouveauClient.adresse,
      boutique: targetBoutique,
      boutiqueId: targetBoutique,
      creances: [],
    };

    set({ clients: [fullClient, ...state.clients] });
    return fullClient;
  },

  addCreance: (clientId, lignes, date, acompte = 0, modeAcompte = 'Espèces') => {
    const state = get();
    const now = new Date();
    const dateIso = now.toISOString().split('T')[0];
    const dateStr = date || now.toLocaleDateString('fr-FR');
    const heureStr = now.toTimeString().slice(0, 5);
    const montantTotal = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
    const targetClient = state.clients.find((c) => c.id === clientId);
    const clientNom = targetClient?.nom || 'Client Externe';
    const boutiqueId = normalizeLocationId(targetClient?.boutiqueId || state.session?.boutiqueId);

    // 1. Initialisation des paiements sur cette créance si un acompte est versé
    const initialPaiements: PaiementCreance[] = [];
    if (acompte > 0) {
      initialPaiements.push({
        id: generateUUID(),
        montant: acompte,
        mode: modeAcompte,
        date: dateStr,
      });
    }

    const newCreance: Creance = {
      id: generateUUID(),
      date: dateStr,
      lignes,
      montantTotal,
      paiements: initialPaiements,
    };

    // 2. Création automatique de la Vente à crédit correspondante
    const descriptionProduits =
      lignes.length === 1
        ? `${lignes[0].nom} (${lignes[0].quantite} ${lignes[0].unite})`
        : `${lignes.length} articles en gros (${lignes.map((l) => `${l.quantite}${l.unite}`).join(', ')})`;

    const newVente: Vente = {
      id: generateUUID(),
      client: clientNom,
      produit: descriptionProduits,
      produitId: lignes[0]?.produitId || '',
      quantite: lignes.reduce((s, l) => s + l.quantite, 0),
      unite: lignes[0]?.unite || 'mètre',
      montant: montantTotal,
      remise: 0,
      paiement: acompte > 0 ? `${modeAcompte} (${formatMontant(acompte)}) + Crédit` : 'À crédit (100%)',
      date: dateIso,
      heure: heureStr,
      statut: 'validée',
      boutique: boutiqueId,
      vendeur: state.session?.nom || 'Vendeur',
      typeVente: 'credit',
    };

    // 3. Décrémentation physique du stock dans la boutique du client
    const updatedStocks = state.stocks.map((s) => {
      const ligneAchetee = lignes.find(
        (l) =>
          (l.produitId === s.produitId || l.produitId === s.id) &&
          matchesLocation(s.boutiqueId, boutiqueId)
      );
      if (!ligneAchetee) return s;
      return {
        ...s,
        quantite: Math.max(0, s.quantite - ligneAchetee.quantite),
      };
    });

    // 4. Rattachement de la créance au client
    const updatedClients = state.clients.map((c) =>
      c.id === clientId ? { ...c, creances: [newCreance, ...c.creances] } : c
    );

    // 5. Enregistrement dans l'historique d'audit
    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Vente à crédit',
      details: `Commande gros / Crédit de ${formatMontant(montantTotal)} (${lignes.length} produit(s)) pour ${clientNom}${
        acompte > 0 ? ` · Acompte versé: ${formatMontant(acompte)}` : ''
      }`,
      utilisateur: state.session?.nom || 'Vendeur',
      boutique: boutiqueId,
      date: `${dateIso} ${heureStr}`,
      typeAction: 'vente',
    };

    set({
      ventes: [newVente, ...state.ventes],
      stocks: updatedStocks,
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
      id: generateUUID(),
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
      id: generateUUID(),
      action: 'Paiement créance',
      details: `Règlement créance : ${targetClient?.nom} a versé ${formatMontant(montant)} via ${mode}`,
      utilisateur: auteur || state.session?.nom || 'Vendeur',
      boutique: normalizeLocationId(targetClient?.boutiqueId),
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
    const newId = generateUUID();
    const dateStr = new Date().toISOString().split('T')[0];
    const nomBoutiqueDemande =
      state.boutiques.find((b) => matchesLocation(b.id, nouvelleDemande.boutique_demande))?.nom ||
      nouvelleDemande.boutique_demande;

    const fullDemande: Demande = {
      ...nouvelleDemande,
      id: newId,
      statut: 'en_attente',
      date: dateStr,
      boutique_source: nouvelleDemande.boutique_source || 'reseau',
    };

    // Notification diffusée à tous les gérants du réseau
    const newNotif: NotificationItem = {
      id: generateUUID(),
      type: 'demande',
      message: `Nouvelle demande réseau de ${fullDemande.demandeur} (${nomBoutiqueDemande}) : ${fullDemande.produit} (${fullDemande.quantite} ${fullDemande.unite || 'm'})`,
      date: `${dateStr} ${new Date().toTimeString().slice(0, 5)}`,
      lu: false,
      boutique: 'tous',
    };

    set({
      demandes: [fullDemande, ...state.demandes],
      notifications: [newNotif, ...state.notifications],
    });

    return fullDemande;
  },

  updateDemandeStatut: (demandeId, statut, qteAccordee, sourceBoutiqueId, managerName) => {
    const state = get();
    const target = state.demandes.find((d) => d.id === demandeId);
    if (!target) return;

    const qte = qteAccordee !== undefined ? qteAccordee : target.quantite;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    let updatedStocks = [...state.stocks];
    const newHistoItems: HistoriqueItem[] = [];
    const newNotifs: NotificationItem[] = [];

    // 1. Prise en charge et expédition par le premier gérant :
    if (statut === 'en_transfert' && sourceBoutiqueId) {
      updatedStocks = updatedStocks.map((s) => {
        const isMatch =
          (s.produitId === target.produit ||
            s.id === target.produit ||
            state.produits.find((p) => p.id === s.produitId)?.nom.toLowerCase() ===
              target.produit.toLowerCase()) &&
          matchesLocation(s.boutiqueId, sourceBoutiqueId);

        if (isMatch) {
          return { ...s, quantite: Math.max(0, s.quantite - qte) };
        }
        return s;
      });

      const nomSource =
        state.boutiques.find((b) => matchesLocation(b.id, sourceBoutiqueId))?.nom || sourceBoutiqueId;
      const nomDest =
        state.boutiques.find((b) => matchesLocation(b.id, target.boutique_demande))?.nom || target.boutique_demande;

      newHistoItems.push({
        id: generateUUID(),
        action: 'Transfert réassort',
        details: `Prise en charge réassort #${demandeId.slice(0, 8)} : ${qte} ${target.unite || 'm'} de ${target.produit} expédiés depuis ${nomSource} vers ${nomDest}`,
        utilisateur: managerName || 'Gérant',
        boutique: sourceBoutiqueId,
        date: `${dateStr} ${heureStr}`,
        typeAction: 'transfert',
      });

      newNotifs.push({
        id: generateUUID(),
        type: 'transfert' as any,
        message: `${nomSource} a pris en charge votre demande de ${target.produit} (${qte} ${target.unite || 'm'}). Expédition en cours.`,
        date: `${dateStr} ${heureStr}`,
        lu: false,
        boutique: target.boutique_demande,
      });
    }

    // 2. Réception confirmée par la boutique demandeuse :
    if (statut === 'livree') {
      let destFound = false;
      updatedStocks = updatedStocks.map((s) => {
        const isMatch =
          (s.produitId === target.produit ||
            s.id === target.produit ||
            state.produits.find((p) => p.id === s.produitId)?.nom.toLowerCase() ===
              target.produit.toLowerCase()) &&
          matchesLocation(s.boutiqueId, target.boutique_demande);

        if (isMatch) {
          destFound = true;
          return { ...s, quantite: s.quantite + qte };
        }
        return s;
      });

      if (!destFound) {
        const prodObj = state.produits.find(
          (p) =>
            p.nom.toLowerCase() === target.produit.toLowerCase() ||
            p.id === target.produit
        );
        if (prodObj) {
          updatedStocks.push({
            id: generateUUID(),
            produitId: prodObj.id,
            boutiqueId: target.boutique_demande,
            quantite: qte,
            unite: target.unite || 'mètre',
            prixVente: 5000,
            prixMinimal: 4500,
            seuil: 10,
          });
        }
      }

      const nomDest =
        state.boutiques.find((b) => matchesLocation(b.id, target.boutique_demande))?.nom || target.boutique_demande;

      newHistoItems.push({
        id: generateUUID(),
        action: 'Réception réassort',
        details: `Réception réassort #${demandeId.slice(0, 8)} : ${qte} ${target.unite || 'm'} de ${target.produit} ajoutés à ${nomDest}`,
        utilisateur: managerName || 'Boutiquier',
        boutique: target.boutique_demande,
        date: `${dateStr} ${heureStr}`,
        typeAction: 'transfert',
      });

      newNotifs.push({
        id: generateUUID(),
        type: 'validation',
        message: `Réassort livré : ${qte} ${target.unite || 'm'} de ${target.produit} ajoutés à votre stock physique.`,
        date: `${dateStr} ${heureStr}`,
        lu: false,
        boutique: target.boutique_demande,
      });
    }

    set({
      demandes: state.demandes.map((d) => {
        if (d.id !== demandeId) return d;
        return {
          ...d,
          statut,
          quantite: qte,
          boutique_source: sourceBoutiqueId || d.boutique_source,
        };
      }),
      stocks: updatedStocks,
      historique: [...newHistoItems, ...state.historique],
      notifications: [...newNotifs, ...state.notifications],
    });
  },

  createTransfert: ({ produitNom, sourceId, destId, quantite, unite, pieces, auteur }) => {
    const state = get();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    const prod = state.produits.find(
      (p) => p.nom.toLowerCase() === produitNom.toLowerCase()
    );
    const prodId = prod?.id;

    let sourceStockItem: StockItem | undefined;
    let destStockFound = false;

    // 1. Décrémenter la source
    let updatedStocks = state.stocks.map((s) => {
      const matchProd = prodId ? s.produitId === prodId : false;
      if (matchProd && matchesLocation(s.boutiqueId, sourceId)) {
        sourceStockItem = s;
        return { ...s, quantite: Math.max(0, s.quantite - quantite) };
      }
      return s;
    });

    // 2. Incrémenter la destination ou créer la ligne de stock
    updatedStocks = updatedStocks.map((s) => {
      const matchProd = prodId ? s.produitId === prodId : false;
      if (matchProd && matchesLocation(s.boutiqueId, destId)) {
        destStockFound = true;
        return {
          ...s,
          quantite: s.quantite + quantite,
          pieces: pieces ? (s.pieces || 0) + pieces : s.pieces,
        };
      }
      return s;
    });

    if (!destStockFound && prodId) {
      const newStockRow: StockItem = {
        id: generateUUID(),
        produitId: prodId,
        boutiqueId: destId,
        quantite,
        unite: unite || sourceStockItem?.unite || 'mètre',
        prixVente: sourceStockItem?.prixVente || 4500,
        prixMinimal: sourceStockItem?.prixMinimal || 4000,
        seuil: 10,
        pieces: pieces || Math.ceil(quantite / 20),
      };
      updatedStocks = [...updatedStocks, newStockRow];
    }

    const getNomEmplacement = (id: string) => {
      if (id === 'entrepot' || id === 'b-ent' || id === ENTREPOT_ID) return 'Entrepôt Central Yoff';
      return state.boutiques.find((b) => matchesLocation(b.id, id))?.nom || id;
    };

    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Transfert',
      details: `Transfert expédié : ${quantite}${unite} ${produitNom} (${getNomEmplacement(sourceId)} → ${getNomEmplacement(destId)})`,
      utilisateur: auteur || state.session?.nom || 'Gérant',
      boutique: sourceId,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'transfert',
    };

    set({
      stocks: updatedStocks,
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

  // Boutiques & Emplacements
  addBoutique: (nouvelleBoutique) => {
    const state = get();
    const newId = generateUUID();
    const fullBoutique: Boutique = {
      id: newId,
      code: nouvelleBoutique.code,
      nom: nouvelleBoutique.nom,
      type: nouvelleBoutique.type,
      lieu: nouvelleBoutique.lieu,
      adresse: nouvelleBoutique.adresse,
      telephone: nouvelleBoutique.telephone,
      gerant: nouvelleBoutique.gerant,
      actif: true,
    };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Boutique',
      details: `Création du nouvel emplacement : ${fullBoutique.nom} (${fullBoutique.code})`,
      utilisateur: state.session?.nom || 'Gérant',
      boutique: newId,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'catalogue',
    };

    const newNotif: NotificationItem = {
      id: generateUUID(),
      type: 'boutique',
      message: `Nouvel emplacement créé : ${fullBoutique.nom} (${fullBoutique.type})`,
      date: `${dateStr} ${heureStr}`,
      lu: false,
      boutique: newId,
    };

    set({
      boutiques: [...state.boutiques, fullBoutique],
      historique: [newHisto, ...state.historique],
      notifications: [newNotif, ...state.notifications],
    });

    return fullBoutique;
  },

  updateBoutique: (id, modifs) => {
    set((state) => ({
      boutiques: state.boutiques.map((b) =>
        b.id === id ? { ...b, ...modifs } : b
      ),
    }));
  },

  toggleBoutiqueActif: (id) => {
    set((state) => ({
      boutiques: state.boutiques.map((b) =>
        b.id === id ? { ...b, actif: !b.actif } : b
      ),
    }));
  },

  // Utilisateurs & Invitations (Flow A)
  addUtilisateur: (nouvelUtilisateur) => {
    const state = get();
    const newId = generateUUID();
    const randomHex = Array.from({ length: 4 }, () =>
      Math.random().toString(36).substring(2, 15)
    ).join('').slice(0, 64);
    const expires = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    const fullUser: UtilisateurItem = {
      ...nouvelUtilisateur,
      id: newId,
      boutique: normalizeLocationId(nouvelUtilisateur.boutique),
      derniereConnexion: 'Jamais (Invitation en attente)',
      invitationToken: randomHex,
      invitationExpiresAt: expires,
      premiereConnexion: true,
      actif: true,
    };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const heureStr = now.toTimeString().slice(0, 5);

    const newHisto: HistoriqueItem = {
      id: generateUUID(),
      action: 'Invitation',
      details: `Invitation envoyée à ${fullUser.nom} (${fullUser.telephone}) - Rôle: ${fullUser.role}`,
      utilisateur: state.session?.nom || 'Gérant',
      boutique: fullUser.boutique,
      date: `${dateStr} ${heureStr}`,
      typeAction: 'connexion',
    };

    set({
      utilisateurs: [fullUser, ...state.utilisateurs],
      historique: [newHisto, ...state.historique],
    });

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

  resendInvitation: (id) => {
    const randomHex = Array.from({ length: 4 }, () =>
      Math.random().toString(36).substring(2, 15)
    ).join('').slice(0, 64);
    const expires = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    set((state) => ({
      utilisateurs: state.utilisateurs.map((u) =>
        u.id === id
          ? {
              ...u,
              invitationToken: randomHex,
              invitationExpiresAt: expires,
              derniereConnexion: 'Invitation relancée',
            }
          : u
      ),
    }));

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.afd-textile.sn';
    return {
      token: randomHex,
      activationUrl: `${baseUrl}/activer-compte?token=${randomHex}`,
    };
  },

  activateUserPassword: (token, _newPassword) => {
    const state = get();
    const targetUser = state.utilisateurs.find((u) => u.invitationToken === token);
    if (!targetUser) return false;

    set((s) => ({
      utilisateurs: s.utilisateurs.map((u) =>
        u.id === targetUser.id
          ? {
              ...u,
              premiereConnexion: false,
              invitationToken: undefined,
              derniereConnexion: 'Compte activé (Prêt à se connecter)',
              actif: true,
            }
          : u
      ),
    }));
    return true;
  },
}));

export { VENTES_SEMAINE, TOP_PRODUITS, formatMontant };
