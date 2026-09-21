import React, { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { formatMontant } from '../../data/mock';
import type { Produit, Categorie, Boutique } from '../../data/useMockStore';
import { type DropdownOption } from '../ui/CustomDropdownSelect';
import StockInCategoriesStep from '../../features/stocks/components/StockInCategoriesStep';
import StockInProductsStep from '../../features/stocks/components/StockInProductsStep';
import StockInConfigStep from '../../features/stocks/components/StockInConfigStep';

const UNITES_STOCK = ['mètre', 'yard', 'kilo', 'rouleau'] as const;

interface StockInWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Categorie[];
  produitsCatalogue: Produit[];
  boutiques: Boutique[];
  role: 'gerant' | 'boutiquier';
  boutiqueId: string;
  emplacementInitial?: string;
  onOpenNewCat: () => void;
  onOpenNewProd: () => void;
  onSubmit: (params: {
    produitId: string;
    quantite: number;
    prix: number;
    prixMinimal?: number;
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
  boutiqueId = 'b1',
  emplacementInitial,
  onOpenNewCat,
  onOpenNewProd,
  onSubmit,
}) => {
  const [etape, setEtape] = useState<'categories' | 'produits' | 'config'>('categories');
  const [catChoisie, setCatChoisie] = useState<string>('');
  const [produitChoisi, setProduitChoisi] = useState<Produit | null>(null);
  const [searchProd, setSearchProd] = useState('');

  const [form, setForm] = useState({
    emplacement: emplacementInitial || boutiqueId || boutiques[0]?.id || 'b1',
    quantite: '',
    unite: 'mètre' as typeof UNITES_STOCK[number],
    prix: '',
    prixMinimal: '',
    pieces: '',
    seuil: '10',
  });

  if (!isOpen) return null;

  const prodsFiltres = produitsCatalogue.filter((p) => {
    const matchCat = !catChoisie || p.categorie.toLowerCase() === catChoisie.toLowerCase();
    const matchSearch =
      !searchProd ||
      p.nom.toLowerCase().includes(searchProd.toLowerCase()) ||
      (p.couleur?.toLowerCase().includes(searchProd.toLowerCase()) ?? false);
    return matchCat && matchSearch;
  });

  const handleSelectCat = (nom: string) => {
    setCatChoisie(nom);
    setEtape('produits');
  };

  const handleSelectProd = (prod: Produit) => {
    setProduitChoisi(prod);
    setForm((prev) => ({
      ...prev,
      prix: prod.prix ? prod.prix.toString() : '',
      prixMinimal: prod.prix ? Math.round(prod.prix * 0.9).toString() : '',
      unite: (prod.unite as any) || 'mètre',
    }));
    setEtape('config');
  };

  const handleSubmitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produitChoisi) return;

    onSubmit({
      produitId: produitChoisi.id,
      emplacement: role === 'gerant' ? form.emplacement : boutiqueId,
      quantite: parseFloat(form.quantite) || 0,
      unite: form.unite,
      prix: parseFloat(form.prix) || produitChoisi.prix || 0,
      prixMinimal: form.prixMinimal ? parseFloat(form.prixMinimal) : undefined,
      pieces: form.pieces ? parseInt(form.pieces, 10) : 1,
      seuil: parseFloat(form.seuil) || 10,
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setEtape('categories');
    setCatChoisie('');
    setProduitChoisi(null);
    setSearchProd('');
    setForm({
      emplacement: emplacementInitial || boutiqueId || boutiques[0]?.id || 'b1',
      quantite: '',
      unite: 'mètre',
      prix: '',
      prixMinimal: '',
      pieces: '',
      seuil: '10',
    });
    onClose();
  };

  const optionsEmplacement: DropdownOption[] = boutiques.map((b) => ({
    value: b.id,
    label: b.nom,
    sublabel: `${b.type === 'ENTREPOT' ? 'Entrepôt central' : 'Boutique'} • ${b.lieu}`,
    badge: b.type === 'ENTREPOT' ? 'ENTREPÔT' : 'POINT DE VENTE',
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header modal */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {etape !== 'categories' && (
              <button
                onClick={() => setEtape(etape === 'config' ? 'produits' : 'categories')}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
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
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="flex-1 overflow-y-auto py-2">
          {etape === 'categories' && (
            <StockInCategoriesStep
              categories={categories}
              onSelectCat={handleSelectCat}
              onOpenNewCat={onOpenNewCat}
            />
          )}

          {etape === 'produits' && (
            <StockInProductsStep
              searchProd={searchProd}
              onSearchChange={setSearchProd}
              onOpenNewProd={onOpenNewProd}
              prodsFiltres={prodsFiltres}
              onSelectProd={handleSelectProd}
              formatMontant={formatMontant}
            />
          )}

          {etape === 'config' && produitChoisi && (
            <StockInConfigStep
              produitChoisi={produitChoisi}
              role={role}
              boutiqueId={boutiqueId}
              boutiques={boutiques}
              optionsEmplacement={optionsEmplacement}
              form={form}
              setForm={setForm}
              onSubmit={handleSubmitConfig}
              onBack={() => setEtape('produits')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StockInWizardModal;
