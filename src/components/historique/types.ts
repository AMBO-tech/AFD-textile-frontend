import type { LucideIcon } from 'lucide-react';
import {
  ShoppingCart,
  Wallet,
  Boxes,
  ArrowLeftRight,
  Package,
  FolderTree,
  Store,
  Users,
  UserRound,
  LogIn,
  CalendarClock,
  History,
} from 'lucide-react';
import type { AuditEntry } from '@/services/audit.service';

export interface DomaineHistorique {
  id: string;
  label: string;
  /** Filtre envoyé à l'API. */
  filtre: { ressourceType?: string; action?: string };
}

export const DOMAINES: DomaineHistorique[] = [
  { id: 'tout', label: 'Tout', filtre: {} },
  { id: 'ventes', label: 'Ventes', filtre: { ressourceType: 'Vente' } },
  { id: 'reglements', label: 'Règlements', filtre: { ressourceType: 'Encaissement' } },
  { id: 'stock', label: 'Stock', filtre: { ressourceType: 'Stock' } },
  { id: 'transferts', label: 'Transferts', filtre: { ressourceType: 'Transfert' } },
  { id: 'produits', label: 'Produits', filtre: { ressourceType: 'Produit' } },
  { id: 'categories', label: 'Catégories', filtre: { ressourceType: 'Categorie' } },
  { id: 'emplacements', label: 'Boutiques', filtre: { ressourceType: 'Emplacement' } },
  { id: 'clients', label: 'Clients', filtre: { ressourceType: 'Client' } },
  { id: 'equipe', label: 'Équipe', filtre: { ressourceType: 'Utilisateur' } },
  { id: 'connexions', label: 'Connexions', filtre: { action: 'CONNEXION' } },
];

interface ActionAffichage {
  label: string;
  icon: LucideIcon;
  couleur: string;
}

const A = (label: string, icon: LucideIcon, couleur: string): ActionAffichage => ({ label, icon, couleur });

/** Libellé, icône et couleur de chaque code d'action du journal. */
export const ACTIONS: Record<string, ActionAffichage> = {
  CONNEXION: A('Connexion', LogIn, 'bg-slate-100 text-slate-700'),
  DECONNEXION: A('Déconnexion', LogIn, 'bg-slate-100 text-slate-500'),
  COMPTE_ACTIVATION: A('Compte activé', UserRound, 'bg-emerald-50 text-emerald-700'),
  MOT_DE_PASSE_REINITIALISATION: A('Mot de passe réinitialisé', UserRound, 'bg-amber-50 text-amber-700'),
  MOT_DE_PASSE_MODIFICATION: A('Mot de passe modifié', UserRound, 'bg-amber-50 text-amber-700'),
  CLIENT_CREATION: A('Client créé', Users, 'bg-violet-50 text-violet-700'),
  CLIENT_MODIFICATION: A('Client modifié', Users, 'bg-violet-50 text-violet-700'),
  CLIENT_ARCHIVAGE: A('Client archivé', Users, 'bg-gray-100 text-gray-600'),
  EMPLACEMENT_CREATION: A('Emplacement créé', Store, 'bg-blue-50 text-blue-700'),
  EMPLACEMENT_MODIFICATION: A('Emplacement modifié', Store, 'bg-blue-50 text-blue-700'),
  EMPLACEMENT_STATUT: A('Emplacement activé / désactivé', Store, 'bg-gray-100 text-gray-600'),
  REGLEMENT_CREATION: A('Règlement encaissé', Wallet, 'bg-emerald-50 text-emerald-700'),
  CANCEL_PAYMENT: A('Règlement annulé', Wallet, 'bg-rose-50 text-rose-700'),
  CATEGORIE_CREATION: A('Catégorie créée', FolderTree, 'bg-indigo-50 text-indigo-700'),
  CATEGORIE_MODIFICATION: A('Catégorie modifiée', FolderTree, 'bg-indigo-50 text-indigo-700'),
  PRODUIT_CREATION: A('Tissu ajouté au catalogue', Package, 'bg-indigo-50 text-indigo-700'),
  PRODUIT_MODIFICATION: A('Tissu modifié', Package, 'bg-indigo-50 text-indigo-700'),
  PRODUIT_ARCHIVAGE: A('Tissu archivé', Package, 'bg-gray-100 text-gray-600'),
  VENTE_CREATION: A('Vente enregistrée', ShoppingCart, 'bg-emerald-50 text-emerald-700'),
  VENTE_SYNCHRONISATION: A('Ventes hors ligne synchronisées', ShoppingCart, 'bg-emerald-50 text-emerald-700'),
  VENTE_ANNULATION: A('Vente annulée', ShoppingCart, 'bg-rose-50 text-rose-700'),
  STOCK_MOUVEMENT: A('Mouvement de stock', Boxes, 'bg-cyan-50 text-cyan-700'),
  STOCK_TARIFS: A('Prix de boutique modifiés', Boxes, 'bg-cyan-50 text-cyan-700'),
  STOCK_AJUSTEMENT_INVENTAIRE: A('Inventaire (ajustement)', Boxes, 'bg-amber-50 text-amber-700'),
  TRANSFERT_DEMANDE: A('Demande de stock', ArrowLeftRight, 'bg-amber-50 text-amber-700'),
  TRANSFERT_DIRECT: A('Transfert direct', ArrowLeftRight, 'bg-blue-50 text-blue-700'),
  TRANSFERT_VALIDATION: A('Transfert validé', ArrowLeftRight, 'bg-emerald-50 text-emerald-700'),
  TRANSFERT_ANNULATION: A('Transfert refusé / annulé', ArrowLeftRight, 'bg-rose-50 text-rose-700'),
  UTILISATEUR_INVITATION: A('Membre invité', UserRound, 'bg-blue-50 text-blue-700'),
  UTILISATEUR_RELANCE_INVITATION: A('Invitation renvoyée', UserRound, 'bg-blue-50 text-blue-700'),
  UTILISATEUR_MODIFICATION: A('Membre modifié', UserRound, 'bg-blue-50 text-blue-700'),
  UTILISATEUR_STATUT: A('Membre activé / désactivé', UserRound, 'bg-gray-100 text-gray-600'),
  SESSION_HEBDO_DECLENCHEE: A('Clôture hebdomadaire', CalendarClock, 'bg-slate-100 text-slate-700'),
  MONDAY_SESSION_GENERATED: A('Clôture hebdomadaire', CalendarClock, 'bg-slate-100 text-slate-700'),
};

export const affichageAction = (code: string): ActionAffichage =>
  ACTIONS[code] ?? A(code.replace(/_/g, ' ').toLowerCase(), History, 'bg-gray-100 text-gray-600');

const montant = (v: unknown) =>
  typeof v === 'number' ? new Intl.NumberFormat('fr-FR').format(v) + ' F' : typeof v === 'string' && v !== '' ? `${v} F` : null;

/** Une ligne lisible tirée des valeurs enregistrées ; `noms` traduit les identifiants (tissus, emplacements). */
export const detailEntree = (e: AuditEntry, noms: Map<string, string> = new Map()): string => {
  const n = (e.nouvelleValeur ?? {}) as Record<string, unknown>;
  const d = (n.donnees ?? {}) as Record<string, unknown>;
  const nom = (id: unknown) => (typeof id === 'string' ? noms.get(id) : undefined);
  const lignesCorps = Array.isArray(d.lignes) ? (d.lignes as Record<string, unknown>[]) : [];
  const morceaux = [
    n.referenceFacture ?? n.referenceRecu ?? n.reference,
    n.nom ?? n.utilisateurNom ?? d.nom,
    n.clientNom,
    n.source && n.destination ? `${n.source} → ${n.destination}` : null,
    n.boutiqueNom,
    nom(d.produitId),
    d.locationId && nom(d.locationId) ? `à ${nom(d.locationId)}` : null,
    d.locationDestinationId && nom(d.locationDestinationId) ? `pour ${nom(d.locationDestinationId)}` : null,
    lignesCorps.length > 0 && lignesCorps.length <= 3
      ? lignesCorps.map((l) => [nom(l.produitId), l.quantite, String(l.unite ?? l.uniteSaisie ?? '').toLowerCase()].filter(Boolean).join(' ')).join(', ')
      : null,
    montant(n.montantTotal),
    typeof n.soldeDu === 'number' && n.soldeDu > 0 ? `reste dû ${montant(n.soldeDu)}` : null,
    d.sens && d.quantite ? `${d.sens === 'ENTREE' ? '+' : '−'}${d.quantite} ${String(d.uniteUtilisee ?? '').toLowerCase()}` : null,
    typeof n.nouveauSolde === 'number' ? `solde ${n.nouveauSolde}` : null,
    Array.isArray(n.lignes) ? `${n.lignes.length} tissu${n.lignes.length > 1 ? 's' : ''}` : null,
    typeof d.motif === 'string' ? `motif : ${d.motif}` : null,
    typeof d.justification === 'string' ? `« ${d.justification} »` : null,
  ].filter((m): m is string => typeof m === 'string' && m.trim() !== '');
  return [...new Set(morceaux)].join(' • ');
};
