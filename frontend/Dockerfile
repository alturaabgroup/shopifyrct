FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Final image to serve static files via nginx (optional)
FROM nginx:alpine AS frontend

COPY --from=build /app/dist /usr/share/nginx/html

# nginx.conf will be provided by the root nginx service