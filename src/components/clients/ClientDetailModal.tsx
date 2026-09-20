import React, { useMemo } from 'react';
import {
  X,
  Plus,
  CreditCard,
  Phone,
  MapPin,
  Clock,
  Store,
  MessageCircle,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { useMockStore, type ClientDetailed, type Creance } from '../../data/useMockStore';
import { soldeClient } from './types';
import { formatMontant } from '../../data/mock';

interface ClientDetailModalProps {
  client: ClientDetailed | null;
  boutiqueNom?: string;
  onClose: () => void;
  onOpenNewDebt: () => void;
  onOpenPayment: (creance: Creance) => void;
}

const getModeBadgeStyle = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'wave':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'orange money':
    case 'om':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'free money':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'carte bancaire':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'espèces':
    case 'especes':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  boutiqueNom,
  onClose,
  onOpenNewDebt,
  onOpenPayment,
}) => {
  const { boutiques } = useMockStore();

  const activeBoutiqueNom = useMemo(() => {
    if (boutiqueNom) return boutiqueNom;
    if (!client) return 'Boutique AFD';
    const found = boutiques.find((b) => b.id === client.boutiqueId);
    return found ? found.nom : client.boutique || 'Boutique AFD';
  }, [boutiqueNom, client, boutiques]);

  const totalAchats = useMemo(() => {
    if (!client) return 0;
    return client.creances.reduce((acc, cr) => acc + cr.montantTotal, 0);
  }, [client]);

  const totalPaye = useMemo(() => {
    if (!client) return 0;
    return client.creances.reduce(
      (acc, cr) => acc + cr.paiements.reduce((pSum, p) => pSum + p.montant, 0),
      0
    );
  }, [client]);

  const solde = useMemo(() => {
    if (!client) return 0;
    return soldeClient(client);
  }, [client]);

  const tauxRecouvrement = totalAchats > 0 ? Math.min(100, Math.round((totalPaye / totalAchats) * 100)) : 100;
  const aDesDettes = solde > 0;

  if (!client) return null;

  const handleWhatsApp = () => {
    const cleanPhone = client.telephone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      aDesDettes
        ? `Bonjour ${client.nom}, AFD Textile (${activeBoutiqueNom}) vous informe d'un solde restant de ${formatMontant(
            solde
          )} sur vos achats de tissus. Merci de nous contacter pour votre règlement.`
        : `Bonjour ${client.nom}, l'équipe AFD Textile (${activeBoutiqueNom}) vous remercie pour votre fidélité. Votre compte est parfaitement à jour.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${client.telephone}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* 1. Entête élégante avec Avatar, Infos client & Actions rapides */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Avatar avec initiales */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-white text-base shadow-sm flex-shrink-0"
                style={{
                  background: aDesDettes
                    ? 'linear-gradient(135deg, #EF4444, #F97316)'
                    : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
                }}
              >
                {client.nom
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl truncate">
                    {client.nom}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      aDesDettes
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {aDesDettes ? (
                      <>
                        <AlertCircle size={12} />
                        <span>Créance : {formatMontant(solde)}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Compte à jour</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Métadonnées & rattachement boutique */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    <Store size={12} />
                    <span>{activeBoutiqueNom}</span>
                  </span>
                  {client.telephone && (
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <Phone size={12} className="text-gray-400" />
                      <span>{client.telephone}</span>
                    </span>
                  )}
                  {client.adresse && (
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <MapPin size={12} className="text-gray-400" />
                      <span>{client.adresse}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton de fermeture */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Boutons de contact direct */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
            {client.telephone && (
              <>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleCall}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Phone size={14} className="text-gray-500" />
                  <span>Appeler</span>
                </button>
              </>
            )}

            <div className="ml-auto">
              <button
                type="button"
                onClick={onOpenNewDebt}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                <Plus size={14} />
                <span>Nouvelle commande / créance</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Tableau de bord financier (3 cartes KPI + Taux de recouvrement) */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-b from-gray-50/80 to-gray-50/20 border-b border-gray-100 flex-shrink-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                <Receipt size={13} className="text-gray-400" />
                <span>Total Facturé</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                {formatMontant(totalAchats)}
              </div>
              <div className="text-[10px] text-gray-400">
                {client.creances.length} dossier{client.creances.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp size={13} className="text-emerald-500" />
                <span>Total Encaissé</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-600 mt-0.5">
                {formatMontant(totalPaye)}
              </div>
              <div className="text-[10px] text-emerald-600/80 font-medium">
                {tauxRecouvrement}% réglé
              </div>
            </div>

            <div
              className={`rounded-2xl p-3 border shadow-xs ${
                aDesDettes
                  ? 'bg-rose-50/60 border-rose-200/80'
                  : 'bg-emerald-50/60 border-emerald-200/80'
              }`}
            >
              <div
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  aDesDettes ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                <CreditCard size={13} />
                <span>Solde Restant</span>
              </div>
              <div
                className={`text-base sm:text-lg font-bold mt-0.5 ${
                  aDesDettes ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {formatMontant(solde)}
              </div>
              <div
                className={`text-[10px] font-medium ${
                  aDesDettes ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {aDesDettes ? 'À régulariser' : 'Aucun impayé'}
              </div>
            </div>
          </div>

          {/* Barre de progression globale */}
          {totalAchats > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-gray-500 font-medium mb-1">
                <span>Recouvrement total des créances</span>
                <span className="font-semibold text-gray-700">{tauxRecouvrement}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${tauxRecouvrement}%`,
                    background:
                      tauxRecouvrement === 100
                        ? '#10B981'
                        : 'linear-gradient(90deg, #1E88E5, #10B981)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Corps scrollable : Dossiers de créances et versements */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              <span>Dossiers de vente à crédit ({client.creances.length})</span>
            </h3>
          </div>

          {client.creances.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/60">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-gray-800">Aucun dossier de dette en cours</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Ce client n'a aucun historique d'impayé. Vous pouvez lui créer une commande en gros ou vente à crédit à tout moment.
              </p>
              <button
                type="button"
                onClick={onOpenNewDebt}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                <Plus size={14} />
                <span>Créer une vente à crédit</span>
              </button>
            </div>
          ) : (
            client.creances.map((cr) => {
              const paye = cr.paiements.reduce((s, p) => s + p.montant, 0);
              const reste = Math.max(0, cr.montantTotal - paye);
              const isSolde = reste === 0;
              const dossierPct =
                cr.montantTotal > 0
                  ? Math.min(100, Math.round((paye / cr.montantTotal) * 100))
                  : 100;

              return (
                <div
                  key={cr.id}
                  className={`rounded-2xl border transition-all p-4 space-y-3.5 bg-white ${
                    isSolde
                      ? 'border-gray-100 shadow-xs'
                      : 'border-rose-100 shadow-xs hover:border-rose-200'
                  }`}
                >
                  {/* Entête du dossier */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSolde ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        <Calendar size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900">
                          Commande du {cr.date}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-2 font-mono">
                          ID: {cr.id.replace('cr_init_', '').replace('cr_', '#')}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isSolde
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isSolde ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Soldé</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          <span>Reste {formatMontant(reste)}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Barre de règlement du dossier */}
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                      <span>
                        Total : <strong className="text-gray-800">{formatMontant(cr.montantTotal)}</strong>
                      </span>
                      <span>
                        Versé : <strong className="text-emerald-700">{formatMontant(paye)}</strong> ({dossierPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSolde ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${dossierPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Liste des articles du dossier */}
                  <div className="space-y-1.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Package size={11} />
                      <span>Articles achetés :</span>
                    </div>
                    <div className="space-y-1 divide-y divide-gray-100">
                      {cr.lignes.map((l, i) => (
                        <div key={i} className="pt-1 first:pt-0 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <span className="font-medium text-gray-900">{l.nom}</span>
                            <span className="text-gray-400 text-[11px]">
                              ({l.quantite} {l.unite})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-gray-900">
                              {formatMontant(l.quantite * l.prixUnitaire)}
                            </span>
                            {l.quantite > 1 && (
                              <span className="text-[10px] text-gray-400 block">
                                à {formatMontant(l.prixUnitaire)} / {l.unite}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historique des paiements déjà versés */}
                  {cr.paiements.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <TrendingUp size={11} />
                        <span>Règlements reçus ({cr.paiements.length}) :</span>
                      </div>
                      <div className="space-y-1">
                        {cr.paiements.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-600"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getModeBadgeStyle(
                                  p.mode
                                )}`}
                              >
                                {p.mode}
                              </span>
                              <span className="text-gray-400 text-[11px]">{p.date}</span>
                            </div>
                            <span className="font-bold text-emerald-600">
                              +{formatMontant(p.montant)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action de règlement si non soldé */}
                  {!isSolde && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenPayment(cr)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs active:scale-95"
                      >
                        <CreditCard size={13} />
                        <span>Encaisser un versement</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 4. Pied de modale */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div className="text-xs text-gray-500">
            Client affilié : <strong className="text-gray-700">{activeBoutiqueNom}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
