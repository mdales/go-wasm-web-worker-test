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


const GRIDIWDTH = 4;
const GRIDHEIGHT = 3;

const drawAndPaint = (x, y, canvasImageData) => {

	exports.draw(x, y, GRIDIWDTH, GRIDHEIGHT);

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
