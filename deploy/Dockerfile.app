# BeeBoo Office app — production build served by nginx (homelab)
# VITE_BRIDGE_URL is baked at build time (vite env), pass as build arg.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --include=dev --no-audit --no-fund
COPY . .
ARG VITE_BRIDGE_URL
ENV VITE_BRIDGE_URL=$VITE_BRIDGE_URL
RUN npm run build

FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
