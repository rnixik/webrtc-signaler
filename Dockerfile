FROM node:9.11-alpine

ADD package.json /app/package.json

WORKDIR /app

RUN yarn install

ADD . /app

EXPOSE 80
EXPOSE 443

CMD node server.js
