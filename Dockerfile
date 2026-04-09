FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/dispatch-app/package.json ./artifacts/dispatch-app/
RUN pnpm install --frozen-lockfile

FROM deps AS builder-api
COPY tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
RUN pnpm --filter @workspace/api-server run build

FROM deps AS builder-frontend
COPY tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/dispatch-app/ ./artifacts/dispatch-app/
ENV NODE_ENV=production
ENV BASE_PATH=/
ENV PORT=3000
RUN pnpm --filter @workspace/dispatch-app run build

FROM node:24-alpine AS production-api
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY --from=builder-api /app/artifacts/api-server/dist ./dist
COPY --from=builder-api /app/artifacts/api-server/package.json ./
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]

FROM nginx:alpine AS production-frontend
COPY --from=builder-frontend /app/artifacts/dispatch-app/dist/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
