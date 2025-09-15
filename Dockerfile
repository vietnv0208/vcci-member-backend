# Build stage
FROM node:22.4-alpine AS build

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22.4-alpine

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY --from=build /app/dist ./dist
RUN echo "re change"
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["sh", "/app/entrypoint.sh"]
