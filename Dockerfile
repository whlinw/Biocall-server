FROM node:15.11.0-alpine
COPY . .
RUN mkdir /var/log/biocall-server
RUN npm install -g npm@7.13.0
RUN npm install
CMD ["node", "src/main.js"]