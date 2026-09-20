import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Lock, Mail, Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export const Login: React.FC = () => {
  const [identifiant, setIdentifiant] = useState('amadou.diallo@afd-textile.sn')
  const [motdepasse, setMotdepasse] = useState('afd2026')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!identifiant.trim() || !motdepasse.trim()) {
      setErreur('Veuillez renseigner vos identifiants.')
      return
    }

    setLoading(true)
    setErreur('')
    try {
      const res = await authService.login({ identifiant, motdepasse })
      setAuth(res.token, res.user)
      toast.success(`Bienvenue, ${res.user.name} !`)
      navigate('/dashboard')
    } catch {
      setErreur('Identifiant ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (id: string, pwd = 'afd2026') => {
    setIdentifiant(id)
    setMotdepasse(pwd)
    setErreur('')
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Branding Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F3D5E] via-[#0F3D5E] to-[#1E88E5] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-primary-light font-display font-black text-xl shadow-inner border border-white/20">
              AFD
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight">AFD Textile</h1>
              <p className="text-xs text-slate-300 font-medium">Réseau Boutiques & Entrepôt</p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <Badge className="bg-[#1E88E5]/20 text-[#1E88E5] border border-[#1E88E5]/40 text-xs px-3 py-1 font-semibold">
              Plateforme Pro v2.0
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl leading-tight">
              Gestion centralisée, fluide et en temps réel de votre réseau textile.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Supervisez les ventes en caisse, les stocks physiques au mètre, les arrivages en entrepôt et le recouvrement de créances clients.
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 AFD Textile Inc.</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Serveurs Réseau Opérationnels
          </span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-display font-extrabold text-xl mx-auto mb-2 shadow-md">
              AFD
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900">AFD Textile</h2>
            <p className="text-xs text-slate-500">Gestion Réseau Tissus</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-2xl text-slate-900">Connexion</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Entrez votre numéro de téléphone ou adresse email pour accéder à votre espace
            </p>
          </div>

          {erreur && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Numéro de téléphone ou Email :
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  required
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="amadou.diallo@afd-textile.sn ou +221..."
                  className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Mot de passe :</label>
                <span className="text-[11px] text-primary-light hover:underline cursor-pointer">
                  Mot de passe oublié ?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  required
                  value={motdepasse}
                  onChange={(e) => setMotdepasse(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 text-xs font-bold gap-2 shadow-sm cursor-pointer"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Comptes de Démonstration (1 Clic) :
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('amadou.diallo@afd-textile.sn')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-primary-light text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>Gérant</span>
                  <ShieldCheck className="w-3 h-3 text-primary-light" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">Amadou Diallo</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('ibrahima.sarr@afd-textile.sn')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-primary-light text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Boutiquier</div>
                <div className="text-[10px] text-slate-400 truncate">Ibrahima Sarr (Plateau)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
