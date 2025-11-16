FROM node:18-alpine

# Necesario para Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiar solo archivos necesarios para instalar dependencias
# COPY package*.json ./
COPY tsconfig.json ./
COPY package.json package-lock.json* ./


# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TS
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
