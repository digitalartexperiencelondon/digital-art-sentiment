# Sentiment Server

This creates a server for receiving and serving sentiment events.

Sentiment events can include values of ```anger```, ```contempt```, ```disgust```, ```fear```, ```happiness```, ```neutral```, ```sadness```, and ```surprise``` between ```0``` and ```1``` inclusive.

## Set-up
On a Non-Raspberry Pi - download the base mysql docker image
```
docker pull mysql
docker run --name art-mysql -e MYSQL_ROOT_PASSWORD=admin -d mysql:latest
```
On Raspberry Pi - download the ARM-suitable base mysql docker image
```
docker pull hypriot/rpi-mysql
docker run --name art-mysql -e MYSQL_ROOT_PASSWORD=admin -d hypriot/rpi-mysql:latest
```
Find the art-mysql docker ip address (something like 172.17.0.2)
```
docker inspect art-mysql
```

Build and run the art-api docker container, connecting to mysql db, and exposing internal port 10000 to external >docker 
```
docker build -t art-api .
docker run --name art-api -e mysqlip=<art-mysql container ip>:3306 -e mysqlun=root:admin -p 10000:10000 art-api
```

## After a restart
The containers already exist, they just need starting 
```
docker start art-mysql
docker start art-api
```

## Sentiment API
The server exposes multiple endpoints for different purposes

### GET endpoints
```/observations``` GET all sentiment events in the database

```/aggregated?t=<time>``` GET sentiment events grouped by type from the last ```<time>``` milliseconds

### POST endpoint
```/submit``` POST sentiment events to the database

For example, an event can be POSTed to the server as follows. 
```
curl -X POST -H Content-Type:application/json -d '{"Type":"Audio", "anger":0.001, "surprise":0.8}' <server ip>:10000/submit
```
