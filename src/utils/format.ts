/**
 * Formate un nombre en devise XOF (Franc CFA)
 * @param montant Le montant à formater
 * @returns La chaîne formatée (ex: "1 500 F CFA")
 */
export const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
};
