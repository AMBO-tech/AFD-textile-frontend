export const BOUTIQUES = [
  { id: 'b1', nom: 'AFD Textile Dakar', lieu: 'Dakar - Plateau', gerant: 'Amadou Diallo' },
  { id: 'b2', nom: 'AFD Textile Pikine', lieu: 'Pikine - Grand-Yoff', gerant: 'Fatou Sow' },
  { id: 'b3', nom: 'AFD Textile Thiès', lieu: 'Thiès - Centre', gerant: 'Mamadou Ndiaye' },
];

export const CATEGORIES_DATA = [
  { nom: 'Wax',        photo: 'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80' },
  { nom: 'Bazin',      photo: 'https://images.unsplash.com/photo-1578509566163-068acd11b8e7?w=600&q=80' },
  { nom: 'Ankara',     photo: 'https://images.unsplash.com/photo-1768212565424-efa3a3852b81?w=600&q=80' },
  { nom: 'Satin',      photo: 'https://images.unsplash.com/photo-1594734415578-00fc9540929b?w=600&q=80' },
  { nom: 'Kente',      photo: 'https://images.unsplash.com/photo-1775688425836-be1637ea6292?w=600&q=80' },
  { nom: 'Bogolan',    photo: 'https://images.unsplash.com/photo-1591957974074-68daffbf8df8?w=600&q=80' },
  { nom: 'Dentelle',   photo: 'https://images.unsplash.com/photo-1627012898015-aa708e5c53ee?w=600&q=80' },
  { nom: 'Mousseline', photo: 'https://images.unsplash.com/photo-1627052045672-be78a58fcd37?w=600&q=80' },
  { nom: 'Tissu coton',photo: 'https://images.unsplash.com/photo-1630920501459-f3e99320c4a5?w=600&q=80' },
  { nom: 'Velours',    photo: 'https://images.unsplash.com/photo-1626123675132-f8a75dad8454?w=600&q=80' },
];

export const CATEGORIES = CATEGORIES_DATA.map(c => c.nom);

export const PRODUITS = [
  { id: 'p1', nom: 'Wax Holland Premium', categorie: 'Wax', couleur: 'Multicolore', prix: 4500, quantite: 120, unite: 'mètre', pieces: 6, boutique: 'b1', seuil: 20, photo: 'https://images.unsplash.com/photo-1655682614757-a9a33fa45c93?w=600&q=80' },
  { id: 'p2', nom: 'Bazin Riche Brodé', categorie: 'Bazin', couleur: 'Bleu Ciel', prix: 6800, quantite: 45, unite: 'mètre', pieces: 3, boutique: 'b1', seuil: 10, photo: 'https://images.unsplash.com/photo-1578509566163-068acd11b8e7?w=600&q=80' },
  { id: 'p3', nom: 'Satin Imperial', categorie: 'Satin', couleur: 'Champagne', prix: 3200, quantite: 8, unite: 'mètre', pieces: 1, boutique: 'b1', seuil: 15, photo: 'https://images.unsplash.com/photo-1606259458027-54d2a728b6ab?w=600&q=80' },
  { id: 'p4', nom: 'Ankara Print Vivid', categorie: 'Ankara', couleur: 'Rouge & Or', prix: 3800, quantite: 200, unite: 'mètre', pieces: 10, boutique: 'b2', seuil: 30, photo: 'https://images.unsplash.com/photo-1768212565424-efa3a3852b81?w=600&q=80' },
  { id: 'p5', nom: 'Kente Tissé Main', categorie: 'Kente', couleur: 'Or & Vert', prix: 12000, quantite: 25, unite: 'yard', pieces: 5, boutique: 'b2', seuil: 5, photo: 'https://images.unsplash.com/photo-1775688425836-be1637ea6292?w=600&q=80' },
  { id: 'p6', nom: 'Bogolan Authentique', categorie: 'Bogolan', couleur: 'Terre & Crème', prix: 5500, quantite: 3, unite: 'mètre', pieces: 1, boutique: 'b3', seuil: 8, photo: 'https://images.unsplash.com/photo-1591957974074-68daffbf8df8?w=600&q=80' },
  { id: 'p7', nom: 'Dentelle Française', categorie: 'Dentelle', couleur: 'Blanc Ivoire', prix: 8900, quantite: 60, unite: 'mètre', pieces: 4, boutique: 'b1', seuil: 10, photo: 'https://images.unsplash.com/photo-1634225234360-7c921a9d2400?w=600&q=80' },
  { id: 'p8', nom: 'Mousseline Légère', categorie: 'Mousseline', couleur: 'Rose Poudré', prix: 2100, quantite: 180, unite: 'mètre', pieces: 9, boutique: 'b3', seuil: 20, photo: 'https://images.unsplash.com/photo-1627052045672-be78a58fcd37?w=600&q=80' },
];

export const CLIENTS = [
  { id: 'c1', nom: 'Mariama Fall', telephone: '+221 77 123 45 67', adresse: 'Dakar, Médina', solde: 125000, boutique: 'b1' },
  { id: 'c2', nom: 'Aïssatou Ba', telephone: '+221 76 234 56 78', adresse: 'Dakar, Plateau', solde: 0, boutique: 'b1' },
  { id: 'c3', nom: 'Cheikh Gueye', telephone: '+221 70 345 67 89', adresse: 'Pikine, Grand-Yoff', solde: 47500, boutique: 'b2' },
  { id: 'c4', nom: 'Sokhna Mbaye', telephone: '+221 77 456 78 90', adresse: 'Dakar, Parcelles', solde: 320000, boutique: 'b2' },
  { id: 'c5', nom: 'Seydou Sy', telephone: '+221 76 567 89 01', adresse: 'Thiès, Centre', solde: 0, boutique: 'b3' },
  { id: 'c6', nom: 'Rokhaya Diop', telephone: '+221 70 678 90 12', adresse: 'Dakar, HLM', solde: 85000, boutique: 'b1' },
];

export const VENTES = [
  { id: 'v1', client: 'Passage', produit: 'Wax Holland Premium', produitId: 'p1', quantite: 6, unite: 'mètre', montant: 27000, remise: 0, paiement: 'Espèces', date: '2026-09-13', heure: '09:15', statut: 'validée', boutique: 'b1', vendeur: 'Amadou Diallo', typeVente: 'comptant' },
  { id: 'v2', client: 'Aïssatou Ba', produit: 'Bazin Riche Brodé', produitId: 'p2', quantite: 4, unite: 'mètre', montant: 27200, remise: 5, paiement: 'Wave', date: '2026-09-13', heure: '10:30', statut: 'validée', boutique: 'b1', vendeur: 'Amadou Diallo', typeVente: 'credit' },
  { id: 'v3', client: 'Passage', produit: 'Kente Tissé Main', produitId: 'p5', quantite: 2, unite: 'yard', montant: 24000, remise: 0, paiement: 'Orange Money', date: '2026-09-13', heure: '11:45', statut: 'validée', boutique: 'b2', vendeur: 'Fatou Sow', typeVente: 'comptant' },
  { id: 'v4', client: 'Cheikh Gueye', produit: 'Ankara Print Vivid', produitId: 'p4', quantite: 10, unite: 'mètre', montant: 38000, remise: 10, paiement: 'Carte bancaire', date: '2026-09-12', heure: '14:20', statut: 'validée', boutique: 'b3', vendeur: 'Mamadou Ndiaye', typeVente: 'credit' },
  { id: 'v5', client: 'Passage', produit: 'Dentelle Française', produitId: 'p7', quantite: 3, unite: 'mètre', montant: 26700, remise: 0, paiement: 'Espèces', date: '2026-09-12', heure: '16:05', statut: 'annulée', boutique: 'b1', vendeur: 'Amadou Diallo', typeVente: 'comptant' },
];

export const DEMANDES = [
  { id: 'd1', produit: 'Wax Holland Premium', quantite: 20, boutique_demande: 'b2', boutique_source: 'b1', statut: 'en_attente', priorite: 'haute', date: '2026-09-13', demandeur: 'Fatou Sow' },
  { id: 'd2', produit: 'Satin Imperial', quantite: 15, boutique_demande: 'b3', boutique_source: 'entrepot', statut: 'acceptee', priorite: 'normale', date: '2026-09-12', demandeur: 'Mamadou Ndiaye' },
  { id: 'd3', produit: 'Bazin Riche Brodé', quantite: 10, boutique_demande: 'b3', boutique_source: 'b1', statut: 'en_transfert', priorite: 'haute', date: '2026-09-11', demandeur: 'Mamadou Ndiaye' },
  { id: 'd4', produit: 'Bogolan Authentique', quantite: 5, boutique_demande: 'b1', boutique_source: 'entrepot', statut: 'livree', priorite: 'normale', date: '2026-09-10', demandeur: 'Amadou Diallo' },
  { id: 'd5', produit: 'Mousseline Légère', quantite: 30, boutique_demande: 'b2', boutique_source: 'b3', statut: 'refusee', priorite: 'basse', date: '2026-09-09', demandeur: 'Fatou Sow' },
];

export const UTILISATEURS = [
  { id: 'u1', nom: 'Amadou Diallo', email: 'amadou.diallo@afd-textile.sn', telephone: '+221 77 010 20 30', role: 'gerant', boutique: 'b1', actif: true, derniereConnexion: '2026-09-13 09:00' },
  { id: 'u2', nom: 'Fatou Sow', email: 'fatou.sow@afd-textile.sn', telephone: '+221 76 112 23 34', role: 'gerant', boutique: 'b2', actif: true, derniereConnexion: '2026-09-13 08:45' },
  { id: 'u3', nom: 'Mamadou Ndiaye', email: 'mamadou.ndiaye@afd-textile.sn', telephone: '+221 70 213 24 35', role: 'gerant', boutique: 'b3', actif: true, derniereConnexion: '2026-09-12 17:30' },
  { id: 'u4', nom: 'Ibrahima Sarr', email: 'ibrahima.sarr@afd-textile.sn', telephone: '+221 77 314 25 36', role: 'boutiquier', boutique: 'b1', actif: true, derniereConnexion: '2026-09-13 09:10' },
  { id: 'u5', nom: 'Rokhaya Diop', email: 'rokhaya.diop@afd-textile.sn', telephone: '+221 76 415 26 37', role: 'boutiquier', boutique: 'b2', actif: false, derniereConnexion: '2026-09-01 12:00' },
];

export const ENTREPOT = [
  { id: 'e1', nom: 'Wax Holland Premium', quantite: 500, pieces: 25, tonnes: 0.8, dateReception: '2026-09-01', fournisseur: 'Holland Textiles BV' },
  { id: 'e2', nom: 'Bazin Riche Brodé', quantite: 300, pieces: 20, tonnes: 0.5, dateReception: '2026-09-05', fournisseur: 'Damask Trading Co.' },
  { id: 'e3', nom: 'Satin Imperial', quantite: 200, pieces: 12, tonnes: 0.3, dateReception: '2026-09-08', fournisseur: 'Orient Silk Ltd' },
  { id: 'e4', nom: 'Ankara Print Vivid', quantite: 800, pieces: 40, tonnes: 1.2, dateReception: '2026-08-28', fournisseur: 'West Africa Prints' },
  { id: 'e5', nom: 'Bogolan Authentique', quantite: 150, pieces: 10, tonnes: 0.2, dateReception: '2026-09-10', fournisseur: 'Artisans du Mali SARL' },
];

export const NOTIFICATIONS = [
  { id: 'n1', type: 'stock_faible', message: 'Stock critique : Satin Imperial (8 mètres restants)', date: '2026-09-13 10:05', lu: false, boutique: 'b1' },
  { id: 'n2', type: 'demande', message: 'Nouvelle demande de Fatou Sow : Wax Holland Premium (20m)', date: '2026-09-13 09:30', lu: false, boutique: 'b1' },
  { id: 'n3', type: 'creance', message: 'Créance importante : Sokhna Mbaye doit 320 000 FCFA', date: '2026-09-12 16:00', lu: true, boutique: 'b2' },
  { id: 'n4', type: 'validation', message: 'Demande acceptée : Satin Imperial vers AFD Textile Thiès', date: '2026-09-12 14:00', lu: true, boutique: 'b3' },
  { id: 'n5', type: 'sauvegarde', message: 'Sauvegarde automatique effectuée avec succès', date: '2026-09-12 00:00', lu: true, boutique: 'b1' },
  { id: 'n6', type: 'stock_faible', message: 'Stock critique : Bogolan Authentique (3 mètres restants)', date: '2026-09-11 17:30', lu: true, boutique: 'b3' },
];

export const HISTORIQUE = [
  { id: 'h1', action: 'Vente', details: 'Vente validée - Wax Holland Premium - 6m - 27 000 FCFA (Espèces) - Client Passage', utilisateur: 'Amadou Diallo', boutique: 'b1', date: '2026-09-13 09:15', typeAction: 'vente' },
  { id: 'h2', action: 'Mise en stock', details: 'Mise en stock de 50m Wax Holland Premium (Prix unitaire: 4 500 FCFA)', utilisateur: 'Amadou Diallo', boutique: 'b1', date: '2026-09-13 09:05', typeAction: 'stock' },
  { id: 'h3', action: 'Connexion', details: 'Connexion réussie depuis application mobile (Dakar)', utilisateur: 'Amadou Diallo', boutique: 'b1', date: '2026-09-13 09:00', typeAction: 'connexion' },
  { id: 'h4', action: 'Vente', details: 'Vente à crédit - Bazin Riche Brodé - 4m - 27 200 FCFA - Client Aïssatou Ba', utilisateur: 'Amadou Diallo', boutique: 'b1', date: '2026-09-13 10:30', typeAction: 'vente' },
  { id: 'h5', action: 'Transfert', details: 'Transfert expédié : 15m Satin Imperial vers AFD Textile Thiès', utilisateur: 'Amadou Diallo', boutique: 'b1', date: '2026-09-12 14:00', typeAction: 'transfert' },
  { id: 'h6', action: 'Annulation', details: 'Annulation vente #V048 - Dentelle Française (3m) - Motif : Erreur saisie client', utilisateur: 'Amadou Diallo', boutique: 'b1', date: '2026-09-12 16:30', typeAction: 'annulation' },
  { id: 'h7', action: 'Paiement créance', details: 'Règlement partiel créance : Mariama Fall a versé 50 000 FCFA via Wave', utilisateur: 'Amadou Diallo', boutique: 'b1', date: '2026-09-12 11:20', typeAction: 'creance' },
  { id: 'h8', action: 'Vente', details: 'Vente validée - Kente Tissé Main - 2yd - 24 000 FCFA (Orange Money) - Passage', utilisateur: 'Fatou Sow', boutique: 'b2', date: '2026-09-13 11:45', typeAction: 'vente' },
  { id: 'h9', action: 'Mise en stock', details: 'Mise en stock de 80m Ankara Print Vivid (Prix unitaire: 3 800 FCFA)', utilisateur: 'Fatou Sow', boutique: 'b2', date: '2026-09-12 09:30', typeAction: 'stock' },
  { id: 'h10', action: 'Transfert', details: 'Réception transfert : 80m Ankara Print Vivid reçus depuis Entrepôt Central', utilisateur: 'Fatou Sow', boutique: 'b2', date: '2026-09-11 11:10', typeAction: 'transfert' },
  { id: 'h11', action: 'Ajout produit', details: 'Nouveau modèle ajouté au catalogue : Dentelle Française Blanche', utilisateur: 'Fatou Sow', boutique: 'b2', date: '2026-09-11 10:00', typeAction: 'catalogue' },
  { id: 'h12', action: 'Créance', details: 'Nouvelle créance enregistrée pour Sokhna Mbaye : 320 000 FCFA (Échéance 30j)', utilisateur: 'Fatou Sow', boutique: 'b2', date: '2026-09-10 14:15', typeAction: 'creance' },
  { id: 'h13', action: 'Vente', details: 'Vente validée - Mousseline Légère - 12m - 25 200 FCFA (Wave) - Client Passage', utilisateur: 'Mamadou Ndiaye', boutique: 'b3', date: '2026-09-12 14:20', typeAction: 'vente' },
  { id: 'h14', action: 'Transfert', details: 'Réception de 15m Satin Imperial en provenance de Dakar Plateau', utilisateur: 'Mamadou Ndiaye', boutique: 'b3', date: '2026-09-12 16:45', typeAction: 'transfert' },
  { id: 'h15', action: 'Modification', details: 'Mise à jour du prix de vente : Bazin Riche Brodé 6 500 → 6 800 FCFA', utilisateur: 'Mamadou Ndiaye', boutique: 'b3', date: '2026-09-10 15:20', typeAction: 'catalogue' },
  { id: 'h16', action: 'Mise en stock', details: 'Mise en stock de 30m Bogolan Authentique à l\'Entrepôt Central', utilisateur: 'Amadou Diallo', boutique: 'entrepot', date: '2026-09-10 08:30', typeAction: 'stock' },
  { id: 'h17', action: 'Transfert', details: 'Expédition lot 50m Wax Holland vers AFD Dakar depuis l\'Entrepôt', utilisateur: 'Amadou Diallo', boutique: 'entrepot', date: '2026-09-13 10:45', typeAction: 'transfert' },
];

export const SAUVEGARDES = [
  { id: 's1', type: 'automatique', taille: '12.4 Mo', date: '2026-09-13 00:00', statut: 'succès' },
  { id: 's2', type: 'manuelle', taille: '12.1 Mo', date: '2026-09-12 18:00', statut: 'succès' },
  { id: 's3', type: 'automatique', taille: '11.8 Mo', date: '2026-09-12 00:00', statut: 'succès' },
  { id: 's4', type: 'automatique', taille: '11.5 Mo', date: '2026-09-11 00:00', statut: 'succès' },
  { id: 's5', type: 'automatique', taille: '11.2 Mo', date: '2026-09-10 00:00', statut: 'erreur' },
];

export const VENTES_SEMAINE = [
  { jour: 'Lun', montant: 145000 },
  { jour: 'Mar', montant: 210000 },
  { jour: 'Mer', montant: 178000 },
  { jour: 'Jeu', montant: 295000 },
  { jour: 'Ven', montant: 322000 },
  { jour: 'Sam', montant: 410000 },
  { jour: 'Dim', montant: 118000 },
];

export const TOP_PRODUITS = [
  { nom: 'Wax Holland', ventes: 420 },
  { nom: 'Ankara Print', ventes: 310 },
  { nom: 'Bazin Brodé', ventes: 245 },
  { nom: 'Satin Imperial', ventes: 180 },
  { nom: 'Kente Main', ventes: 95 },
];

export const formatMontant = (n: number) =>
  n.toLocaleString('fr-SN') + ' FCFA';

export const BOUTIQUE_COURANTE = BOUTIQUES[0];
