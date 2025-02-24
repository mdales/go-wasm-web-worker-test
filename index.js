const go = new Go();


function draw(worker, x, y, canvasname) {
	const canvasElement = document.getElementById(canvasname);
	const canvasContext = canvasElement.getContext("2d");
	const canvasImageData = canvasContext.createImageData(
		canvasElement.width,
		canvasElement.height
	);
	canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

	worker.postMessage({
		action: "draw",
		payload: {
			x: x,
			y: y,
			buffer: canvasImageData
		}
	});
}

function resultReady(canvasImageData, canvasname) {

	const canvasElement = document.getElementById(canvasname);

	// Set up Context and ImageData on the canvas
	const canvasContext = canvasElement.getContext("2d");

	// Clear the canvas
	canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

	// Place the new generated checkerboard onto the canvas
	canvasContext.putImageData(canvasImageData, 0, 0);
}

const GRIDIWDTH = 4;
const GRIDHEIGHT = 3;

const runWasm = async () => {
	for (let y = 0; y < GRIDHEIGHT; y++) {
		for (let x = 0; x < GRIDIWDTH; x++) {
			const i = (y * GRIDIWDTH) + x;

			const canvasname = "canvas" + i;
			const worker = new Worker("worker.js");
			worker.onmessage = ({ data }) => {
				let { action, payload } = data;
				switch (action) {
					case "log":
						console.log(`worker.log: ${payload}`);
						break;
					case "ready":
						draw(worker, x, y, canvasname);
						break;
					case "result":
						resultReady(payload, canvasname);
						break;
					default:
						console.error(`Unknown action: ${action}`);
				}
			};
		};
	};
}

document.addEventListener('DOMContentLoaded', function() {
	runWasm();
});
