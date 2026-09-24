import { formatMontant } from '@/utils/format';
import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';



interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientDetailed;
  produits: Produit[];
  onSubmit: (lignes: LigneProduitCreance[], acompte: number, modeAcompte: string) => void;
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
  const [acompte, setAcompte] = useState('0');
  const [modeAcompte, setModeAcompte] = useState('Espèces');
  const [errorStock, setErrorStock] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedProd = produits.find((p) => p.id === selectedProdId) || produits[0];

  const handleAjouterLigne = () => {
    if (!selectedProd) return;
    setErrorStock(null);

    const qteNum = parseFloat(quantite) || 1;
    const prixNum = parseFloat(prixUnitaire) || selectedProd.prix;

    // Vérification disponibilité du stock
    if (qteNum > selectedProd.quantite) {
      setErrorStock(
        `Stock insuffisant : seulement ${selectedProd.quantite} ${selectedProd.unite} disponible(s) pour "${selectedProd.nom}".`
      );
      return;
    }

    setLignes((prev) => [
      ...prev,
      {
        produitId: selectedProd.id,
        nom: selectedProd.nom,
        quantite: qteNum,
        unite: selectedProd.unite,
        prixUnitaire: prixNum,
      },
    ]);
  };

  const handleSupprimerLigne = (index: number) => {
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const total = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  const acompteNum = Math.min(total, Math.max(0, parseFloat(acompte) || 0));
  const soldeRestant = Math.max(0, total - acompteNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lignes.length === 0) return;
    onSubmit(lignes, acompteNum, modeAcompte);
    setLignes([]);
    setAcompte('0');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 mb-2 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-gray-900 text-base">
                Commande Gros & Vente à Crédit
              </div>
              <div className="text-xs text-gray-500">
                Client : <strong className="text-gray-800">{client.nom}</strong> ({client.telephone || 'Sans tél'})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps déroulant */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Alerte explicative du flow métier */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Cette commande génère automatiquement une <strong>vente confirmée</strong>, décrémente
              le <strong>stock magasin</strong> et impute le <strong>solde restant dû</strong> au compte créance du client.
            </p>
          </div>

          {/* Formulaire ajout ligne d'article */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Sélectionner les tissus livrés
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-600">
                Tissu / Article en stock
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => {
                  setSelectedProdId(e.target.value);
                  const p = produits.find((pr) => pr.id === e.target.value);
                  if (p) setPrixUnitaire(p.prix.toString());
                  setErrorStock(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} — {p.categorie} ({p.couleur}) · Dispo: {p.quantite} {p.unite}
                  </option>
                ))}
              </select>
              {selectedProd && (
                <div className="text-[11px] text-gray-500 flex justify-between px-1">
                  <span>
                    Stock actuel :{' '}
                    <strong className={selectedProd.quantite < 10 ? 'text-amber-600' : 'text-green-600'}>
                      {selectedProd.quantite} {selectedProd.unite}
                    </strong>
                  </span>
                  <span>Prix catalogue : {formatMontant(selectedProd.prix)}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-gray-600">
                  Quantité ({selectedProd?.unite || 'mètres'}) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  value={quantite}
                  onChange={(e) => {
                    setQuantite(e.target.value);
                    setErrorStock(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600">
                  Prix unitaire gros (FCFA) *
                </label>
                <input
                  type="number"
                  value={prixUnitaire}
                  onChange={(e) => setPrixUnitaire(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {errorStock && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>{errorStock}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAjouterLigne}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 active:scale-[0.99] transition-all shadow-xs"
            >
              <Plus size={14} />
              Ajouter cet article à la commande
            </button>
          </div>

          {/* Tableau des lignes ajoutées */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              2. Articles commandés ({lignes.length})
            </div>
            {lignes.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                Aucun article ajouté pour le moment.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
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
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-xs">
                        {formatMontant(l.quantite * l.prixUnitaire)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSupprimerLigne(i)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Acompte et ventilation financière */}
          {lignes.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                3. Acompte initial versé (Optionnel)
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-gray-500">Montant acompte (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    max={total}
                    value={acompte}
                    onChange={(e) => setAcompte(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500">Mode de règlement</label>
                  <select
                    value={modeAcompte}
                    onChange={(e) => setModeAcompte(e.target.value)}
                    disabled={acompteNum === 0}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Virement">Virement</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">Total commande</span>
                  <span className="font-bold text-gray-900">{formatMontant(total)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Acompte payé</span>
                  <span className="font-bold text-green-600">{formatMontant(acompteNum)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Créance restante</span>
                  <span className="font-bold text-red-600">{formatMontant(soldeRestant)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec total et validation */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-[11px] text-gray-500">Solde créance à inscrire :</div>
            <div className="font-display font-bold text-red-600 text-base">
              {formatMontant(soldeRestant)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={lignes.length === 0}
              onClick={handleSubmit}
              className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              <CheckCircle2 size={14} />
              Valider la commande & créance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDebtModal;
