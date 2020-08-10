FROM node:8-alpine

MAINTAINER GALYMZHAN ALMABEK

WORKDIR /api

COPY . /api/

ENV PORT=5000
ENV DATABASE_URL=mongodb://tellee-db:27017/tellee_admin
ENV MAINFLUX_URL=http://nginx
ENV BOOTSTRAP_URL=http://bootstrap:8200
ENV UI_URL=http://admin-panel-interface:8000

RUN npm install

EXPOSE 5000

## WAIT UNTIL MONGODB IS RUNNING
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && npm start
