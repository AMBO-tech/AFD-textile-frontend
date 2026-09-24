import React, { useState, useEffect } from 'react';
import type { LoginVue, LoginProps } from './types';
import { MIN_PASSWORD_LENGTH, OTP_LENGTH } from './types';
import { resetPassword, sendResetCode } from '@/services/auth/password';
import LoginBrandingSide from './LoginBrandingSide';
import LoginFormView from './LoginFormView';
import LoginPhoneResetView from './LoginPhoneResetView';
import LoginOtpView from './LoginOtpView';
import LoginNewPasswordView from './LoginNewPasswordView';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [vue, setVue] = useState<LoginVue>('login');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [telephone, setTelephone] = useState('');
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [erreurMdp, setErreurMdp] = useState('');
  const [resetErreur, setResetErreur] = useState('');
  const [resetInfo, setResetInfo] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [dejaConnecte, setDejaConnecte] = useState(false);

  useEffect(() => {
    setDejaConnecte(localStorage.getItem('afd_deja_connecte') === '1');
  }, []);

  const handleLoginSubmit = (identifiant: string, motdepasse: string) => {
    setLoading(true);
    setErreur('');
    
    if (!identifiant.trim() || !motdepasse) {
      setErreur('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }
    
    // On délègue la requête d'authentification à la couche supérieure (LoginPage)
    // qui gère l'appel réel à l'API NestJS.
    Promise.resolve(
      onLogin(
        'gerant', // Rôle temporaire, remplacé par celui renvoyé par l'API
        '', // Nom temporaire, remplacé par celui renvoyé par l'API
        undefined,
        { identifier: identifiant.trim(), motDePasse: motdepasse }
      )
    ).catch((err: unknown) => {
      setErreur(err instanceof Error && err.message ? err.message : 'Identifiant ou mot de passe incorrect.');
    }).finally(() => {
      setLoading(false);
    });
  };

  const clearOtp = () => setOtp(Array(OTP_LENGTH).fill(''));

  const handleSendCode = async (nextVue: LoginVue = 'code') => {
    setResetErreur('');
    setResetLoading(true);
    try {
      const { message } = await sendResetCode(telephone.trim());
      setResetInfo(message);
      clearOtp();
      setVue(nextVue);
    } catch (err) {
      setResetErreur(err instanceof Error ? err.message : "Impossible d'envoyer le code.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSavePassword = async (newPwd: string, confirmPwd: string) => {
    setErreurMdp('');
    if (newPwd.length < MIN_PASSWORD_LENGTH) {
      setErreurMdp(`Minimum ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (newPwd !== confirmPwd) {
      setErreurMdp('Les mots de passe ne correspondent pas.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(telephone.trim(), otp.join(''), newPwd);
    } catch (err) {
      // Le code est vérifié à cette étape : on revient à la saisie du code avec le message de l'API.
      setResetErreur(err instanceof Error ? err.message : 'Code invalide ou expiré.');
      clearOtp();
      setVue('code');
      return;
    } finally {
      setResetLoading(false);
    }

    clearOtp();
    setTelephone('');
    setResetInfo('');
    setSuccessMsg('Mot de passe réinitialisé. Connectez-vous avec le nouveau mot de passe.');
    setVue('login');
    setTimeout(() => setSuccessMsg(''), 6000);
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
                setResetErreur('');
                setVue('telephone');
              }}
            />
          )}

          {/* ── VUE TELEPHONE ── */}
          {vue === 'telephone' && (
            <LoginPhoneResetView
              telephone={telephone}
              erreur={resetErreur}
              loading={resetLoading}
              onTelephoneChange={setTelephone}
              onBack={() => setVue('login')}
              onSubmit={() => handleSendCode()}
            />
          )}

          {/* ── VUE CODE OTP ── */}
          {vue === 'code' && (
            <LoginOtpView
              telephone={telephone}
              otp={otp}
              erreur={resetErreur}
              info={resetInfo}
              resending={resetLoading}
              onOtpChange={setOtp}
              onBack={() => setVue('telephone')}
              onVerify={() => {
                setResetErreur('');
                setErreurMdp('');
                setVue('nouveau_mdp');
              }}
              onResend={() => handleSendCode('code')}
            />
          )}

          {/* ── VUE NOUVEAU MOT DE PASSE ── */}
          {vue === 'nouveau_mdp' && (
            <LoginNewPasswordView
              erreurMdp={erreurMdp}
              loading={resetLoading}
              onSavePassword={handleSavePassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
