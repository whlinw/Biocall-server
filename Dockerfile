FROM node:12-alpine
COPY . .
RUN mkdir /var/log/biocall-server
RUN npm install
CMD ["node", "src/main.js"]