# MINIMO3D Website: Payload CMS + Next.js (standalone)
FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Der Build braucht keine Datenbank; die Werte hier sind nur Platzhalter.
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build PAYLOAD_SECRET=build npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/seed-assets ./seed-assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Hochgeladene Bilder und Anfrage-Dateien liegen in Volumes (siehe compose.yml).
RUN mkdir -p media inquiry-files quote-files && chown -R nextjs:nodejs media inquiry-files quote-files

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
