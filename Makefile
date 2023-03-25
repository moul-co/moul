VERSION = $(shell cat version)

dev:
	make -j moul css

moul:
	air

css:
	npm run dev:css

tag_and_push:
	git tag ${VERSION} && git push origin ${VERSION}
	
release:
	goreleaser release

build_all:
	make build_darwin_arm64 build_darwin_x64 build_wasm build_linux_x64 build_linux_arm64

build_wasm:
	GOOS=js GOARCH=wasm go build -ldflags "-s -w -X main.version=${VERSION}" -o npm/wasm/bin/moul.wasm wasm/main.go

build_darwin_arm64:
	GOOS=darwin GOARCH=arm64 go build -ldflags "-s -w -X main.version=${VERSION}" -o npm/darwin-arm64/bin/moul main.go

build_darwin_x64:
	GOOS=darwin GOARCH=amd64 go build -ldflags "-s -w -X main.version=${VERSION}" -o npm/darwin-x64/bin/moul main.go

build_linux_arm64:
	GOOS=linux GOARCH=arm64 go build -ldflags "-s -w -X main.version=${VERSION}" -o npm/linux-arm64/bin/moul main.go

build_linux_x64:
	GOOS=linux GOARCH=amd64 go build -ldflags "-s -w -X main.version=${VERSION}" -o npm/linux-x64/bin/moul main.go

publish_all:
	make publish_wasm publish_darwin_arm64 publish_darwin_x64 publish_linux_arm64 publish_linux_x64

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
