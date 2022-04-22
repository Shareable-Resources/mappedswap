FROM node:14.18.0 
WORKDIR /app
COPY package*.json ./
RUN  npm install
RUN  npm install --only=dev
COPY . .
WORKDIR /app/src/server/onlineDataFetcher/smartcontract/v3-core-main
RUN  npm install
RUN npm run compile
WORKDIR /app
RUN  npm run build
EXPOSE 8094 8095 8096

CMD [ "npm", "run","local"]