import React, { useState } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import type { ClientDetailed, Produit, LigneProduitCreance } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';

interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientDetailed;
  produits: Produit[];
  onSubmit: (lignes: LigneProduitCreance[]) => void;
}

export const NewDebtModal: React.FC<NewDebtModalProps> = ({
  isOpen,
  onClose,
  client,
  produits,
  onSubmit,
}) => {
  const [lignes, setLignes] = useState<LigneProduitCreance[]>([]);
  const [selectedProdId, setSelectedProdId] = useState(produits[0]?.id || '');
  const [quantite, setQuantite] = useState('6');
  const [prixUnitaire, setPrixUnitaire] = useState(produits[0]?.prix?.toString() || '4500');

  if (!isOpen) return null;

  const handleAjouterLigne = () => {
    const prod = produits.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const qteNum = parseFloat(quantite) || 1;
    const prixNum = parseFloat(prixUnitaire) || prod.prix;

    setLignes((prev) => [
      ...prev,
      {
        produitId: prod.id,
        nom: prod.nom,
        quantite: qteNum,
        unite: prod.unite,
        prixUnitaire: prixNum,
      },
    ]);
  };

  const handleSupprimerLigne = (index: number) => {
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const total = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lignes.length === 0) return;
    onSubmit(lignes);
    setLignes([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="font-display font-bold text-gray-900 text-base">
              Nouvelle Créance — {client.nom}
            </div>
            <div className="text-xs text-gray-400">
              Sélectionnez les tissus livrés à crédit
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Formulaire ajout ligne */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
            <div className="text-xs font-bold text-gray-700">Ajouter un tissu au panier crédit</div>

            <div className="space-y-1">
              <label className="block text-[11px] text-gray-500">Modèle de tissu</label>
              <select
                value={selectedProdId}
                onChange={(e) => {
                  setSelectedProdId(e.target.value);
                  const p = produits.find((pr) => pr.id === e.target.value);
                  if (p) setPrixUnitaire(p.prix.toString());
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
              >
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} ({p.categorie} - {p.couleur})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-500">Quantité (mètres)</label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500">Prix unitaire accordé (FCFA)</label>
                <input
                  type="number"
                  value={prixUnitaire}
                  onChange={(e) => setPrixUnitaire(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAjouterLigne}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors"
            >
              <Plus size={14} />
              Ajouter cette ligne
            </button>
          </div>

          {/* Tableau des lignes ajoutées */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-700">Lignes enregistrées ({lignes.length})</div>
            {lignes.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                Aucun article ajouté pour le moment.
              </div>
            ) : (
              <div className="space-y-1.5">
                {lignes.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-800">{l.nom}</div>
                      <div className="text-[11px] text-gray-400">
                        {l.quantite} {l.unite} × {formatMontant(l.prixUnitaire)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs">
                        {formatMontant(l.quantite * l.prixUnitaire)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSupprimerLigne(i)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer avec total et validation */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-[11px] text-gray-500">Montant total à inscrire :</div>
            <div className="font-display font-bold text-red-600 text-base">{formatMontant(total)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={lignes.length === 0}
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 disabled:opacity-50"
              style={{ background: '#0F3D5E' }}
            >
              Enregistrer la créance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDebtModal;
