import React, { useState } from 'react';
import { X, ChevronLeft, Search, Plus, CheckCircle, Package } from 'lucide-react';
import type { Produit, Categorie, Boutique } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';

const UNITES_STOCK = ['mètre', 'yard', 'kilo', 'rouleau'] as const;

interface StockInWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Categorie[];
  produitsCatalogue: Produit[];
  boutiques: Boutique[];
  role: 'gerant' | 'boutiquier';
  boutiqueId: string;
  onOpenNewCat: () => void;
  onOpenNewProd: () => void;
  onSubmit: (params: {
    produitId: string;
    quantite: number;
    prix: number;
    unite: string;
    pieces: number;
    seuil: number;
    emplacement: string;
  }) => void;
}

export const StockInWizardModal: React.FC<StockInWizardModalProps> = ({
  isOpen,
  onClose,
  categories,
  produitsCatalogue,
  boutiques,
  role,
  boutiqueId,
  onOpenNewCat,
  onOpenNewProd,
  onSubmit,
}) => {
  const [etape, setEtape] = useState<'categories' | 'produits' | 'config'>('categories');
  const [catChoisie, setCatChoisie] = useState<string | null>(null);
  const [produitChoisi, setProduitChoisi] = useState<Produit | null>(null);
  const [searchProd, setSearchProd] = useState('');

  // Formulaire configuration
  const [form, setForm] = useState({
    emplacement: role === 'boutiquier' ? boutiqueId : 'entrepot',
    prix: '',
    quantite: '10',
    unite: 'mètre' as typeof UNITES_STOCK[number],
    pieces: '',
    seuil: '15',
  });

  if (!isOpen) return null;

  const handleSelectCat = (catNom: string) => {
    setCatChoisie(catNom);
    setEtape('produits');
  };

  const handleSelectProd = (prod: Produit) => {
    setProduitChoisi(prod);
    setForm((f) => ({
      ...f,
      prix: prod.prix.toString(),
      unite: (prod.unite as typeof UNITES_STOCK[number]) || 'mètre',
      seuil: prod.seuil.toString(),
    }));
    setEtape('config');
  };

  const handleSubmitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produitChoisi) return;

    onSubmit({
      produitId: produitChoisi.id,
      quantite: parseFloat(form.quantite) || 0,
      prix: parseFloat(form.prix) || produitChoisi.prix,
      unite: form.unite,
      pieces: parseInt(form.pieces, 10) || 0,
      seuil: parseInt(form.seuil, 10) || 10,
      emplacement: form.emplacement,
    });

    onClose();
  };

  const resetAndClose = () => {
    setEtape('categories');
    setCatChoisie(null);
    setProduitChoisi(null);
    setSearchProd('');
    onClose();
  };

  const prodsFiltres = produitsCatalogue.filter(
    (p) =>
      (!catChoisie || p.categorie === catChoisie) &&
      p.nom.toLowerCase().includes(searchProd.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header modal */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {etape !== 'categories' && (
              <button
                onClick={() => setEtape(etape === 'config' ? 'produits' : 'categories')}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <div className="font-display font-bold text-gray-900 text-base">
                Mise en Stock —{' '}
                {etape === 'categories'
                  ? 'Étape 1 : Choisir la Catégorie'
                  : etape === 'produits'
                  ? `Étape 2 : Choisir le Modèle (${catChoisie})`
                  : 'Étape 3 : Paramètres de Stock'}
              </div>
              <div className="text-xs text-gray-400">
                {etape === 'categories'
                  ? 'Sélectionnez le type de tissu'
                  : etape === 'produits'
                  ? 'Sélectionnez un modèle ou créez-en un'
                  : 'Définissez la quantité et les prix'}
              </div>
            </div>
          </div>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Étape 1 : Catégories */}
          {etape === 'categories' && (
            <div>
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={onOpenNewCat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} />
                  Nouvelle Catégorie
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat.nom}
                    onClick={() => handleSelectCat(cat.nom)}
                    className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col items-center text-center group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden mb-2 bg-gray-200">
                      <img
                        src={cat.photo}
                        alt={cat.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="font-semibold text-gray-800 text-xs">{cat.nom}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 2 : Produits */}
          {etape === 'produits' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchProd}
                    onChange={(e) => setSearchProd(e.target.value)}
                    placeholder="Filtrer les modèles..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={onOpenNewProd}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors flex-shrink-0"
                >
                  <Plus size={14} />
                  Nouveau Modèle
                </button>
              </div>

              <div className="space-y-2">
                {prodsFiltres.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">
                    Aucun modèle trouvé. Créez-en un avec le bouton ci-dessus.
                  </div>
                ) : (
                  prodsFiltres.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleSelectProd(prod)}
                      className="w-full p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 flex items-center justify-between text-left transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={prod.photo} alt={prod.nom} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs">{prod.nom}</div>
                          <div className="text-[11px] text-gray-500">{prod.couleur}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-xs">
                          {formatMontant(prod.prix)}
                        </div>
                        <div className="text-[10px] text-gray-400">par {prod.unite}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Étape 3 : Configuration */}
          {etape === 'config' && produitChoisi && (
            <form onSubmit={handleSubmitConfig} className="space-y-3.5">
              {/* Carte résumé produit choisi */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                  <img src={produitChoisi.photo} alt={produitChoisi.nom} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{produitChoisi.nom}</div>
                  <div className="text-xs text-blue-700 font-medium">
                    {produitChoisi.categorie} • {produitChoisi.couleur}
                  </div>
                </div>
              </div>

              {/* Emplacement destination */}
              {role === 'gerant' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Emplacement de stockage *
                  </label>
                  <select
                    value={form.emplacement}
                    onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="entrepot">Entrepôt Central</option>
                    {boutiques.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nom} ({b.lieu})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-gray-50 text-xs text-gray-600">
                  Destination : <span className="font-bold text-gray-900">Boutique Dakar (Locale)</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantité reçue *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.quantite}
                    onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unité</label>
                  <select
                    value={form.unite}
                    onChange={(e) =>
                      setForm({ ...form, unite: e.target.value as typeof UNITES_STOCK[number] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {UNITES_STOCK.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prix unitaire de vente (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.prix}
                    onChange={(e) => setForm({ ...form, prix: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Seuil d'alerte critique
                  </label>
                  <input
                    type="number"
                    value={form.seuil}
                    onChange={(e) => setForm({ ...form, seuil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEtape('produits')}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95"
                  style={{ background: '#0F3D5E' }}
                >
                  Valider la mise en stock
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockInWizardModal;
