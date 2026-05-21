# Imagen de Node para construir el frontend
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para desarrollo (puedes cambiarlo a build/serve para producción)
CMD ["npm", "run", "dev", "--", "--host"]
