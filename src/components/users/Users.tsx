import React, { useState } from 'react';
import { UserPlus, CheckCircle, Search, Shield, User } from 'lucide-react';
import type { Utilisateur, UserFormData, UserRoleFilter } from './types';
import UserCard from './UserCard';
import UserModal from './UserModal';

interface UsersProps {
  boutiqueId?: string;
}

export const Users: React.FC<UsersProps> = ({ boutiqueId = 'b1' }) => {
  const utilisateurs: any = [];
const boutiques: any = [];
const addUtilisateur: any = [];
const updateUtilisateur: any = [];
const toggleUtilisateurActif: any = [];

  const [search, setSearch] = useState('');
  const [filtreRole, setFiltreRole] = useState<UserRoleFilter>('tous');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtrage des utilisateurs
  const usersFiltres = utilisateurs.filter((u: any) => {
    const matchRole = filtreRole === 'tous' || u.role === filtreRole;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.nom.toLowerCase().includes(q) ||
      u.telephone.includes(q) ||
      (u.email && u.email.toLowerCase().includes(q));
    return matchRole && matchSearch;
  });

  const handleSave = (form: UserFormData) => {
    const boutiqueAssociee = form.role === 'boutiquier' ? form.boutique : '';
    const boutiqueNom = boutiques.find((b: any) => b.id === form.boutique)?.nom;

    if (editing) {
      updateUtilisateur(editing.id, {
        nom: form.nom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        role: form.role,
        boutique: boutiqueAssociee,
      });
      setShowForm(false);
      setEditing(null);
      setSuccessMsg(`Utilisateur ${form.nom.trim()} modifié avec succès.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      addUtilisateur({
        nom: form.nom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim() || `${form.nom.toLowerCase().replace(/\s+/g, '.')}@afd-textile.sn`,
        role: form.role,
        boutique: boutiqueAssociee,
        actif: true,
      });
      setShowForm(false);
      setSuccessMsg(
        `Compte créé avec succès pour ${form.nom.trim()} (${
          form.role === 'gerant' ? 'Gérant' : `Boutiquier · ${boutiqueNom}`
        }).`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const openEdit = (u: Utilisateur) => {
    setEditing(u);
    setShowForm(true);
  };

  const ouvrirNouveauForm = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Utilisateurs & Équipe</h1>
          <p className="text-sm text-gray-500">
            {utilisateurs.length} compte{utilisateurs.length !== 1 ? 's' : ''} configuré{utilisateurs.length !== 1 ? 's' : ''} · {utilisateurs.filter((u: any) => u.actif).length} actif{utilisateurs.filter((u: any) => u.actif).length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={ouvrirNouveauForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <UserPlus size={15} /> Ajouter un utilisateur
        </button>
      </div>

      {/* Message de succès */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-800 text-sm animate-fade-in shadow-sm">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Barre de recherche et Filtres par rôle */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email…"
            className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
          />
        </div>

        {/* Badges de filtrage par Rôle */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          <button
            onClick={() => setFiltreRole('tous')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filtreRole === 'tous'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            Tous les rôles ({utilisateurs.length})
          </button>
          <button
            onClick={() => setFiltreRole('gerant')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filtreRole === 'gerant'
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
            style={filtreRole === 'gerant' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
          >
            <Shield size={12} className={filtreRole === 'gerant' ? 'text-blue-200' : 'text-blue-600'} />
            Gérants ({utilisateurs.filter((u: any) => u.role === 'gerant').length})
          </button>
          <button
            onClick={() => setFiltreRole('boutiquier')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filtreRole === 'boutiquier'
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
            style={filtreRole === 'boutiquier' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
          >
            <User size={12} className={filtreRole === 'boutiquier' ? 'text-blue-200' : 'text-blue-600'} />
            Boutiquiers ({utilisateurs.filter((u: any) => u.role === 'boutiquier').length})
          </button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-2">
        {usersFiltres.map((u: any) => (
          <UserCard
            key={u.id}
            user={u}
            boutiques={boutiques}
            onEdit={openEdit}
            onToggleActif={toggleUtilisateurActif}
          />
        ))}

        {usersFiltres.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
            <User size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">Aucun utilisateur ne correspond aux critères</p>
          </div>
        )}
      </div>

      {/* Modal Utilisateur */}
      <UserModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        editingUser={editing}
        boutiques={boutiques}
        defaultBoutiqueId={boutiqueId}
        onSave={handleSave}
      />
    </div>
  );
};

export default Users;
