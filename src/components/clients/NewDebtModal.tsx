import React, { useState } from 'react';
import { X, Plus, ShoppingBag, CheckCircle2, Package, AlertTriangle } from 'lucide-react';
import type { ClientDetailed, StockEnriched, LigneProduitCreance } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';
import CustomDropdownSelect from '../ui/CustomDropdownSelect';
import NewDebtArticlesList from '../../features/clients/components/NewDebtArticlesList';
import NewDebtDepositSection from '../../features/clients/components/NewDebtDepositSection';
import NewDebtProductSelector from '../../features/clients/components/NewDebtProductSelector';

interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientDetailed;
  produits: StockEnriched[];
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
        produitId: selectedProd.produitId || selectedProd.id,
        nom: selectedProd.nom,
        quantite: qteNum,
        unite: selectedProd.unite || 'mètre',
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
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
          <NewDebtProductSelector
            produits={produits}
            selectedProdId={selectedProdId}
            onSelectProdId={(val) => {
              setSelectedProdId(val);
              const p = produits.find((pr) => pr.id === val);
              if (p) setPrixUnitaire(p.prix.toString());
              setErrorStock(null);
            }}
            selectedProd={selectedProd}
            quantite={quantite}
            onChangeQuantite={(val) => {
              setQuantite(val);
              setErrorStock(null);
            }}
            prixUnitaire={prixUnitaire}
            onChangePrixUnitaire={setPrixUnitaire}
            errorStock={errorStock}
            onAjouterLigne={handleAjouterLigne}
            formatMontant={formatMontant}
          />

          {/* 2. Liste des articles */}
          <NewDebtArticlesList
            lignes={lignes}
            onSupprimerLigne={handleSupprimerLigne}
            formatMontant={formatMontant}
          />

          {/* 3. Acompte & Modalités */}
          {lignes.length > 0 && (
            <NewDebtDepositSection
              total={total}
              acompte={acompte}
              onChangeAcompte={setAcompte}
              modeAcompte={modeAcompte}
              onChangeModeAcompte={setModeAcompte}
              acompteNum={acompteNum}
              soldeRestant={soldeRestant}
              formatMontant={formatMontant}
            />
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={lignes.length === 0}
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            Valider et enregistrer ({formatMontant(total)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDebtModal;
