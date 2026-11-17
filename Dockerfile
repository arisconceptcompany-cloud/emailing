# syntax=docker/dockerfile:1

# ---------- Build ----------
FROM node:22-alpine AS build

WORKDIR /app

# URL de l'API injectée au build (vide = même origine, via proxy Nginx /api).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM nginx:1.27-alpine AS runtime

# Configuration Nginx (SPA + en-têtes de sécurité + cache)
COPY nginx/aris-emailing.conf /etc/nginx/conf.d/default.conf

# Fichiers statiques générés par Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
