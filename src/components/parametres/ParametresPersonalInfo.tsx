import React, { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';
import type { UserPersonalInfo } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ParametresPersonalInfoProps {
  nom: string;
  telephone: string;
  /** Chaîne vide quand le compte n'a pas d'adresse : rien n'est pré-rempli. */
  email: string;
  /** Libellé déjà formaté de la boutique associée. */
  boutique: string;
  onSave: (info: UserPersonalInfo) => Promise<void>;
}

export const ParametresPersonalInfo: React.FC<ParametresPersonalInfoProps> = ({
  nom: initialNom,
  telephone,
  email: initialEmail,
  boutique,
  onSave,
}) => {
  const [userNom, setUserNom] = useState(initialNom);
  const [email, setEmail] = useState(initialEmail);
  const [enCours, setEnCours] = useState(false);

  // Le profil frais (GET /auth/me) peut arriver après le premier rendu.
  useEffect(() => setUserNom(initialNom), [initialNom]);
  useEffect(() => setEmail(initialEmail), [initialEmail]);

  const emailInvalide = email.trim() !== '' && !EMAIL_RE.test(email.trim());
  const inchange = userNom.trim() === initialNom && email.trim() === initialEmail;
  const bloque = userNom.trim().length < 2 || emailInvalide || inchange || enCours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloque) return;
    setEnCours(true);
    try {
      await onSave({ nom: userNom.trim(), email: email.trim() });
    } finally {
      setEnCours(false);
    }
  };

  const champ =
    'w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30';
  const champFige = 'w-full px-3.5 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 cursor-not-allowed';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
        <User size={16} className="text-blue-600" />
        <h3 className="font-display font-bold text-gray-900 text-sm">Informations personnelles</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet</label>
            <input type="text" value={userNom} onChange={(e) => setUserNom(e.target.value)} required className={champ} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Numéro de téléphone</label>
            <input type="tel" value={telephone} disabled className={champFige} />
            <p className="text-[11px] text-gray-400 mt-1">Sert à la connexion : seul le gérant peut le modifier.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse e-mail (facultatif)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Aucune adresse enregistrée"
              className={champ}
            />
            {emailInvalide && <p className="text-[11px] text-red-600 mt-1">Adresse e-mail invalide.</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Boutique associée</label>
            <input type="text" disabled value={boutique} className={champFige} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={bloque}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <Save size={14} />
            <span>{enCours ? 'Enregistrement…' : 'Enregistrer les coordonnées'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParametresPersonalInfo;
