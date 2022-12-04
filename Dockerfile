#Documentation:
#https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# syntax=docker/dockerfile:1
FROM node

# install app
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# final configuration
EXPOSE 3000

#Run
CMD [ "node", "server.js" ]