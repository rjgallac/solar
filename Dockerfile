FROM node:18-alpine

WORKDIR /usr/src/app

# copy package manifests first for efficient caching
COPY package.json package-lock.json* ./

RUN npm install --production --no-audit --no-fund

# copy source
COPY . .

EXPOSE 9200

# do not include secrets in image; pass via env or mount .env
CMD ["node", "exporter.js"]
