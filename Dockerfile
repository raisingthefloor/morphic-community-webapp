# Based on https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html
# build stage
FROM node:26-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
# --ignore-scripts: skip install scripts. None are needed for the production build.
RUN npm install --ignore-scripts
COPY . .
# webpack 4 (Vue CLI 4) uses MD4 hashing, which OpenSSL 3 (Node 17+) only provides via the legacy provider
RUN npm run updateEmailHtml && NODE_OPTIONS=--openssl-legacy-provider npm run build

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx-conf-d/ /etc/nginx/conf.d/

EXPOSE 80
EXPOSE 9180

CMD ["nginx", "-g", "daemon off;"]
