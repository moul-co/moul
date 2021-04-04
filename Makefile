darwin: ## Build for macOS.
	env GOOS=darwin GOARCH=amd64 go build -ldflags "-s -w" -o bin/moul_darwin_amd64

linux: ## Build for Linux.
	env GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o bin/moul_linux_amd64

windows: ## Build for Windows.
	env GOOS=windows GOARCH=amd64 go build -ldflags "-s -w" -o bin/moul_windows_amd64.exe
