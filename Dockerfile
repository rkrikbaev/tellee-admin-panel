FROM node:8-alpine

MAINTAINER GALYMZHAN ALMABEK

WORKDIR /api

COPY . /api/

ENV PORT=5000
ENV DATABASE_URL=mongodb://mainflux-db:27017/mainflux_admin
ENV MAINFLUX_URL=134.209.240.215
ENV BOOTSTRAP_URL=134.209.240.215:8200
ENV UI_URL=http://localhost:8000

RUN npm install

EXPOSE 5000

## THE LIFE SAVER
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && npm start