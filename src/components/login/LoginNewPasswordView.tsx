import React, { useState } from 'react';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginNewPasswordViewProps {
  erreurMdp: string;
  loading: boolean;
  onSavePassword: (newPwd: string, confirmPwd: string) => void;
}

export const LoginNewPasswordView: React.FC<LoginNewPasswordViewProps> = ({
  erreurMdp,
  loading,
  onSavePassword,
}) => {
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSavePassword(newPwd, confirmPwd);
  };

  return (
    <div>
      <div className="mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#F0FDF4' }}
        >
          <Lock size={22} color="#22C55E" />
        </div>
        <h2 className="font-display font-bold text-gray-900 text-2xl">
          Nouveau mot de passe
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Choisissez un mot de passe sécurisé (min. 8 caractères)
        </p>
      </div>

      {erreurMdp && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-red-600 text-sm">{erreurMdp}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showNewPwd ? 'text' : 'password'}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPwd(!showNewPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showConfirmPwd ? 'text' : 'password'}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Répétez votre mot de passe"
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-display font-bold text-sm transition-all active:scale-[0.98] mt-2 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22C55E)',
            boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
          }}
        >
          {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </div>
  );
};

export default LoginNewPasswordView;
