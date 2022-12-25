dev:
	make -j moul css

moul:
	air

css:
	npm run dev:css

build_wasm:
	GOOS=js GOARCH=wasm go build -o ./public/out/moul.wasm wasm/main.go
