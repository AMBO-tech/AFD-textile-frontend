import type { Client } from '@/types/clients';
import type { MoyenPaiement } from '@/types/enums';
import { MODES_PAIEMENT as MODES_CAISSE } from '../../features/pos/types';

/** Modes d'encaissement d'un règlement ou d'un acompte : les mêmes qu'en caisse. */
export const MODES_PAIEMENT: readonly { label: string; api: MoyenPaiement }[] = MODES_CAISSE;

/** Solde restant dû, calculé par l'API sur les factures impayées du client. */
export function soldeClient(c: Pick<Client, 'soldeDu' | 'totalDu'>): number {
  return c.soldeDu ?? c.totalDu ?? 0;
}
