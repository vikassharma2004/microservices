# use the offcial node image from docker hub 

FROM node:18-alpine


WORKDIR /use/src/app

COPY package*.json ./

RUN npm ci --only=production install


COPY . .

EXPOSE  3000 

CMD ["node", "src/server.js"]

