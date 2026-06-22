FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/ 
RUN npm ci
COPY . .
RUN npx turbo run build --filter=web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy standalone build output from the web app directory
COPY --from=base /app/apps/web/.next/standalone /app/standalone
COPY --from=base /app/apps/web/public /app/public
COPY --from=base /app/apps/web/.next/static /app/.next/static
EXPOSE 3000
CMD ["node", "standalone/apps/web/server.js"]
