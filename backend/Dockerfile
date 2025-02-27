FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Disk alanı sorununu çözmek için npm önbelleğini temizleyelim
RUN npm install --no-cache && npm cache clean --force

COPY . .

EXPOSE 5000

CMD ["npm", "start"] 