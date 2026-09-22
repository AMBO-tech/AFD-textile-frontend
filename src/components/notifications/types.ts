/**
 * Type Notification — correspond à la réponse réelle de l'API backend.
 * Remplace l'ancien type issu du mock store.
 */
export interface Notification {
  id: string;
  userId: string | null;
  locationId: string | null;
  titre: string;
  message: string;
  type: string;
  referenceId: string | null;
  lu: boolean;
  createdAt: string;
}
