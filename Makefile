
main.wasm: main.go
	GOOS=js GOARCH=wasm go build -o main.wasm ./main.go

requirements:
	cp `go env GOROOT`/lib/wasm/wasm_exec.js .

serve:
	python3 -m http.server
