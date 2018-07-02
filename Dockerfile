FROM node:8.9-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN mkdir logs && touch logs/api.log
RUN npm install --production --silent && mv node_modules ../
COPY . .
ENV PORT 80
EXPOSE 80
CMD node app.js
