import React from 'react'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { usePosStore } from '@/stores/posStore'

export const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, getSousTotalBrut, getRemiseMontant, getTotalNet } = usePosStore()

  const sousTotal = getSousTotalBrut()
  const remise = getRemiseMontant()
  const totalNet = getTotalNet()

  return (
    <div className="space-y-4">
      {/* Cart List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {cartItems.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Ticket vide. Cliquez sur un article pour l'ajouter.
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.produitId}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{item.produitNom}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {item.prixUnitaire.toLocaleString('fr-FR')} FCFA / {item.unite}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.produitId, -1)}
                  className="w-6 h-6 rounded bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 shadow-xs cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold w-6 text-center text-slate-900">{item.quantite}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.produitId, 1)}
                  className="w-6 h-6 rounded bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Line Price */}
              <div className="text-right min-w-[70px]">
                <div className="text-xs font-bold text-slate-900">
                  {(item.prixUnitaire * item.quantite).toLocaleString('fr-FR')} F
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFromCart(item.produitId)}
                className="text-slate-400 hover:text-danger transition-colors p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals Summary */}
      {cartItems.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Sous-total brut :</span>
            <span className="font-semibold">{sousTotal.toLocaleString('fr-FR')} FCFA</span>
          </div>

          {remise > 0 && (
            <div className="flex justify-between text-success font-semibold">
              <span>Remise déduite :</span>
              <span>- {remise.toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}

          <div className="flex justify-between text-slate-900 text-sm font-display font-bold pt-2 border-t border-slate-200">
            <span>Total Net à Encaisser :</span>
            <span className="text-primary">{totalNet.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      )}
    </div>
  )
}
