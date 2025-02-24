const go = new Go();


function draw(worker, canvasname) {
	const canvasElement = document.getElementById(canvasname);
	const canvasContext = canvasElement.getContext("2d");
	const canvasImageData = canvasContext.createImageData(
		canvasElement.width,
		canvasElement.height
	);
	canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

	worker.postMessage({
		action: "draw",
		payload: canvasImageData
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

const GRIDIWDTH = 3;
const GRIDHEIGHT = 3;

const runWasm = async () => {
	for (let i = 0; i < (GRIDIWDTH * GRIDHEIGHT); i++) {
		const canvasname = "canvas" + i;
		const worker = new Worker("worker.js");
		worker.onmessage = ({ data }) => {
			let { action, payload } = data;
			switch (action) {
				case "log":
					console.log(`worker.log: ${payload}`);
					break;
				case "ready":
					draw(worker, canvasname);
					break;
				case "result":
					resultReady(payload, canvasname);
					break;
				default:
					console.error(`Unknown action: ${action}`);
			}
		};
	};
}

document.addEventListener('DOMContentLoaded', function() {
	runWasm();
});
