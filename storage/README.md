# Setting up the server for the database

The architecture is arranged so that two Docker containers are created.
The first Docker container is a MySQL server instance, and creates the MySQL database to store the sentiments along with a time stamp.
The second Docker container is created from the Dockerfile in `storage/Dockerfile`, which is based on a Go Lang base Docker image. This will handle requests and using the IP address of the MySQL Docker container, submit observations to the database.

## 1. Pull MySQL Docker image, and run the container
### On a laptop/desktop
Run the following commands:

    docker pull mysql
    docker run --name art-mysql -e MYSQL_ROOT_PASSWORD=admin -d mysql:latest

Ensure you are logged into the Docker command line interface, otherwise the first command will fail.

### On Raspberry Pi
Pulling the MySQL Docker image will not work on a Raspberry Pi, as the image is not built for ARM architectures.
Instead, run

    docker pull hypriot/rpi-mysql
    docker run --name art-mysql -e MYSQL_ROOT_PASSWORD=admin -d hypriot/rpi-mysql:latest

## 2. Get the MySQL Docker container's IP address
Run

    docker inspect art-mysql

This will print details about the container to the command line, and the IP address will be in the `"Networks"/"IPAddress" section.

## 3. Build and run the GoLang based Docker container
Build the second Docker container from the Dockerfile in `storage/`, by ensuring you are currently located in the `storage` directory, and then running

    docker build -t art-api .

Note the full stop at the end of this command.

Then, run the following to run the container. Ensure you replace <art-mysql-ip> with the IP address you found in step 2.

    docker run --name art-api -e mysqlip=<art-mysql-ip>:3306 -e mysqlun=root:admin -p 10000:10000 art-api

This will connect the `art-api` container to the MySQL database in the `art-mysql` container. It also exposes internal port 10000 to external port 10000.
You should see `Handling Requests` being outputted to the command line, which means that the server is running.
