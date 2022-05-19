TARGET=bin/reader
GO_PKG=github.com/whitekid/reader
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
	go mod init ${GO_PKG}

	go get github.com/whitekid/goxp@62936a6650e354d0e3b34715dd5200bef7d5c0b8
	@$(MAKE) tidy

tidy:
	go mod tidy
