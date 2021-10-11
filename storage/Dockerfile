# syntax=docker/dockerfile:1
FROM golang:1.17.1-alpine3.14
WORKDIR /app
COPY main.go ./
RUN go mod init art-api
RUN go get
RUN go build -o /art-api
CMD ["/art-api"]
