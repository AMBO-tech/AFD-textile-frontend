import React, { useState, useEffect } from 'react';
import { X, Send, Package } from 'lucide-react';
import type { Produit, Demande } from '../../data/useMockStore';

interface NewDemandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduit: Produit | null;
  onSubmit: (data: {
    produit: string;
    quantite: number;
    unite: string;
    priorite: Demande['priorite'];
  }) => void;
}

export const NewDemandeModal: React.FC<NewDemandeModalProps> = ({
  isOpen,
  onClose,
  selectedProduit,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    produit: '',
    quantite: '20',
    unite: 'mètre',
    priorite: 'normale' as Demande['priorite'],
  });

  useEffect(() => {
    if (selectedProduit) {
      setForm({
        produit: selectedProduit.nom,
        quantite: String(Math.max(selectedProduit.seuil * 2, 20)),
        unite: selectedProduit.unite || 'mètre',
        priorite: selectedProduit.quantite <= selectedProduit.seuil ? 'haute' : 'normale',
      });
    } else {
      setForm({
        produit: '',
        quantite: '20',
        unite: 'mètre',
        priorite: 'normale',
      });
    }
  }, [selectedProduit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.produit.trim() || !form.quantite) return;
    const qteNum = parseFloat(form.quantite) || 0;
    if (qteNum <= 0) return;

    onSubmit({
      produit: form.produit.trim(),
      quantite: qteNum,
      unite: form.unite,
      priorite: form.priorite,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 animate-scale-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-900 text-base">
            Nouvelle demande
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X size={15} />
          </button>
        </div>

        {/* Aperçu produit */}
        {selectedProduit && (
          <div className="bg-blue-50/60 rounded-xl p-3 mb-3 flex items-center gap-2.5 border border-blue-100/50">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-blue-100 flex-shrink-0">
              {selectedProduit.photo ? (
                <img src={selectedProduit.photo} alt={selectedProduit.nom} className="w-full h-full object-cover" />
              ) : (
                <Package size={16} className="text-blue-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 text-xs truncate">{selectedProduit.nom}</div>
              <div className="text-[11px] text-gray-500">Stock actuel : {selectedProduit.quantite} {selectedProduit.unite}</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {!selectedProduit && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tissu</label>
              <input
                value={form.produit}
                onChange={(e) => setForm((f) => ({ ...f, produit: e.target.value }))}
                placeholder="Nom du tissu"
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none"
              />
            </div>
          )}

          {/* Quantité & Unité */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantité</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={form.quantite}
                onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))}
                min="1"
                placeholder="20"
                className="w-28 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-bold text-gray-900 focus:outline-none"
              />
              <select
                value={form.unite}
                onChange={(e) => setForm((f) => ({ ...f, unite: e.target.value }))}
                className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 focus:outline-none"
              >
                {['mètre', 'yard', 'kilo', 'rouleau', 'pièce'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            {/* Raccourcis */}
            <div className="flex gap-1.5 mt-1.5">
              {['+10', '+20', '+50'].map((plus) => (
                <button
                  key={plus}
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(form.quantite) || 0;
                    const add = parseInt(plus.replace('+', ''), 10);
                    setForm((f) => ({ ...f, quantite: String(cur + add) }));
                  }}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[11px] font-medium"
                >
                  {plus}
                </button>
              ))}
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Urgence</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'normale', label: 'Normale' },
                { id: 'haute', label: 'Urgente' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, priorite: p.id as any }))}
                  className={`py-2 rounded-xl text-xs font-medium transition-all ${
                    form.priorite === p.id
                      ? 'text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                  }`}
                  style={form.priorite === p.id ? { background: '#0F3D5E' } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.produit || !form.quantite || parseFloat(form.quantite) <= 0}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mt-2"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <Send size={14} />
            <span>Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDemandeModal;
