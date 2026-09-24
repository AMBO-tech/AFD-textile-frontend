import React, { useState } from 'react';
import {
  MessageSquare, CheckCircle, Search, Plus, Boxes
} from 'lucide-react';

import DemandesStockList from './DemandesStockList';
import DemandesTrackingList from './DemandesTrackingList';
import NewDemandeModal from './NewDemandeModal';
import DemandeValidationModal from './DemandeValidationModal';
import { useCategoriesQuery } from '../../hooks/queries/useProductsQuery';

type Statut = Demande['statut'];

const STATUTS: { id: Statut; label: string; color: string; bg: string }[] = [
  { id: 'en_attente', label: 'En attente', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'acceptee', label: 'AcceptÃ©e', color: '#22C55E', bg: '#F0FDF4' },
  { id: 'refusee', label: 'RefusÃ©e', color: '#EF4444', bg: '#FEF2F2' },
  { id: 'en_transfert', label: 'En transfert', color: '#1E88E5', bg: '#EBF5FB' },
  { id: 'livree', label: 'LivrÃ©e', color: '#22C55E', bg: '#F0FDF4' },
];

interface DemandesProps {
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string;
  onNavigate?: (s: string) => void;
}

export const Demandes: React.FC<DemandesProps> = ({ role, boutiqueId = 'b1' }) => {
  const { data: categories = [] } = useCategoriesQuery();
  const CATEGORIES_DATA = categories.map((c: any) => ({
    nom: c.nom,
    couleur: c.couleur || '#1E88E5' // Fallback color if missing
  }));

  const demandes: any = [];
const produits: any = [];
const boutiques: any = [];
const createDemande: any = [];
const updateDemandeStatut: any = [];

  const [activeTab, setActiveTab] = useState<'stocks' | 'demandes'>('stocks');

  // Filtres
  const [search, setSearch] = useState('');
  const [filtreCat, setFiltreCat] = useState<string>('toutes');
  const [filterStatut, setFilterStatut] = useState<Statut | ''>('');

  // Modals
  const [showNew, setShowNew] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [validation, setValidation] = useState<{ demande: Demande; action: 'acceptee' | 'refusee' } | null>(null);
  const [qteModif, setQteModif] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const maBoutique = boutiques.find((b: any) => b.id === boutiqueId) || boutiques[0];

  const getBoutiqueName = (id: string) => {
    if (id === 'entrepot') return 'EntrepÃ´t Central';
    return boutiques.find((b: any) => b.id === id)?.nom ?? id;
  };

  // PÃ©rimÃ¨tre des stocks selon le rÃ´le
  const produitsEmplacement = role === 'gerant'
    ? produits
    : produits.filter((p: any) => p.boutique === boutiqueId);

  // Filtrage et tri des stocks (ordre croissant de quantitÃ©)
  const stocksTries = produitsEmplacement
    .filter((p: any) => {
      const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.categorie.toLowerCase().includes(search.toLowerCase()) ||
        (p.couleur && p.couleur.toLowerCase().includes(search.toLowerCase()));
      const matchCat = filtreCat === 'toutes' || p.categorie === filtreCat;
      return matchSearch && matchCat;
    })
    .sort((a: any, b: any) => a.quantite - b.quantite);

  const stocksCritiques = produitsEmplacement.filter((p: any) => p.quantite <= p.seuil);
  const demandesEnAttente = demandes.filter((d: any) => d.statut === 'en_attente');

  // Filtrage des demandes
  const demandesFiltrees = demandes.filter((d: any) => {
    const matchStatut = !filterStatut || d.statut === filterStatut;
    const matchSearch = d.produit.toLowerCase().includes(search.toLowerCase()) ||
      (d.demandeur && d.demandeur.toLowerCase().includes(search.toLowerCase()));
    const matchBoutique = role === 'gerant' || d.boutique_demande === boutiqueId;
    return matchStatut && matchSearch && matchBoutique;
  });

  const handleOpenDemande = (p?: Produit) => {
    setSelectedProduit(p || null);
    setShowNew(true);
  };

  const handleValidation = () => {
    if (!validation) return;
    const qteNum = qteModif ? parseFloat(qteModif) : undefined;
    updateDemandeStatut(validation.demande.id, validation.action, qteNum);
    setValidation(null);
    setSuccessMsg(`Demande ${validation.action === 'acceptee' ? 'validÃ©e' : 'refusÃ©e'}.`);
    setTimeout(() => setSuccessMsg(null), 3000);
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
      boutique_demande: role === 'boutiquier' ? boutiqueId : 'b1',
      boutique_source: 'entrepot',
      priorite: data.priorite,
      demandeur: role === 'gerant' ? 'GÃ©rant' : 'Boutiquier',
    });

    setShowNew(false);
    setSelectedProduit(null);
    setSuccessMsg(`Demande de ${data.quantite} ${data.unite} envoyÃ©e.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const getStatutCfg = (s: Statut) => STATUTS.find((st: any) => st.id === s) || STATUTS[0];

  return (
    <div className="space-y-4">
      {/* â”€â”€ En-tÃªte Ã©purÃ© â”€â”€ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Demandes</h1>
          <p className="text-sm text-gray-500">
            {role === 'boutiquier' ? (
              <span>
                {stocksCritiques.length} alerte{stocksCritiques.length !== 1 ? 's' : ''} Â· {demandesEnAttente.length} en attente Â· <strong className="text-gray-700">{maBoutique?.nom}</strong>
              </span>
            ) : (
              <span>
                {demandesEnAttente.length} en attente Â· {stocksCritiques.length} stock{stocksCritiques.length !== 1 ? 's' : ''} critique{stocksCritiques.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => handleOpenDemande()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <Plus size={16} /> Demande
        </button>
      </div>

      {/* â”€â”€ Notification â”€â”€ */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-green-800 text-sm animate-fade-in shadow-sm">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* â”€â”€ Onglets bleus unifiÃ©s â”€â”€ */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'stocks'
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
          style={activeTab === 'stocks' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
        >
          <Boxes size={15} />
          <span>Stocks & RÃ©appro</span>
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
          onClick={() => setActiveTab('demandes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'demandes'
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
          style={activeTab === 'demandes' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
        >
          <MessageSquare size={15} />
          <span>Suivi des demandes</span>
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
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          VUE 1 : STOCKS (TriÃ© par quantitÃ© croissante)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === 'stocks' && (
        <div className="space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              placeholder="Rechercher un tissuâ€¦"
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
            />
          </div>

          {/* Filtres catÃ©gories */}
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
            {CATEGORIES_DATA.map((c: any) => {
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

          {/* Liste Ã©purÃ©e des stocks */}
          <DemandesStockList
            stocks={stocksTries}
            onOpenDemande={handleOpenDemande}
          />
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          VUE 2 : SUIVI DES DEMANDES
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === 'demandes' && (
        <div className="space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              placeholder="Rechercher une demandeâ€¦"
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
            />
          </div>

          {/* Filtres statuts */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {[{ label: 'Toutes', id: '' as const }, ...STATUTS.map((s: any) => ({ label: s.label, id: s.id }))].map((s: any) => {
              const count = s.id ? demandes.filter((d: any) => d.statut === s.id).length : demandes.length;
              const active = filterStatut === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilterStatut(s.id as Statut | '')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            getStatutCfg={getStatutCfg as any}
            onValidate={(demande: any, action: any) => {
              setValidation({ demande, action });
              setQteModif(action === 'acceptee' ? String(demande.quantite) : '');
            }}
          />
        </div>
      )}

      {/* â”€â”€ MODAL : NOUVELLE DEMANDE â”€â”€ */}
      <NewDemandeModal
        isOpen={showNew}
        onClose={() => {
          setShowNew(false);
          setSelectedProduit(null);
        }}
        selectedProduit={selectedProduit}
        onSubmit={handleSendDemande}
      />

      {/* â”€â”€ MODAL : VALIDATION GÃ‰RANT â”€â”€ */}
      <DemandeValidationModal boutiques={[]} allStocks={[]} getBoutiqueName={() => ""} 
        validation={validation as any}
        
        
        onClose={() => setValidation(null)}
        onConfirm={handleValidation}
      />
    </div>
  );
};

export default Demandes;
