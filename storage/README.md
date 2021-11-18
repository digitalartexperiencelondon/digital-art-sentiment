# Sentiment Server Overview
This creates a server for receiving and serving sentiment events.

Sentiment events can include values of ```anger```, ```contempt```, ```disgust```, ```fear```, ```happiness```, ```neutral```, ```sadness```, and ```surprise``` between ```0``` and ```1``` inclusive.

## Architecture

The architecture is arranged so that two Docker containers are created.

The first Docker container is a MySQL server instance, and creates a MySQL database to store the sentiments along with a time stamp.

The second Docker container is created from the Dockerfile in `storage/Dockerfile`, which is based on a Golang base Docker image. This will handle requests and using the IP address of the MySQL Docker container, submit observations to the database.

## Set-up
### 1. Pull MySQL Docker image, and run the container
- #### On a laptop/desktop
  Download the base MySQL docker image
  ```
  docker pull mysql
  docker run --name art-mysql -e MYSQL_ROOT_PASSWORD=admin -d mysql:latest
  ```
- #### On a Raspberry Pi
  Download the ARM-suitable base MySQL docker image
  ```
  docker pull hypriot/rpi-mysql
  docker run --name art-mysql -e MYSQL_ROOT_PASSWORD=admin -d hypriot/rpi-mysql:latest
  ```
### 2. Get the MySQL Docker container's IP address
Find the art-mysql docker IP address (something like 172.17.0.2)
```
docker inspect art-mysql
```
This will print details about the container to the command line, and the IP address will be in the `"Networks"/"IPAddress" section.`

### 3. Build and run the GoLang based Docker container

Build and run the art-api docker container, connecting it to the MySQL db, and exposing internal port 10000 to external port 10000. Note the full stop at the end of this command, and ensure you replace <art-mysql container ip> with the IP address you found in the previous step. You must be located in the `storage` directory when running.

```
docker build -t art-api .
docker run --name art-api -e mysqlip=<art-mysql container ip>:3306 -e mysqlun=root:admin -p 10000:10000 art-api
```
You should see `Handling Requests` being outputted to the command line, which means that the server is running.

## After a restart
The containers already exist, they just need starting
```
docker start art-mysql
docker start art-api
```

## Sentiment API
The server exposes multiple endpoints for different purposes:

- ### GET endpoints
```/observations``` GET all sentiment events in the database

```/aggregated?t=<time>``` GET sentiment events grouped by type from the last ```<time>``` milliseconds

- ### POST endpoint
```/submit``` POST sentiment events to the database

For example, an event can be POSTed to the server as follows.
```
curl -X POST -H Content-Type:application/json -d '{"Type":"Audio", "anger":0.001, "surprise":0.8}' <server ip>:10000/submit
```
