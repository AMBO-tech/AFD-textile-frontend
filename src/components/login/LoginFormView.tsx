import React, { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle, Mail, CheckCircle } from 'lucide-react';

interface LoginFormViewProps {
  dejaConnecte: boolean;
  successMsg: string;
  erreur: string;
  loading: boolean;
  onLoginSubmit: (identifiant: string, motdepasse: string) => void;
  onForgotPassword: () => void;
}

export const LoginFormView: React.FC<LoginFormViewProps> = ({
  dejaConnecte,
  successMsg,
  erreur,
  loading,
  onLoginSubmit,
  onForgotPassword,
}) => {
  const [identifiant, setIdentifiant] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onLoginSubmit(identifiant, motdepasse);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display font-bold text-gray-900 text-2xl">
          {dejaConnecte ? 'Bon retour ' : 'Bienvenue'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {dejaConnecte
            ? 'Connectez-vous à votre espace de gestion'
            : 'Accédez à votre espace de gestion AFD Textile'}
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
          <span className="text-green-700 text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {erreur && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-red-600 text-sm">{erreur}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email ou téléphone
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="exemple@afd-textile.sn"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Mot de passe
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold"
              style={{ color: '#1E88E5' }}
            >
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPwd ? 'text' : 'password'}
              value={motdepasse}
              onChange={(e) => setMotdepasse(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-display font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-70 mt-2"
          style={{
            background: loading
              ? '#9aaec4'
              : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
            boxShadow: loading
              ? 'none'
              : '0 8px 24px rgba(15,61,94,0.35)',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Connexion en cours…
            </span>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        AFD Textile © 2026 · Tous droits réservés
      </p>
    </div>
  );
};

export default LoginFormView;
