import React, { useState } from 'react';
import { User, Save } from 'lucide-react';


interface ParametresPersonalInfoProps {
  nom: string;
  telephone: string;
  email: string;
  role: 'gerant' | 'boutiquier';
  boutique: Boutique;
  onSave: (info: { nom: string; telephone: string; email: string }) => void;
}

export const ParametresPersonalInfo: React.FC<ParametresPersonalInfoProps> = ({
  nom: initialNom,
  telephone: initialTel,
  email: initialEmail,
  role,
  boutique,
  onSave,
}) => {
  const [userNom, setUserNom] = useState(initialNom);
  const [telephone, setTelephone] = useState(initialTel);
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nom: userNom, telephone, email });
  };

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
            <input
              type="text"
              value={userNom}
              onChange={(e) => setUserNom(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Numéro de téléphone *</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
              placeholder="+221 77 000 00 00"
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse Email (optionnel)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adresse@domaine.com"
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Boutique associée</label>
            <input
              type="text"
              disabled
              value={
                role === 'gerant'
                  ? 'Toutes les boutiques (Gérant)'
                  : `${boutique.nom} (${boutique.lieu})`
              }
              className="w-full px-3.5 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <Save size={14} />
            <span>Enregistrer les coordonnées</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParametresPersonalInfo;
