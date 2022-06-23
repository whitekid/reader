TARGET=bin/reader
SRC=$(shell find . -type f -name '*.go' -not -path "./vendor/*" -not -path "*_test.go")
GOPATH=$(shell go env GOPATH)
BUILD_FLAGS?=-v

.PHONY: clean test get tidy

all: build
build: $(TARGET)

$(TARGET): $(SRC)
	@mkdir -p bin
	go build -o bin/ ${BUILD_FLAGS} ./cmd/...

clean:
	rm -f ${TARGET}

test:
	go test -v ./...

# update modules & tidy
dep:
	rm -f go.mod go.sum
	go mod init reader

	@$(MAKE) tidy

tidy:
	@go mod tidy -v

docker:
	docker build --pull --rm -t reader .
