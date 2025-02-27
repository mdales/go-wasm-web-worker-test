package main

import (
	"math"
	"math/cmplx"
)

const BUFFER_WIDTH int = 256;
const BUFFER_HEIGHT int = 256;
const BUFFER_SIZE int = BUFFER_WIDTH * BUFFER_HEIGHT * 4;

const ITERATIONS = 256;


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

func compute(c complex128) int {
	z := c
	for i := range (ITERATIONS - 1) {
		if cmplx.Abs(z) > 2 {
			return i
		}
		z = cmplx.Pow(z, 2) + c
	}
	return - 1
}

func generatePlasmaPalette(size int) [][]uint8 {
	pal := make([][]uint8, size);
	for i := range size {
		col := make([]uint8, 3);

		fi := float64(i);
		fsize := float64(size);

		col[0] = uint8(math.Cos (fi * ((2.0 * math.Pi) / fsize)) * 127.0) + 128;
		col[1] = uint8(math.Cos((fi + (fsize / 3.0)) * ((2.0 * math.Pi) / fsize)) * 127.0) + 128;
		col[2] = uint8(math.Cos((fi + ((fsize * 2.0) / 3.0)) * ((2.0 * math.Pi) / fsize)) * 127.0) + 128;

		pal[i] = col;
	}
	return pal;
}

//go:wasmexport draw
func draw(xoffset, yoffset, xstep, ystep float64 ) {
	palette := generatePlasmaPalette(16);

	for y := range BUFFER_HEIGHT {
		for x := range BUFFER_WIDTH {

			coord := complex(
				xoffset + (xstep * float64(x)),
				yoffset + (ystep * float64(y)),
			);
			res := compute(coord);

			pixel := ((y * BUFFER_WIDTH) + x) * 4;

			if res >= 0 {
				for i := range 3 {
					graphicsBuffer[pixel + i] = palette[res % 16][i];
				}
			} else {
				for i := range 3 {
					graphicsBuffer[pixel + i] = 0;
				}
			}
			graphicsBuffer[pixel + 3] = 0xFF;
		}
	}
}
