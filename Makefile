
main.wasm: main.go
	GOOS=js GOARCH=wasm go build -o main.wasm ./main.go

serve:
	python3 -m http.server
