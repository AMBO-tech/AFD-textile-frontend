import React, { useState, useMemo } from 'react';
import {
  MessageSquare, CheckCircle, Search, Plus, Boxes, Globe, ArrowLeftRight
} from 'lucide-react';
import { useMockStore, type Demande, type StockEnriched } from '../../data/useMockStore';
import { CATEGORIES_DATA } from '../../data/mock';
import DemandesStockList from './DemandesStockList';
import DemandesTrackingList from './DemandesTrackingList';
import DemandesStockConsultation from './DemandesStockConsultation';
import NewDemandeModal from './NewDemandeModal';
import DemandeValidationModal from './DemandeValidationModal';
import { toast } from 'sonner';

type Statut = Demande['statut'];

const STATUTS: { id: Statut; label: string; color: string; bg: string }[] = [
  { id: 'en_attente', label: 'En attente', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'acceptee', label: 'Acceptée', color: '#22C55E', bg: '#F0FDF4' },
  { id: 'refusee', label: 'Refusée', color: '#EF4444', bg: '#FEF2F2' },
  { id: 'en_transfert', label: 'En transfert', color: '#1E88E5', bg: '#EBF5FB' },
  { id: 'livree', label: 'Livrée', color: '#22C55E', bg: '#F0FDF4' },
];

interface DemandesProps {
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string;
  onNavigate?: (s: string) => void;
}

export const Demandes: React.FC<DemandesProps> = ({ role, boutiqueId = 'b1', onNavigate }) => {
  const {
    demandes,
    boutiques,
    session,
    createDemande,
    updateDemandeStatut,
    getStocksEnriched,
    stocks,
    produits,
  } = useMockStore();

  const [activeTab, setActiveTab] = useState<'stocks' | 'demandes' | 'reseau'>(
    role === 'gerant' ? 'demandes' : 'stocks'
  );

  // Filtres
  const [search, setSearch] = useState('');
  const [filtreCat, setFiltreCat] = useState<string>('toutes');
  const [filterStatut, setFilterStatut] = useState<Statut | ''>('');

  // Modals
  const [showNew, setShowNew] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [demandeToValidate, setDemandeToValidate] = useState<Demande | null>(null);
  const [selectedProduit, setSelectedProduit] = useState<StockEnriched | null>(null);
  const [validation, setValidation] = useState<{ demande: Demande; action: 'acceptee' | 'refusee' } | null>(null);

  const maBoutique = boutiques.find((b) => b.id === boutiqueId) || boutiques[0];

  const getBoutiqueName = (id: string) => {
    if (id === 'entrepot' || id === 'b-ent') return 'Entrepôt Central';
    return boutiques.find((b) => b.id === id)?.nom ?? id;
  };

  // Périmètre des stocks physiques selon le rôle
  const produitsEmplacement = useMemo(() => {
    return role === 'gerant' ? getStocksEnriched() : getStocksEnriched(boutiqueId);
  }, [getStocksEnriched, role, boutiqueId, stocks, produits]);

  // Filtrage et tri des stocks (ordre croissant de quantité)
  const stocksTries = useMemo(() => {
    return produitsEmplacement
      .filter((p: StockEnriched) => {
        const matchSearch =
          p.nom.toLowerCase().includes(search.toLowerCase()) ||
          p.categorie.toLowerCase().includes(search.toLowerCase()) ||
          (p.couleur && p.couleur.toLowerCase().includes(search.toLowerCase()));
        const matchCat = filtreCat === 'toutes' || p.categorie === filtreCat;
        return matchSearch && matchCat;
      })
      .sort((a: StockEnriched, b: StockEnriched) => a.quantite - b.quantite);
  }, [produitsEmplacement, search, filtreCat]);

  const stocksCritiques = useMemo(() => {
    return produitsEmplacement.filter((p: StockEnriched) => p.quantite <= p.seuil);
  }, [produitsEmplacement]);
  const demandesEnAttente = demandes.filter((d) => d.statut === 'en_attente');

  // Filtrage des demandes
  const demandesFiltrees = demandes.filter((d) => {
    const matchStatut = !filterStatut || d.statut === filterStatut;
    const matchSearch = d.produit.toLowerCase().includes(search.toLowerCase()) ||
      (d.demandeur && d.demandeur.toLowerCase().includes(search.toLowerCase()));
    const matchBoutique = role === 'gerant' || d.boutique_demande === boutiqueId;
    return matchStatut && matchSearch && matchBoutique;
  });

  const handleOpenDemande = (p?: StockEnriched) => {
    setSelectedProduit(p || null);
    setShowNew(true);
  };

  const handleConfirmValidation = ({
    demandeId,
    action,
    sourceBoutiqueId,
    quantite,
    motifRefus,
  }: {
    demandeId: string;
    action: 'acceptee' | 'refusee';
    sourceBoutiqueId?: string;
    quantite?: number;
    motifRefus?: string;
  }) => {
    if (action === 'refusee') {
      updateDemandeStatut(demandeId, 'refusee', undefined, undefined, session?.nom || 'Gérant');
      toast.error(`Demande #${demandeId} refusée : ${motifRefus || 'Non accordée'}.`);
    } else {
      if (!sourceBoutiqueId) {
        toast.error("Veuillez sélectionner un emplacement source d'expédition.");
        return;
      }
      const targetDemande = demandes.find((d) => d.id === demandeId);
      const isEntrepot = sourceBoutiqueId === 'entrepot' || sourceBoutiqueId === 'b-ent';
      const nomSource = isEntrepot
        ? 'Entrepôt Central'
        : (boutiques.find((b) => b.id === sourceBoutiqueId)?.nom || sourceBoutiqueId);
      const nomDest = getBoutiqueName(targetDemande?.boutique_demande || '');

      updateDemandeStatut(
        demandeId,
        'en_transfert',
        quantite,
        sourceBoutiqueId,
        session?.nom || 'Gérant'
      );

      toast.success(
        `Transfert validé ! Expédition de ${quantite} ${targetDemande?.unite || 'm'} depuis ${nomSource} vers ${nomDest}.`
      );
    }
    setValidation(null);
  };

  const handleSendDemande = (data: {
    produit: string;
    quantite: number;
    unite: string;
    priorite: Demande['priorite'];
  }) => {
    createDemande({
      produit: data.produit,
      quantite: data.quantite,
      unite: data.unite,
      boutique_demande: role === 'boutiquier' ? boutiqueId : (session?.boutiqueId || 'b1'),
      boutique_source: 'reseau',
      priorite: data.priorite,
      demandeur: session?.nom || (role === 'gerant' ? 'Gérant' : 'Boutiquier'),
    });

    setShowNew(false);
    setSelectedProduit(null);
    toast.success(`Demande de ${data.quantite} ${data.unite} de ${data.produit} diffusée à tout le réseau.`);
  };

  const handleConfirmReception = (demande: Demande) => {
    updateDemandeStatut(demande.id, 'livree', demande.quantite, demande.boutique_source, session?.nom);
    toast.success(`Réassort réceptionné ! ${demande.quantite} ${demande.unite || 'm'} de ${demande.produit} ajoutés au stock.`);
  };

  const getStatutCfg = (s: Statut) => STATUTS.find((st) => st.id === s) || STATUTS[0];

  return (
    <div className="space-y-4">
      {/* ── En-tête épuré ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">
            {role === 'gerant' ? 'Validation des Réapprovisionnements' : 'Demandes de Réappro'}
          </h1>
          <p className="text-sm text-gray-500">
            {role === 'boutiquier' ? (
              <span>
                {stocksCritiques.length} alerte{stocksCritiques.length !== 1 ? 's' : ''} · {demandesEnAttente.length} en attente · <strong className="text-gray-700">{maBoutique?.nom}</strong>
              </span>
            ) : (
              <span>
                {demandesEnAttente.length} demande{demandesEnAttente.length > 1 ? 's' : ''} en attente de décision · {stocksCritiques.length} stock{stocksCritiques.length > 1 ? 's' : ''} critique{stocksCritiques.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        {/* Le bouton d'action : Demande pour le boutiquier, Nouveau transfert direct pour le gérant */}
        {role === 'boutiquier' ? (
          <button
            onClick={() => handleOpenDemande()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <Plus size={16} /> Demande
          </button>
        ) : (
          <button
            onClick={() => onNavigate?.('entrepot')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            title="Aller vers le module des transferts pour effectuer une expédition directe"
          >
            <ArrowLeftRight size={16} /> Nouveau transfert
          </button>
        )}
      </div>

      {/* ── Onglets bleus unifiés ── */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('demandes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'demandes'
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
          style={activeTab === 'demandes' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
        >
          <MessageSquare size={15} />
          <span>{role === 'gerant' ? 'Demandes à pourvoir' : 'Suivi des demandes'}</span>
          {demandesEnAttente.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'demandes' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {demandesEnAttente.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'stocks'
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
          style={activeTab === 'stocks' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
        >
          <Boxes size={15} />
          <span>{role === 'gerant' ? 'Stocks critiques' : 'Stocks & Réappro'}</span>
          {stocksCritiques.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'stocks' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'
              }`}
            >
              {stocksCritiques.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reseau')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'reseau'
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
          style={activeTab === 'reseau' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
        >
          <Globe size={15} />
          <span>Disponibilités réseau</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          VUE 1 : STOCKS (Trié par quantité croissante)
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stocks' && (
        <div className="space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un tissu…"
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
            />
          </div>

          {/* Filtres catégories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            <button
              onClick={() => setFiltreCat('toutes')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filtreCat === 'toutes'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
              style={filtreCat === 'toutes' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
            >
              Toutes
            </button>
            {CATEGORIES_DATA.map((c) => {
              const active = filtreCat === c.nom;
              return (
                <button
                  key={c.nom}
                  onClick={() => setFiltreCat(c.nom)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
                >
                  {c.nom}
                </button>
              );
            })}
          </div>

          {/* Liste épurée des stocks */}
          <DemandesStockList
            stocks={stocksTries}
            onOpenDemande={handleOpenDemande}
            role={role}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VUE 2 : SUIVI DES DEMANDES
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'demandes' && (
        <div className="space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une demande…"
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
            />
          </div>

          {/* Filtres statuts */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {[{ label: 'Toutes', id: '' as const }, ...STATUTS.map((s) => ({ label: s.label, id: s.id }))].map((s) => {
              const count = s.id ? demandes.filter((d) => d.statut === s.id).length : demandes.length;
              const active = filterStatut === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilterStatut(s.id as Statut | '')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
                >
                  {s.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Liste des demandes */}
          <DemandesTrackingList
            demandes={demandesFiltrees}
            role={role}
            getBoutiqueName={getBoutiqueName}
            getStatutCfg={getStatutCfg}
            onValidate={(demande, action) => {
              setValidation({ demande, action });
            }}
            onConfirmReception={handleConfirmReception}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VUE 3 : DISPONIBILITÉS RÉSEAU (DemandesStockConsultation)
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reseau' && (
        <DemandesStockConsultation
          produits={getStocksEnriched()}
          boutiques={boutiques}
          boutiqueCouranteId={boutiqueId}
          role={role}
          onNavigate={onNavigate}
          onCreerDemande={(prod) => {
            handleOpenDemande(prod);
          }}
        />
      )}

      {/* ── MODAL : NOUVELLE DEMANDE (Boutiquier) ── */}
      <NewDemandeModal
        isOpen={showNew}
        onClose={() => {
          setShowNew(false);
          setSelectedProduit(null);
        }}
        selectedProduit={selectedProduit}
        onSubmit={handleSendDemande}
      />

      {/* ── MODAL : VALIDATION & EXPÉDITION GÉRANT ── */}
      <DemandeValidationModal
        validation={validation}
        boutiques={boutiques}
        allStocks={getStocksEnriched()}
        getBoutiqueName={getBoutiqueName}
        onClose={() => setValidation(null)}
        onConfirm={handleConfirmValidation}
      />
    </div>
  );
};

export default Demandes;
