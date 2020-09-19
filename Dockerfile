FROM golang:1.14-alpine AS builder

WORKDIR /go/src/github.com/moulco/moul

COPY . .

RUN go build . && mv moul /go/bin

###############
FROM alpine:3.6

WORKDIR /moul

COPY --from=builder /go/bin/moul /usr/local/bin
COPY --from=builder /go/src/github.com/moulco/moul/docs/example /moul

EXPOSE 5000

ENTRYPOINT ["moul"]
