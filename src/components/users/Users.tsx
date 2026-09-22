import React, { useState } from 'react';
import { UserPlus, CheckCircle, Search, Shield, User } from 'lucide-react';
import { useMockStore } from '../../data/useMockStore';
import type { Utilisateur, UserFormData, UserRoleFilter } from './types';
import UserCard from './UserCard';
import UserModal from './UserModal';
import {
  useInviteUserMutation,
  useResendInviteMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
} from '../../hooks/queries/useUsersQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';

interface UsersProps {
  boutiqueId?: string;
}

export const Users: React.FC<UsersProps> = ({ boutiqueId = 'b1' }) => {
  const {
    utilisateurs,
    boutiques,
    addUtilisateur,
    updateUtilisateur,
    toggleUtilisateurActif,
    resendInvitation,
  } = useMockStore();

  const [search, setSearch] = useState('');
  const [filtreRole, setFiltreRole] = useState<UserRoleFilter>('tous');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<{ nom: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutateAsync: inviteUserApi } = useInviteUserMutation();
  const { mutateAsync: resendInviteApi } = useResendInviteMutation();
  const { mutate: updateUserApi } = useUpdateUserMutation();
  const { mutate: toggleUserStatusApi } = useToggleUserStatusMutation();
  const { data: locationsData } = useLocationsListQuery();

  // Filtrage des utilisateurs
  const usersFiltres = utilisateurs.filter((u) => {
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
    const boutiqueNom = boutiques.find((b) => b.id === form.boutique)?.nom;

    // Résolution de l'UUID réel de la boutique pour l'API
    const matchedLocation = locationsData?.data?.find(
      (l) => l.id === form.boutique || l.nom.toLowerCase().includes(boutiqueNom?.toLowerCase() || '')
    );
    const realLocationId = matchedLocation?.id || (form.boutique.length > 10 ? form.boutique : undefined);

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

      // Synchro API NestJS
      if (editing.id.length > 10) {
        updateUserApi({
          id: editing.id,
          data: {
            nom: form.nom.trim(),
            telephone: form.telephone.trim(),
            email: form.email.trim() || undefined,
            role: form.role === 'gerant' ? 'OWNER' : 'BOUTIQUIER',
            locationId: form.role === 'boutiquier' ? realLocationId : undefined,
          },
        });
      }
    } else {
      const newUser = addUtilisateur({
        nom: form.nom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim() || `${form.nom.toLowerCase().replace(/\s+/g, '.')}@afd-textile.sn`,
        role: form.role,
        boutique: boutiqueAssociee,
        actif: true,
      });
      setShowForm(false);

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const defaultInviteUrl = `${baseUrl}/activer-compte?token=${newUser.invitationToken}`;
      setCreatedInviteUrl({ nom: newUser.nom, url: defaultInviteUrl });

      setSuccessMsg(
        `Compte créé avec succès pour ${form.nom.trim()} (${
          form.role === 'gerant' ? 'Gérant' : `Boutiquier · ${boutiqueNom}`
        }).`
      );
      setTimeout(() => setSuccessMsg(null), 5000);

      // Appel API NestJS réel (génère le token SHA-256 dans PostgreSQL et loggue le SMS/Email)
      inviteUserApi({
        nom: form.nom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim() || undefined,
        role: form.role === 'gerant' ? 'OWNER' : 'BOUTIQUIER',
        locationId: form.role === 'boutiquier' ? realLocationId : undefined,
      })
        .then((apiRes) => {
          if (apiRes?.activationUrl) {
            setCreatedInviteUrl({ nom: form.nom.trim(), url: apiRes.activationUrl });
          }
        })
        .catch((err) => {
          console.warn('API invite fallback local actif:', err);
        });
    }
  };

  const handleResend = (id: string) => {
    const res = resendInvitation(id);
    const user = utilisateurs.find((u) => u.id === id);
    if (user) {
      setCreatedInviteUrl({ nom: user.nom, url: res.activationUrl });
      setSuccessMsg(`Nouveau lien d'activation (valide 72h) généré pour ${user.nom}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
    if (id.length > 10) {
      resendInviteApi(id)
        .then((apiRes) => {
          if (apiRes?.activationUrl) {
            setCreatedInviteUrl({ nom: user?.nom || 'Collaborateur', url: apiRes.activationUrl });
          }
        })
        .catch(() => {});
    }
  };

  const handleToggleActif = (id: string) => {
    toggleUtilisateurActif(id);
    if (id.length > 10) {
      toggleUserStatusApi(id);
    }
  };

  const handleCopyGeneratedUrl = () => {
    if (!createdInviteUrl) return;
    navigator.clipboard.writeText(createdInviteUrl.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            {utilisateurs.length} compte{utilisateurs.length !== 1 ? 's' : ''} configuré{utilisateurs.length !== 1 ? 's' : ''} · {utilisateurs.filter((u) => u.actif).length} actif{utilisateurs.filter((u) => u.actif).length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={ouvrirNouveauForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <UserPlus size={16} />
          <span>Inviter un collaborateur</span>
        </button>
      </div>

      {/* Bannière de lien d'invitation généré */}
      {createdInviteUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2 animate-fade-in shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">
              Lien d'activation pour {createdInviteUrl.nom} (Valable 72h) :
            </span>
            <button
              onClick={() => setCreatedInviteUrl(null)}
              className="text-blue-400 hover:text-blue-600 text-xs font-bold"
            >
              Fermer
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={createdInviteUrl.url}
              className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-blue-200 text-xs text-blue-950 font-mono select-all"
            />
            <button
              onClick={handleCopyGeneratedUrl}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
            <a
              href={createdInviteUrl.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Ouvrir</span>
            </a>
          </div>
          <p className="text-[11px] text-blue-700/80">
            ℹ️ En environnement local de test, aucun SMS ou e-mail payant n'est débité : le lien est généré ici pour vos tests ou pour envoi direct par WhatsApp.
          </p>
        </div>
      )}

      {successMsg && !createdInviteUrl && (
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email…"
            className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm"
          />
        </div>

        {/* Filtres par rôle */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFiltreRole('tous')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filtreRole === 'tous'
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
            style={filtreRole === 'tous' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
          >
            Tous ({utilisateurs.length})
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
            Gérants ({utilisateurs.filter((u) => u.role === 'gerant').length})
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
            Boutiquiers ({utilisateurs.filter((u) => u.role === 'boutiquier').length})
          </button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-2">
        {usersFiltres.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            boutiques={boutiques}
            onEdit={openEdit}
            onToggleActif={handleToggleActif}
            onResendInvite={handleResend}
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
