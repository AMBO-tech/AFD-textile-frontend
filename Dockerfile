# ==============================================================================
# Dockerfile Multi-Stage — Frontend AFD-Textile (React 19 + Vite + Nginx)
# Optimisé pour la sécurité (non-root unprivileged), la légèreté et la performance
# ==============================================================================

# ------------------------------------------------------------------------------
# ÉTAPE 1 : Compilation & Construction (Builder)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Dépendances système de compilation
RUN apk add --no-cache libc6-compat

# Copie des manifestes de dépendances
COPY package*.json ./

# Installation propre et reproductible des dépendances
RUN npm ci

# Copie des configurations et du code source
COPY tsconfig*.json vite.config.ts index.html components.json ./
COPY src ./src
COPY public ./public

# Argument de build pour l'URL de l'API Backend
# Par défaut '/api/v1' pour un routage transparent derrière le Reverse Proxy sans problème CORS
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Compilation de production TypeScript & Vite vers /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# ÉTAPE 2 : Image d'Exécution en Production (Nginx Unprivileged Non-Root)
# ------------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

LABEL maintainer="AMBO TECH <ambo.techh@gmail.com>"
LABEL description="Frontend Web React de gestion Textile (AFD-Textile)"
LABEL version="1.0.0"

# Copie de la configuration Nginx optimisée (gzip, sécurité, SPA fallback, cache)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques compilés depuis l'étape builder
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Port non-root 8080 exposé par défaut dans nginx-unprivileged
EXPOSE 8080

# Healthcheck Docker natif vérifiant la disponibilité de Nginx
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

# Démarrage de Nginx en avant-plan (exécuté automatiquement en tant qu'utilisateur nginx UID 101)
CMD ["nginx", "-g", "daemon off;"]
