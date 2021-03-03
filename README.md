# Biocall Server
The server part of the Biocall application.

## Setting up
```bash
$ git clone https://github.com/whlinw/Biocall-server.git
$ cd Biocall-server
$ docker-compose up --build -d
```

## Docker configurations
* **Port binding**: 4001:4001
* **Volume (for logs)**: ./log:/var/log/biocall-server

## Port usage
The server listens to port `4001`.

## Logging
Log files are stored at `/var/log/biocall-server` in the container. The directory is mapped to `./log` on the host machine, so the logs are preserved and accessible. Two files `info-YYYY-MM-DD.log` and `error-YYYY-MM-DD.log` will be generated per day while the server is up. Logs in the recent 14 days are maintained.