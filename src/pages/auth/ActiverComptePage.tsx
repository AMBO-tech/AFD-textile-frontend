import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useMockStore } from '../../data/useMockStore';
import API from '../../api/api';

export const ActiverComptePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { utilisateurs, activateUserPassword } = useMockStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Vérifier si un utilisateur correspond à ce token d'invitation
  const invitedUser = utilisateurs.find((u) => u.invitationToken === token);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Le lien d'invitation est invalide ou a expiré.");
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe saisis ne sont pas identiques.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Tenter l'activation via l'API NestJS réelle
      await API.post('/auth/setup-password', {
        token,
        nouveauMotDePasse: password,
      });
      activateUserPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      // 2. Fallback si c'est un token mock ou en cas de coupure réseau
      const mockSuccess = activateUserPassword(token, password);
      if (mockSuccess) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        const errorMsg =
          err?.response?.data?.message ||
          "Ce lien d'invitation a expiré ou le compte a déjà été activé.";
        setError(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-[#0F3D5E] to-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* Logo & Marque */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">AFD Textile</h1>
          <p className="text-xs text-gray-500 mt-1">Plateforme Métier Textile & Gestion Commerciale</p>
        </div>

        {/* Écran de Succès */}
        {isSuccess ? (
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-display font-bold text-xl text-gray-900">Compte activé avec succès !</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Votre mot de passe a été enregistré. Vous allez être redirigé automatiquement vers l'écran de connexion...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-all"
            >
              <span>Se connecter maintenant</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : !token ? (
          /* Erreur Token manquant */
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <h2 className="font-display font-bold text-lg text-gray-900">Lien d'invitation manquant</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pour activer votre compte, vous devez cliquer sur le lien complet reçu par SMS ou email de la part de votre gérant.
            </p>
            <Link
              to="/login"
              className="inline-block text-xs font-semibold text-blue-600 hover:underline"
            >
              Retour à la page de connexion
            </Link>
          </div>
        ) : (
          /* Formulaire de création du mot de passe */
          <div>
            <div className="mb-6 text-center">
              <h2 className="font-display font-bold text-lg text-gray-900">Activation de votre compte</h2>
              {invitedUser ? (
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  Bienvenue, {invitedUser.nom} ({invitedUser.telephone})
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Définissez votre mot de passe secret pour votre première connexion
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-red-700 text-xs font-medium">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

              <div className="text-[11px] text-gray-400 space-y-1 pt-1">
                <div className={password.length >= 8 ? 'text-green-600 font-medium' : ''}>
                  • Minimum 8 caractères
                </div>
                <div className={password && password === confirmPassword ? 'text-green-600 font-medium' : ''}>
                  • Les deux mots de passe correspondent
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                <span>Activer mon compte</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiverComptePage;
