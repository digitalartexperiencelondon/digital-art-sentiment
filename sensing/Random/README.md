# Generate random data

Pull the base docker image
```docker pull python:3.6-buster```

Build the container
```docker build -t art-random```

Run the container and push data every 5 seconds forever (until container is stopped)
```docker run -d --name art-random --env SENTIMENT_SERVER_IP=<server ip> art-random```

After restart
```docker start art-random```
