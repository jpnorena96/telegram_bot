# ==========================================
# Etapa 1: Build (Compilar el frontend Vite)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo archivos de configuración de dependencias primero para cachear la capa
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente del frontend
COPY . .

# Compilar la aplicación para producción (esto genera la carpeta /dist)
# Puedes pasar variables de entorno aquí si Vite las necesita en build-time
RUN npm run build

# ==========================================
# Etapa 2: Producción (Servidor Nginx)
# ==========================================
FROM nginx:alpine

# Copiar los archivos compilados desde la Etapa 1 al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx (para manejar React Router SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
