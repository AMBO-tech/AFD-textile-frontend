import { useState } from 'react';
import { UserPlus, Edit2, UserX, UserCheck, X, Shield, User, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLocationStore } from '../stores/locationStore';

interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: 'gerant' | 'boutiquier';
  boutique: string;
  actif: boolean;
  derniereConnexion: string;
}

const INITIAL_USERS: Utilisateur[] = [
  { id: 'u1', nom: 'Amadou Diallo', email: 'amadou.diallo@afd-textile.ci', telephone: '+225 07 12 34 56', role: 'gerant', boutique: 'b1', actif: true, derniereConnexion: 'Aujourd\'hui 09:15' },
  { id: 'u2', nom: 'Ibrahim Koné', email: 'ibrahim.kone@afd-textile.ci', telephone: '+225 05 98 76 54', role: 'boutiquier', boutique: 'b1', actif: true, derniereConnexion: 'Hier 18:30' },
  { id: 'u3', nom: 'Fatou Traoré', email: 'fatou.traore@afd-textile.ci', telephone: '+225 01 23 45 67', role: 'boutiquier', boutique: 'b2', actif: true, derniereConnexion: '18/09/2026' },
  { id: 'u4', nom: 'Mamadou Bamba', email: 'mamadou.bamba@afd-textile.ci', telephone: '+225 07 45 67 89', role: 'boutiquier', boutique: 'b1', actif: false, derniereConnexion: '01/09/2026' },
];

function genMotDePasse() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Utilisateurs() {
  const { user } = useAuthStore();
  const { currentStore } = useLocationStore();
  const boutiqueId = currentStore?.id || 'b1';

  const [users, setUsers] = useState<Utilisateur[]>(INITIAL_USERS);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', role: 'boutiquier' as 'gerant' | 'boutiquier', boutique: boutiqueId });

  // Users filtrés par boutique sauf les gérants
  const usersVisibles = users.filter(u => u.role !== 'gerant' ? (u.boutique === boutiqueId || boutiqueId === 'all') : true);
  const [mdpTemp, setMdpTemp] = useState('');
  const [showMdp, setShowMdp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [compteCree, setCompteCree] = useState<{ nom: string; mdp: string } | null>(null);

  const handleSave = () => {
    if (!form.nom || !form.email) return;
    if (editing) {
      setUsers(us => us.map(u => u.id === editing.id ? { ...u, ...form } : u));
      setShowForm(false);
      setEditing(null);
    } else {
      const mdp = mdpTemp || genMotDePasse();
      setUsers(us => [...us, { id: 'u' + Date.now(), ...form, actif: true, derniereConnexion: 'Jamais' }]);
      setShowForm(false);
      setCompteCree({ nom: form.nom, mdp });
    }
  };

  const copierMdp = (mdp: string) => {
    navigator.clipboard.writeText(mdp).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEdit = (u: Utilisateur) => {
    setEditing(u);
    setForm({ nom: u.nom, email: u.email, telephone: u.telephone, role: u.role, boutique: u.boutique });
    setMdpTemp('');
    setShowForm(true);
  };

  const ouvrirNouveauForm = () => {
    setEditing(null);
    setForm({ nom: '', email: '', telephone: '', role: 'boutiquier', boutique: boutiqueId });
    setMdpTemp(genMotDePasse());
    setShowMdp(false);
    setShowForm(true);
  };

  const toggleActif = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target || target.role === 'gerant') return;
    setUsers(us => us.map(u => u.id === id ? { ...u, actif: !u.actif } : u));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F3D5E]">Utilisateurs & Équipe</h1>
          <p className="text-sm text-gray-500 mt-1">
            {usersVisibles.filter(u => u.role !== 'gerant').length} boutiquier(s) · {usersVisibles.filter(u => u.actif).length} actif(s)
          </p>
        </div>
        <button
          onClick={ouvrirNouveauForm}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <UserPlus size={16} /> Ajouter un utilisateur
        </button>
      </div>

      <div className="space-y-3">
        {usersVisibles.map(u => (
          <div
            key={u.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
              !u.actif ? 'opacity-60 border-gray-200' : 'border-gray-100 hover:border-blue-100 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                style={{
                  background: u.role === 'gerant'
                    ? 'linear-gradient(135deg, #0F3D5E, #1E88E5)'
                    : 'linear-gradient(135deg, #1E88E5, #42a5f5)'
                }}
              >
                {u.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <span className="font-semibold text-base text-gray-900">{u.nom}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                      u.role === 'gerant' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {u.role === 'gerant' ? <Shield size={10} /> : <User size={10} />}
                    {u.role === 'gerant' ? 'Gérant' : 'Boutiquier'}
                  </span>
                  {!u.actif && (
                    <span className="text-xs bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-medium">
                      Désactivé
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{u.email} · {u.telephone}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Dernière connexion: {u.derniereConnexion}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(u)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100"
                  title="Modifier"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => toggleActif(u.id)}
                  disabled={u.role === 'gerant'}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border border-gray-100 ${
                    u.role === 'gerant'
                      ? 'opacity-20 cursor-not-allowed'
                      : u.actif
                      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title={u.actif ? 'Désactiver le compte' : 'Activer le compte'}
                >
                  {u.actif ? <UserX size={15} /> : <UserCheck size={15} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal confirmation compte créé */}
      {compteCree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0FDF4' }}>
              <CheckCircle size={32} color="#22C55E" />
            </div>
            <h2 className="font-display font-bold text-gray-900 text-xl mb-1">Compte créé avec succès</h2>
            <p className="text-sm text-gray-500 mb-5">
              Communiquez ces identifiants à <span className="font-semibold text-gray-800">{compteCree.nom}</span>
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 text-left space-y-3">
              <div>
                <div className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1.5">
                  Mot de passe temporaire
                </div>
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200">
                  <span className="font-mono font-bold text-xl text-gray-900 tracking-widest">{compteCree.mdp}</span>
                  <button
                    onClick={() => copierMdp(compteCree.mdp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: copied ? '#F0FDF4' : '#FEF3C7', color: copied ? '#22C55E' : '#92400E' }}
                  >
                    {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-amber-700 bg-amber-100/70 rounded-xl px-3 py-2 leading-relaxed">
                Le boutiquier sera invité à changer ce mot de passe lors de sa première connexion sur l'application.
              </p>
            </div>

            <button
              onClick={() => setCompteCree(null)}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              Fermer et terminer
            </button>
          </div>
        </div>
      )}

      {/* Modal Ajout / Modification */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-gray-900 text-lg">
                {editing ? 'Modifier l\'utilisateur' : 'Nouveau compte utilisateur'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet</label>
                <input
                  value={form.nom}
                  onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                  placeholder="ex: Ibrahim Koné"
                  className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="ex: ibrahim.kone@afd-textile.ci"
                  className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Numéro de téléphone</label>
                <input
                  value={form.telephone}
                  onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rôle</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as 'gerant' | 'boutiquier' }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="boutiquier">Boutiquier (Vente, Stock boutique)</option>
                  <option value="gerant">Gérant (Administration & Gestion complète)</option>
                </select>
              </div>

              {/* Mot de passe temporaire (création) */}
              {!editing && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe temporaire</label>
                  <div className="relative">
                    <input
                      type={showMdp ? 'text' : 'password'}
                      value={mdpTemp}
                      onChange={e => setMdpTemp(e.target.value)}
                      className="w-full pl-3.5 pr-20 py-2.5 bg-amber-50 rounded-xl border border-amber-200 text-sm font-mono font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowMdp(v => !v)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        {showMdp ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMdpTemp(genMotDePasse())}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors"
                        title="Générer un autre mot de passe"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Ce mot de passe temporaire sera à usage unique pour sa première connexion.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={!form.nom || !form.email || (!editing && !mdpTemp)}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-40 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
                >
                  {editing ? 'Enregistrer les modifications' : 'Créer le compte utilisateur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
