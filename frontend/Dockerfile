# Stage 1: Build Angular 18 App
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine

# Copy built browser bundle to Nginx html folder
COPY --from=build /usr/src/app/dist/sentence-builder-client/browser /usr/share/nginx/html

# Copy custom Nginx configuration with reverse proxy for API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
