import React, { useState, useEffect } from 'react';
import type { LoginVue, LoginProps } from './types';
import LoginBrandingSide from './LoginBrandingSide';
import LoginFormView from './LoginFormView';
import LoginPhoneResetView from './LoginPhoneResetView';
import LoginOtpView from './LoginOtpView';
import LoginNewPasswordView from './LoginNewPasswordView';

const COMPTES = [
  {
    id: 'amadou.diallo@afd-textile.sn',
    pwd: 'afd2026',
    role: 'gerant' as const,
    nom: 'Amadou Diallo',
  },
  {
    id: '+221 77 010 20 30',
    pwd: 'afd2026',
    role: 'gerant' as const,
    nom: 'Amadou Diallo',
  },
  {
    id: 'fatou.sow@afd-textile.sn',
    pwd: 'afd2026',
    role: 'gerant' as const,
    nom: 'Fatou Sow',
  },
  {
    id: 'ibrahima.sarr@afd-textile.sn',
    pwd: 'afd2026',
    role: 'boutiquier' as const,
    nom: 'Ibrahima Sarr',
  },
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [vue, setVue] = useState<LoginVue>('login');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [telephone, setTelephone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [erreurMdp, setErreurMdp] = useState('');
  const [dejaConnecte, setDejaConnecte] = useState(false);

  useEffect(() => {
    setDejaConnecte(localStorage.getItem('afd_deja_connecte') === '1');
  }, []);

  const handleLoginSubmit = (identifiant: string, motdepasse: string) => {
    setLoading(true);
    setErreur('');
    setTimeout(() => {
      const id = identifiant.trim().toLowerCase();
      const compte = COMPTES.find(
        (c) => c.id.toLowerCase() === id && c.pwd === motdepasse.trim()
      );
      if (compte) {
        localStorage.setItem('afd_deja_connecte', '1');
        onLogin(compte.role, compte.nom);
      } else if (!identifiant.trim() || !motdepasse.trim()) {
        setErreur('Veuillez remplir tous les champs.');
      } else {
        setErreur('Identifiant ou mot de passe incorrect.');
      }
      setLoading(false);
    }, 800);
  };

  const handleSavePassword = (newPwd: string, confirmPwd: string) => {
    setErreurMdp('');
    if (newPwd.length < 6) {
      setErreurMdp('Minimum 6 caractères.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setErreurMdp('Les mots de passe ne correspondent pas.');
      return;
    }
    setOtp(['', '', '', '']);
    setTelephone('');
    setSuccessMsg('Mot de passe réinitialisé avec succès.');
    setVue('login');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F7FA' }}>
      {/* ── Panneau gauche : branding (desktop seulement) ── */}
      <LoginBrandingSide />

      {/* ── Panneau droit : formulaire ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
        {/* Logo mobile */}
        <div className="lg:hidden mb-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h14M3 10h10M3 15h12"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle
                cx="16"
                cy="10"
                r="2.5"
                fill="#22C55E"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            AFD Textile
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Gestion de boutiques textiles
          </p>
        </div>

        <div className="w-full max-w-md">
          {/* ── VUE LOGIN ── */}
          {vue === 'login' && (
            <LoginFormView
              dejaConnecte={dejaConnecte}
              successMsg={successMsg}
              erreur={erreur}
              loading={loading}
              onLoginSubmit={handleLoginSubmit}
              onForgotPassword={() => {
                setErreur('');
                setVue('telephone');
              }}
            />
          )}

          {/* ── VUE TELEPHONE ── */}
          {vue === 'telephone' && (
            <LoginPhoneResetView
              telephone={telephone}
              onTelephoneChange={setTelephone}
              onBack={() => setVue('login')}
              onSubmit={() => setVue('code')}
            />
          )}

          {/* ── VUE CODE OTP ── */}
          {vue === 'code' && (
            <LoginOtpView
              telephone={telephone}
              otp={otp}
              onOtpChange={setOtp}
              onBack={() => setVue('telephone')}
              onVerify={() => setVue('nouveau_mdp')}
              onResend={() => setOtp(['', '', '', ''])}
            />
          )}

          {/* ── VUE NOUVEAU MOT DE PASSE ── */}
          {vue === 'nouveau_mdp' && (
            <LoginNewPasswordView
              erreurMdp={erreurMdp}
              onSavePassword={handleSavePassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
