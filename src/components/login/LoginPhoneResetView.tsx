import React from 'react';
import { ArrowLeft, Phone } from 'lucide-react';

interface LoginPhoneResetViewProps {
  telephone: string;
  onTelephoneChange: (val: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const LoginPhoneResetView: React.FC<LoginPhoneResetViewProps> = ({
  telephone,
  onTelephoneChange,
  onBack,
  onSubmit,
}) => {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Retour à la connexion
      </button>
      <div className="mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#EBF5FB' }}
        >
          <Phone size={22} color="#1E88E5" />
        </div>
        <h2 className="font-display font-bold text-gray-900 text-2xl">
          Réinitialisation
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Entrez votre numéro pour recevoir un code par SMS
        </p>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Numéro de téléphone
        </label>
        <div className="relative">
          <Phone
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="tel"
            value={telephone}
            onChange={(e) => onTelephoneChange(e.target.value)}
            placeholder="+221 77 XXX XX XX"
            onKeyDown={(e) =>
              e.key === 'Enter' && telephone.trim() && onSubmit()
            }
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
          />
        </div>
      </div>
      <button
        onClick={onSubmit}
        disabled={!telephone.trim()}
        className="w-full py-4 rounded-2xl text-white font-display font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
          boxShadow: '0 8px 24px rgba(15,61,94,0.3)',
        }}
      >
        Envoyer le code SMS
      </button>
    </div>
  );
};

export default LoginPhoneResetView;
