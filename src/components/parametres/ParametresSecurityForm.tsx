import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

interface ParametresSecurityFormProps {
  onPasswordChange: (ancien: string, nouveau: string, confirm: string) => void;
}

export const ParametresSecurityForm: React.FC<ParametresSecurityFormProps> = ({
  onPasswordChange,
}) => {
  const [ancienPwd, setAncienPwd] = useState('');
  const [nouveauPwd, setNouveauPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPasswordChange(ancienPwd, nouveauPwd, confirmPwd);
    setAncienPwd('');
    setNouveauPwd('');
    setConfirmPwd('');
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
        <KeyRound size={16} className="text-blue-600" />
        <h3 className="font-display font-bold text-gray-900 text-sm">
          Sécurité & Modification du mot de passe
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Mot de passe actuel */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mot de passe actuel
          </label>
          <div className="relative">
            <input
              type={showAncien ? 'text' : 'password'}
              value={ancienPwd}
              onChange={(e) => setAncienPwd(e.target.value)}
              placeholder="Entrez votre mot de passe actuel"
              className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
            <button
              type="button"
              onClick={() => setShowAncien(!showAncien)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showAncien ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNouveau ? 'text' : 'password'}
                value={nouveauPwd}
                onChange={(e) => setNouveauPwd(e.target.value)}
                placeholder="Min. 6 caractères"
                className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <button
                type="button"
                onClick={() => setShowNouveau(!showNouveau)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNouveau ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!ancienPwd || !nouveauPwd || !confirmPwd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <Lock size={14} />
            <span>Mettre à jour le mot de passe</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParametresSecurityForm;
