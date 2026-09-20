import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export const Login: React.FC = () => {
  const [identifiant, setIdentifiant] = useState('amadou.diallo@afd-textile.sn')
  const [motdepasse, setMotdepasse] = useState('afd2026')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!identifiant.trim() || !motdepasse.trim()) {
      setErreur('Veuillez remplir tous les champs.')
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

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 flex items-center justify-center font-['Inter',sans-serif]">
      {/* Container Card */}
      <div className="w-full max-w-[1000px] min-h-[600px] lg:h-[600px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(15,61,94,0.15)] overflow-hidden flex flex-col lg:flex-row">
        {/* Left 45% : Gradient Branding Panel */}
        <div
          className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-10 text-white"
          style={{
            background: 'linear-gradient(160deg, #0A2F48 0%, #0F3D5E 45%, #1565C0 100%)',
          }}
        >
          {/* Motif tissu abstrait */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
            viewBox="0 0 400 600"
            preserveAspectRatio="xMidYMid slice"
          >
            {Array.from({ length: 20 }).map((_, i) =>
              Array.from({ length: 30 }).map((_, j) => (
                <rect
                  key={`${i}-${j}`}
                  x={i * 22}
                  y={j * 22}
                  width={10}
                  height={10}
                  rx={2}
                  fill="white"
                />
              ))
            )}
          </svg>

          {/* Cercles déco */}
          <div
            className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: '#1E88E5' }}
          />
          <div
            className="absolute top-1/3 -left-10 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: '#42a5f5' }}
          />

          {/* Header & Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
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
              <span className="text-white font-['Poppins',sans-serif] font-bold text-lg tracking-tight">
                AFD Textile
              </span>
            </div>

            <div>
              <h2 className="font-['Poppins',sans-serif] font-bold text-white text-[32px] leading-tight">
                Gérez votre
                <br />
                boutique avec
                <br />
                précision.
              </h2>
              <p className="text-blue-100 mt-4 text-[13px] leading-relaxed max-w-xs">
                Stock, ventes, clients et entrepôt réunis en un seul outil.
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 space-y-2.5">
              {[
                'Suivi du stock en temps réel',
                'Gestion de boutique',
                'Gestion des ventes',
                'Rapports et analyses',
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(34,197,94,0.25)' }}
                  >
                    <CheckCircle size={12} color="#22C55E" />
                  </div>
                  <span className="text-blue-50 text-[13px]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-4">
            <p className="text-blue-300 text-[11px]">
              AFD Textile © 2026 • Tous droits réservés
            </p>
          </div>
        </div>

        {/* Right 55% : Form Panel */}
        <div className="w-full lg:w-[55%] p-8 sm:p-10 flex flex-col justify-center overflow-y-auto bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
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
              <h1 className="font-['Poppins',sans-serif] font-bold text-xl text-gray-900">
                AFD Textile
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Gestion de boutiques textiles
              </p>
            </div>

            <div className="mb-6">
              <h2 className="font-['Poppins',sans-serif] font-bold text-gray-900 text-[24px]">
                Bienvenue
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Accédez à votre espace de gestion AFD Textile
              </p>
            </div>

            {erreur && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span className="text-red-600 text-xs font-medium">{erreur}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email ou téléphone
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    placeholder="exemple@afd-textile.sn"
                    className="w-full pl-11 pr-4 h-12 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Mot de passe
                  </label>
                  <span className="text-[11px] font-semibold text-[#1E88E5] cursor-pointer">
                    Mot de passe oublié ?
                  </span>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={motdepasse}
                    onChange={(e) => setMotdepasse(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 h-12 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-white font-['Poppins',sans-serif] font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-70 mt-3 cursor-pointer flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(15,61,94,0.3)]"
                style={{
                  background: loading
                    ? '#9aaec4'
                    : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
                }}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            {/* Connexion rapide démo */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="relative flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                  Accès démo rapide
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Gérant',
                    sub: 'Amadou Diallo',
                    id: 'amadou.diallo@afd-textile.sn',
                  },
                  {
                    label: 'Boutiquier',
                    sub: 'Ibrahima Sarr',
                    id: 'ibrahima.sarr@afd-textile.sn',
                  },
                ].map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => {
                      setIdentifiant(c.id)
                      setMotdepasse('afd2026')
                      setErreur('')
                    }}
                    className="flex flex-col items-start p-3 rounded-xl border border-gray-200 bg-white hover:border-[#1E88E5] hover:bg-blue-50/30 transition-all text-left cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-800">
                      {c.label}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5 truncate w-full">
                      {c.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
