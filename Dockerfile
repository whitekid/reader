FROM golang:1.23-alpine AS builder
RUN --mount=type=cache,id=go.pkg,target=/go/pkg/mod \
    --mount=type=cache,id=go.build,target=/root/.cache/go-build \
	apk add --no-cache make \
    gcc musl-dev
WORKDIR /go/src
COPY . /go/src
RUN make build

FROM alpine
COPY --from=builder /go/src/bin/reader ./
ENTRYPOINT ["./reader"]
