importScripts("wasm_exec.js");

const go = new Go();
let exports;
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then(
	(result) => {
		exports = result.instance.exports;
		go.run(result.instance);
		console.log("Worker loaded WASM module");
		// console.log(exports);
		postMessage({ action: "ready", payload: null });
	}).catch((err) => {
		console.error("Worker failed to load WASM module: ", err)
	});


const GRID_WIDTH = 4;
const GRID_HEIGHT = 3;
const BUFFER_WIDTH = 256;
const BUFFER_HEIGHT = 256;

const FRACT_WIDTH = 3.0;
const FRACT_HEIGHT = 3.0;

const XOFFSET = -0.5;
const YOFFSET = 0.0;

const XSTEP = FRACT_WIDTH / (GRID_WIDTH * BUFFER_WIDTH);
const YSTEP = FRACT_HEIGHT / (GRID_HEIGHT * BUFFER_HEIGHT);

const drawAndPaint = (x, y, canvasImageData) => {

	const xoffset = XOFFSET - (FRACT_WIDTH / 2.0) + (x * (FRACT_WIDTH / GRID_WIDTH));
	const yoffset = YOFFSET - (FRACT_HEIGHT / 2.0) + (y * (FRACT_HEIGHT / GRID_HEIGHT));

	exports.draw(xoffset, yoffset, XSTEP, YSTEP);

	const memory = exports.mem; // was exports.memory
	const wasmByteMemoryArray = new Uint8Array(memory.buffer);

	// Pull out the RGBA values from Wasm memory, the we wrote to in wasm,
	// starting at the checkerboard pointer (memory array index)
	const imageDataArray = wasmByteMemoryArray.slice(
		exports.getGraphicsBufferPointer(),
		exports.getGraphicsBufferPointer() + exports.getGraphicsBufferSize()
	);

	// Set the values to the canvas image data
	canvasImageData.data.set(imageDataArray);
};

onmessage = ({ data }) => {
	let { action, payload } = data;
	postMessage({
		action: "log",
		payload: `Worker received message ${action}: ${payload}`,
	});
	switch (action) {
		case "draw":
			let { x, y, buffer} = payload;
			drawAndPaint(x, y, buffer);
			postMessage({ action: "result", payload: buffer });
			break;
		default:
			throw (`unknown action '${action}'`);
	}
};
