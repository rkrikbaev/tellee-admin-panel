FROM node:8-alpine

MAINTAINER GALYMZHAN ALMABEK

WORKDIR /client

COPY . /client/

ENV REACT_APP_EXPRESS_HOST http://admin-panel-server:5000
ENV REACT_APP_MAINFLUX_USER zeinetsse10@email.com
ENV REACT_APP_CHANNEL_NAME global_channel
ENV FLASK_URL tellee-ml:8100

RUN npm install && npm run build

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

EXPOSE 8000

CMD npm run production
