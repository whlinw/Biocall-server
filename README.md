# Biocall Server
The server part of the Biocall application.

## Setting up
```bash
# install git
$ sudo apt-get install git

# install nodejs
$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
$ sudo apt-get install -y nodejs

# install process manager pm2
$ sudo npm install pm2 -g

# get the biocall-server code
$ git clone https://github.com/whlinw/Biocall-server.git

# install dependencies
$ cd Biocall-server
$ npm install

# use pm2 to run and manage the Biocall-server process.
$ pm2 start main.js --name biocall-server 
# $ pm2 start main.js --name biocall-server -- --port=4002 --https --key='./cert/pvkey.pem' --cert='./cert/cert.crt'	# or start the server with some available arguments
# $ pm2 logs biocall-server 	# display logs
# $ pm2 delete biocall-server	# stop and delete the process
```
