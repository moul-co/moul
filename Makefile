VERSION = $(shell cat version)

GO_FLAGS += "-ldflags=-s -w"
GO_FLAGS += -trimpath

dev:
	make -j moul css

build_all:
	make build_darwin_arm64 build_darwin_x64 build_wasm build_linux_x64 build_wasm

moul:
	air

css:
	npm run dev:css

build_wasm:
	GOOS=js GOARCH=wasm go build -o "../@moul-co/wasm/bin/wasm-$(VERSION).wasm" wasm/main.go

build_darwin_arm64:
	GOOS=darwin GOARCH=arm64 go build -o  "../@moul-co/darwin-arm64/bin/darwin-arm64-$(VERSION)" main.go

build_darwin_x64:
	GOOS=darwin GOARCH=amd64 go build -o  "../@moul-co/darwin-x64/bin/darwin-x64-$(VERSION)" main.go

build_linux_arm64:
	GOOS=darwin GOARCH=arm64 go build -o  "../@moul-co/linux-arm64/bin/linux-arm64-$(VERSION)" main.go

build_linux_x64:
	GOOS=linux GOARCH=amd64 go build -o  "../@moul-co/linux-x64/bin/linux-x64-$(VERSION)" main.go

publish_wasm:
	cd npm/wasm && npm publish --access=public

publish_darwin_arm64:
	cd npm/darwin-arm64 && npm publish --access=public

publish_darwin_x64:
	cd npm/darwin-x64 && npm publish --access=public

publish_linux_arm64:
	cd npm/linux-arm64 && npm publish --access=public

publish_linux_x64:
	cd npm/linux-x64 && npm publish --access=public
