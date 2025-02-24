package main

const WIDTH int = 256;
const HEIGHT int = 256;
const BUFFER_SIZE int = WIDTH * HEIGHT * 4;

var graphicsBuffer [BUFFER_SIZE]uint8;

func main() {}

//go:wasmexport getGraphicsBufferPointer
func getGraphicsBufferPointer() *[BUFFER_SIZE]uint8 {
  return &graphicsBuffer
}

//go:wasmexport getGraphicsBufferSize
func getGraphicsBufferSize() int32 {
  return int32(BUFFER_SIZE);
}

//go:wasmexport draw
func draw() {
	for y := 0; y < HEIGHT; y++ {
		for x := 0; x < WIDTH; x++ {
			pixel := ((y * WIDTH) + x) * 4;
			graphicsBuffer[pixel + 0] = uint8(x);
			graphicsBuffer[pixel + 1] = uint8(y);
			graphicsBuffer[pixel + 2] = 0xFF;
			graphicsBuffer[pixel + 3] = 0xFF;
		}
	}
}
