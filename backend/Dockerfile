FROM node:18-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 5000

# Comando para Railway (incluye migraciones Y SEED)
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm start"]
#Funcional en Railway
# FROM node:18-alpine

# RUN apk add --no-cache openssl libc6-compat

# WORKDIR /app

# # Copiar archivos de configuración
# COPY package*.json ./
# COPY tsconfig.json ./
# COPY prisma ./prisma/

# # Instalar dependencias
# RUN npm ci

# # Copiar código fuente
# COPY . .

# # Generar Prisma Client
# RUN npx prisma generate

# # Compilar TypeScript
# RUN npm run build

# # Exponer puerto
# EXPOSE 5000

# # Comando para Railway (incluye migraciones)
# CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
#Funcional en local
# FROM node:18-alpine

# # Necesario para Prisma
# RUN apk add --no-cache openssl libc6-compat

# WORKDIR /app

# # Copiar solo archivos necesarios para instalar dependencias
# # COPY package*.json ./
# COPY tsconfig.json ./
# COPY package.json package-lock.json* ./


# # Instalar dependencias
# RUN npm install

# # Copiar el resto del código
# COPY . .

# # Generar Prisma Client
# RUN npx prisma generate

# # Compilar TS
# RUN npm run build

# EXPOSE 5000

# CMD ["node", "dist/index.js"]
