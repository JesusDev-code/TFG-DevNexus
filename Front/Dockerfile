# Etapa 1: Compilación (Cambiamos de 18 a 20)
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos solo los archivos de dependencias primero
COPY package*.json ./
RUN npm install --ignore-scripts && \
    node -e "require('fs').writeFileSync('node_modules/source-map-support/source-map-support.js', 'module.exports={install:function(){},hookRequire:function(){}};')"

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: Servidor de producción
FROM nginx:1.30.1-alpine

# IMPORTANTE: Revisa si tu carpeta de salida es 'www' o 'dist/miweb'
# Si tras fallar ves que no encuentra la carpeta, cambia /app/www por /app/dist/miweb
COPY --from=build /app/www /usr/share/nginx/html

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]