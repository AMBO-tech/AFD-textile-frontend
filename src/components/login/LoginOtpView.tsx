import React, { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface LoginOtpViewProps {
  telephone: string;
  otp: string[];
  onOtpChange: (newOtp: string[]) => void;
  onBack: () => void;
  onVerify: () => void;
  onResend: () => void;
}

export const LoginOtpView: React.FC<LoginOtpViewProps> = ({
  telephone,
  otp,
  onOtpChange,
  onBack,
  onVerify,
  onResend,
}) => {
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    onOtpChange(next);
    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const telAffiche =
    telephone.replace(/^(\+221\s?)?/, '').trim() || 'XX XXX XX XX';

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>
      <div className="mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#EBF5FB' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1E88E5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12" y2="18.01" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-gray-900 text-2xl">
          Code de vérification
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Code envoyé au{' '}
          <span className="font-semibold text-gray-600">
            {telAffiche}
          </span>
        </p>
      </div>
      <div className="flex justify-center gap-3 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={otpRefs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-16 h-16 text-center text-2xl font-bold rounded-2xl border-2 focus:outline-none transition-all"
            style={{
              borderColor: digit ? '#1E88E5' : '#e5e7eb',
              color: '#0F3D5E',
              background: digit ? 'rgba(30,136,229,0.06)' : 'white',
              boxShadow: digit
                ? '0 0 0 3px rgba(30,136,229,0.12)'
                : 'none',
            }}
          />
        ))}
      </div>
      <button
        onClick={onVerify}
        disabled={!otp.every((d) => d)}
        className="w-full py-4 rounded-2xl text-white font-display font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 mb-4"
        style={{
          background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
          boxShadow: '0 8px 24px rgba(15,61,94,0.3)',
        }}
      >
        Vérifier le code
      </button>
      <div className="text-center">
        <button
          onClick={onResend}
          className="text-sm font-medium"
          style={{ color: '#1E88E5' }}
        >
          Renvoyer le code
        </button>
      </div>
    </div>
  );
};

export default LoginOtpView;
