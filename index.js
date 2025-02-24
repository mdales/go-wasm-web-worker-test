const go = new Go();


const drawAndPaint = (exports) => {
	// Get our canvas element from our index.html
	const canvasElement = document.querySelector("canvas");

	// Set up Context and ImageData on the canvas
	const canvasContext = canvasElement.getContext("2d");
	const canvasImageData = canvasContext.createImageData(
		canvasElement.width,
		canvasElement.height
	);

	// Clear the canvas
	canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);


	// Generate a new checkboard in wasm
	exports.draw();

	const memory = exports.mem; // was exports.memory
	const wasmByteMemoryArray = new Uint8Array(memory.buffer);

	// Pull out the RGBA values from Wasm memory, the we wrote to in wasm,
	// starting at the checkerboard pointer (memory array index)
	const imageDataArray = wasmByteMemoryArray.slice(
		exports.getGraphicsBufferPointer(),
		exports.getGraphicsBufferPointer() + exports.getGraphicsBufferSize()
	);

	console.log(imageDataArray);

	// Set the values to the canvas image data
	canvasImageData.data.set(imageDataArray);

	// Clear the canvas
	canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

	// Place the new generated checkerboard onto the canvas
	canvasContext.putImageData(canvasImageData, 0, 0);
};


const runWasm = async () => {
	let mod, inst;

	WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
		mod = result.module;
		inst = result.instance;
		go.run(inst);
		console.log(mod);
		console.log(inst);



		drawAndPaint(inst.exports);


	}).catch((err) => {
		console.error(err);
	});
}

document.addEventListener('DOMContentLoaded', function() {
	runWasm();
});
