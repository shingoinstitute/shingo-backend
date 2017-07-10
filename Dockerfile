FROM node:8

WORKDIR /code

COPY package.json package.json

COPY package-lock.json package-lock.json

RUN npm install -g typescript nodemon

RUN npm install

RUN echo "127.0.0.1 api.shingo.org" >> /etc/hosts

ENV PORT=80

EXPOSE 80

ENTRYPOINT [ "nodemon" ]