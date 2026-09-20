import React from 'react';
import { CheckCircle } from 'lucide-react';

export const LoginBrandingSide: React.FC = () => {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[42%] relative overflow-hidden p-10"
      style={{
        background: 'linear-gradient(160deg, #0A2F48 0%, #0F3D5E 45%, #1565C0 100%)',
      }}
    >
      {/* Motif tissu abstrait */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
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
        className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-10"
        style={{ background: '#1E88E5' }}
      />
      <div
        className="absolute top-1/3 -left-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: '#42a5f5' }}
      />

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
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
          <span className="text-white font-display font-bold text-lg tracking-tight">
            AFD Textile
          </span>
        </div>

        <div>
          <h2
            className="font-display font-bold text-white leading-tight"
            style={{ fontSize: '2.4rem' }}
          >
            Gérez ta
            <br />
            boutique avec
            <br />
            précision.
          </h2>
          <p className="text-blue-200 mt-5 text-base leading-relaxed max-w-xs">
            Stock, ventes, clients et entrepôt réunis en un seul outil.
          </p>
        </div>

        {/* Features */}
        <div className="mt-10 space-y-3">
          {[
            'Suivi du stock en temps réel',
            'Gestion de boutique',
            'Gestion des ventes',
            'Rapports et analyses',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.25)' }}
              >
                <CheckCircle size={12} color="#22C55E" />
              </div>
              <span className="text-blue-100 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <p className="text-blue-300 text-xs">
          AFD Textile © 2026 · Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default LoginBrandingSide;
