import React, { useState, useMemo } from 'react';
import { useMockStore, type Produit, type StockEnriched } from '../../data/useMockStore';
import { BOUTIQUE_IDS, ENTREPOT_ID } from '../../data/mock';
import EntrepotTransferForm from './EntrepotTransferForm';
import EntrepotStockList from './EntrepotStockList';
import EntrepotTransferHistory from './EntrepotTransferHistory';

export const Entrepot: React.FC = () => {
  const { boutiques, historique, createTransfert, session, getStocksEnriched } = useMockStore();

  const [activeTab, setActiveTab] = useState<'transferer' | 'historique'>('transferer');
  const [sourceId, setSourceId] = useState<string>(ENTREPOT_ID);
  const [destId, setDestId] = useState<string>(BOUTIQUE_IDS.PLATEAU);
  const [produitChoisi, setProduitChoisi] = useState<StockEnriched | null>(null);
  const [quantite, setQuantite] = useState('20');
  const [unite, setUnite] = useState('mètre');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Produits physiques disponibles à l'emplacement source
  const prodsSource = useMemo(() => {
    return getStocksEnriched(sourceId);
  }, [getStocksEnriched, sourceId]);

  const handleSelectProduit = (p: StockEnriched) => {
    setProduitChoisi(p);
    setUnite(p.unite);
    setQuantite(Math.min(20, p.quantite).toString());
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produitChoisi) return;

    const qteNum = parseFloat(quantite);
    if (isNaN(qteNum) || qteNum <= 0) return;

    createTransfert({
      produitNom: produitChoisi.nom,
      sourceId,
      destId,
      quantite: qteNum,
      unite,
      auteur: session?.nom || 'Gérant',
    });

    setSuccessMsg(`Transfert de ${qteNum} ${unite} de ${produitChoisi.nom} effectué avec succès !`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setProduitChoisi(null);
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">
            Entrepôt Central & Transferts
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion du hub logistique et dispatch inter-boutiques
          </p>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('transferer')}
            className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'transferer'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Nouveau transfert
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historique')}
            className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'historique'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Historique transferts
          </button>
        </div>
      </div>

      {/* Message de succès */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-50 text-green-700 text-xs font-medium border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Contenu de l'onglet */}
      {activeTab === 'transferer' ? (
        <div className="space-y-4">
          <EntrepotTransferForm
            produit={produitChoisi}
            sourceId={sourceId}
            onSourceChange={(id) => {
              setSourceId(id);
              setProduitChoisi(null);
            }}
            destId={destId}
            onDestChange={setDestId}
            quantite={quantite}
            onQuantiteChange={setQuantite}
            unite={unite}
            onUniteChange={setUnite}
            boutiques={boutiques}
            onSubmit={handleSubmitTransfer}
          />

          <EntrepotStockList
            produits={prodsSource}
            produitSelectionne={produitChoisi}
            onSelectProduit={handleSelectProduit}
          />
        </div>
      ) : (
        <EntrepotTransferHistory historique={historique} />
      )}
    </div>
  );
};

export default Entrepot;
