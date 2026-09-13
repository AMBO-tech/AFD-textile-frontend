import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react'

export const Home = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bienvenue, {user?.name || 'Utilisateur'} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Le socle frontend moderne est initialisé et prêt pour le développement des modules métiers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
              <ShieldCheck className="size-3.5" />
              Rôle : {user?.role || 'Utilisateur standard'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestion du Serveur & Cache</CardTitle>
            <Database className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">TanStack Query v5</div>
            <CardDescription className="mt-1 text-xs">
              Cache intelligent, mutations asynchrones, invalidation automatique et zéro useEffect manuel.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">État Client Global</CardTitle>
            <Layers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">Zustand Stores</div>
            <CardDescription className="mt-1 text-xs">
              Stores ultra-légers pour la session auth, l'UI (sidebar, modals) sans re-renders inutiles.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrôle d'Accès & Sécurité</CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">RBAC & Guards</div>
            <CardDescription className="mt-1 text-xs">
              Guards <code>&lt;RoleRoute /&gt;</code> et helpers <code>hasRole()</code>, <code>hasPermission()</code> prêts.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Checklist for the frontend team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prise en main pour l'équipe Frontend</CardTitle>
          <CardDescription>
            Conventions et points d'entrée configurés dans le projet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong>Features :</strong> Créer chaque domaine dans <code>src/features/[nom]/</code>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong>API Keys :</strong> Utiliser <code>queryKeys</code> de <code>@/lib/queryKeys</code>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong>Auth & Permissions :</strong> Consommer <code>useAuth()</code> ou <code>useAuthStore</code>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong>UI State :</strong> Consommer ou étendre <code>useUiStore</code>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Home