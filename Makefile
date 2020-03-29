darwin: ## Build for macOS.
	env GOOS=darwin GOARCH=amd64 go build -ldflags "-s -w" -o bin/moul-darwin -i github.com/moul-co/moul

linux: ## Build for Linux.
	env GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o bin/moul-linux -i github.com/moul-co/moul

windows: ## Build for Windows.
	env GOOS=windows GOARCH=amd64 go build -ldflags "-s -w" -o bin/moul-windows.exe -i github.com/moul-co/moul
