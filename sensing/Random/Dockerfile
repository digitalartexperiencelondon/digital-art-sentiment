# syntax=docker/dockerfile:1
FROM python:3.6-buster
WORKDIR /app
RUN pip install requests
COPY entrypoint.sh /entrypoint.sh
COPY random_input.py ./

ENTRYPOINT ["/entrypoint.sh"]
