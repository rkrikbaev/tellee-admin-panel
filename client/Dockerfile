FROM node:8-alpine

MAINTAINER GALYMZHAN ALMABEK

WORKDIR /client

COPY . /client/

ENV REACT_APP_EXPRESS_HOST=http://localhost:5000
ENV REACT_APP_MAINFLUX_USER=zeinetsse_2@email.com
ENV REACT_APP_CHANNEL_NAME=global_channel
ENV FLASK_URL=134.209.240.215:8100

RUN npm install &&\
    npm run build

EXPOSE 8000

CMD /usr/local/bin/docker-entrypoint.sh && npm run production