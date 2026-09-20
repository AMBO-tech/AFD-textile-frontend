import React from 'react';
import {
  Sparkles, ShoppingCart, PackagePlus, ArrowLeftRight, CreditCard,
  Tag, AlertCircle, LogIn
} from 'lucide-react';
import type { HistoriqueItem } from '../../data/useMockStore';

export type HistoryItem = HistoriqueItem;

export interface ActionCategoryConfig {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
}

export const ACTION_CONFIG: Record<string, ActionCategoryConfig> = {
  toutes: {
    label: 'Toutes les actions',
    icon: Sparkles,
    color: '#0F3D5E',
    bg: '#EBF0F5',
    border: '#CBD5E1',
    badgeBg: '#F1F5F9',
  },
  vente: {
    label: 'Ventes',
    icon: ShoppingCart,
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#86EFAC',
    badgeBg: '#F0FDF4',
  },
  stock: {
    label: 'Mises en stock',
    icon: PackagePlus,
    color: '#1E88E5',
    bg: '#DBEAFE',
    border: '#93C5FD',
    badgeBg: '#EFF6FF',
  },
  transfert: {
    label: 'Transferts',
    icon: ArrowLeftRight,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    badgeBg: '#FFFBEB',
  },
  creance: {
    label: 'Créances & Règlements',
    icon: CreditCard,
    color: '#7C3AED',
    bg: '#EDE9FE',
    border: '#DDD6FE',
    badgeBg: '#F5F3FF',
  },
  catalogue: {
    label: 'Catalogue & Modifs',
    icon: Tag,
    color: '#0D9488',
    bg: '#CCFBF1',
    border: '#99F6E4',
    badgeBg: '#F0FDFA',
  },
  annulation: {
    label: 'Annulations',
    icon: AlertCircle,
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#FCA5A5',
    badgeBg: '#FEF2F2',
  },
  connexion: {
    label: 'Connexions',
    icon: LogIn,
    color: '#475569',
    bg: '#E2E8F0',
    border: '#CBD5E1',
    badgeBg: '#F8FAFC',
  },
};
