import React, { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { History, RefreshCw, UserRound, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auditService, type AuditEntry } from '../../services/audit.service';
import { getErrorMessage } from '../../services/api';
import { useUsersListQuery } from '../../hooks/queries/useUsersQuery';
import { useProductsQuery } from '../../hooks/queries/useProductsQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import SelectField from '../ui/SelectField';
import { DOMAINES, affichageAction, detailEntree } from './types';

/** Taille d'une page du journal (plafond API : 100). */
const PAGE = 50;
const JOUR_MS = 24 * 60 * 60 * 1000;

const PERIODES = [
  { value: '', label: 'Toute la période' },
  { value: '1', label: 'Aujourd’hui' },
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
];

const debutPeriode = (jours: string) => {
  if (!jours) return undefined;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - (Number(jours) - 1) * JOUR_MS).toISOString();
};

const libelleJour = (iso: string) => {
  const d = new Date(iso);
  const aujourdhui = new Date();
  const hier = new Date(Date.now() - JOUR_MS);
  if (d.toDateString() === aujourdhui.toDateString()) return 'Aujourd’hui';
  if (d.toDateString() === hier.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-SN', { weekday: 'long', day: 'numeric', month: 'long' });
};

const heure = (iso: string) => new Date(iso).toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' });

/** Journal d'activité du réseau : qui a fait quoi, quand (réservé au gérant). */
export const Historique: React.FC = () => {
  const [domaine, setDomaine] = useState('tout');
  const [auteurId, setAuteurId] = useState('');
  const [periode, setPeriode] = useState('7');

  const { data: usersRes } = useUsersListQuery({ limit: 100 });
  const { data: produitsRes } = useProductsQuery({ limit: 100 });
  const { data: locRes } = useLocationsListQuery({ limit: 100 });
  const noms = useMemo(
    () => new Map([...(produitsRes?.data ?? []), ...(locRes?.data ?? [])].map((x) => [x.id, x.nom] as const)),
    [produitsRes, locRes],
  );
  const filtre = DOMAINES.find((d) => d.id === domaine)?.filtre ?? {};
  const dateDebut = debutPeriode(periode);

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['audit', domaine, auteurId, periode],
    queryFn: ({ pageParam }) =>
      auditService.getLogs({ ...filtre, utilisateurId: auteurId || undefined, dateDebut, page: pageParam, limit: PAGE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const entrees = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;
  const parJour = useMemo(() => {
    const groupes: { jour: string; entrees: AuditEntry[] }[] = [];
    for (const e of entrees) {
      const jour = libelleJour(e.createdAt);
      const dernier = groupes[groupes.length - 1];
      if (dernier?.jour === jour) dernier.entrees.push(e);
      else groupes.push({ jour, entrees: [e] });
    }
    return groupes;
  }, [entrees]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <History size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">Historique</h1>
            <p className="text-xs sm:text-sm text-gray-500">Toutes les actions de l’équipe : ventes, stock, transferts, catalogue, accès</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-xs text-gray-700 border border-gray-200 hover:bg-gray-50 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={isRefetching ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SelectField
          value={auteurId}
          onChange={setAuteurId}
          icon={<UserRound size={16} />}
          aria-label="Membre"
          options={[
            { value: '', label: 'Toute l’équipe', icon: <UserRound size={16} /> },
            ...(usersRes?.data ?? []).map((u) => ({
              value: u.id,
              label: u.nom,
              description: u.role === 'OWNER' ? 'Gérant' : `Boutiquier${u.location ? ` • ${u.location.nom}` : ''}`,
            })),
          ]}
        />
        <SelectField value={periode} onChange={setPeriode} icon={<CalendarDays size={16} />} aria-label="Période" options={PERIODES} />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DOMAINES.map((d) => (
          <button
            key={d.id}
            onClick={() => setDomaine(d.id)}
            className={cn(
              'whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border',
              domaine === d.id ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]' : 'bg-white text-gray-600 border-gray-200',
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-red-100 text-sm text-red-600">
          {getErrorMessage(error, 'L’historique n’a pas pu être chargé.')}
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">Chargement…</div>
      ) : entrees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">
          Aucune action sur cette période avec ces filtres.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            {total} action{total > 1 ? 's' : ''}
          </p>
          {parJour.map((g) => (
            <section key={g.jour} className="space-y-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider first-letter:uppercase">{g.jour}</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-50">
                {g.entrees.map((e) => {
                  const a = affichageAction(e.action);
                  const Icone = a.icon;
                  const detail = detailEntree(e, noms);
                  return (
                    <div key={e.id} className="flex items-start gap-3 p-3 sm:p-4">
                      <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', a.couleur)}>
                        <Icone size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span className="font-semibold text-gray-900 text-sm">{a.label}</span>
                          <span className="text-[11px] text-gray-400 shrink-0">{heure(e.createdAt)}</span>
                        </div>
                        {detail && <div className="text-xs text-gray-600 break-words">{detail}</div>}
                        <div className="text-[11px] text-gray-400">
                          par {e.utilisateur?.nom ?? 'inconnu'} {e.utilisateur?.role === 'OWNER' ? '(gérant)' : '(boutiquier)'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Chargement…' : 'Afficher plus'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Historique;
