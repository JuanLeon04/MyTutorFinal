########################
# 1) Build del frontend
########################
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./

# Instalar dependencias dentro del contenedor
RUN npm install

COPY . .

# A veces CRA falla permisos → arreglar
RUN chmod +x node_modules/.bin/react-scripts

# Build CRA (usa variables REACT_APP_*)
RUN npm run build


########################
# 2) Nginx para servirlo
########################
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
