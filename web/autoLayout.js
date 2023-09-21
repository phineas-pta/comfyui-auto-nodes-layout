import { app } from "/scripts/app.js";

// https://cdn.jsdelivr.net/npm/dagre/dist/dagre.min.js
import "./dagre.min.js";
// https://cdn.jsdelivr.net/npm/elkjs/lib/elk.bundled.min.js
import "./elk.bundled.min.js";
// idk how to do named import with those


app.registerExtension({
	"name": "PTA.autoNodesLayout",
	setup() { // Add canvas menu options
		const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = orig.apply(this, arguments);
			options.push(myRightClickMenu); // def below
			return options;
		}
	},
});


const myRightClickMenu = {
	"content": "📍 auto nodes layout",
	"has_submenu": true,
	"submenu": {
		"options": [
			{
				"content": "LiteGraph.js default layout",
				"callback": () => app.graph.arrange()
			},
			{
				"content": "Dagre.js layout",
				"callback": dagreLayout // def below
			},
			{
				"content": "ELK.js ‘layered’ layout",
				"callback": elkLayeredLayout // def below
			},
		],
	},
};


// 2 values to control layout density (string for max compability with window.prompt)
var ranksep = "200"; // spacing (px) between ranks/depths/columns
var nodesep = "150"; // spacing (px) between nodes in same rank/depth/column


/**
 * arrange nodes using Dagre layout
 * @see https://github.com/dagrejs/dagre
 * @todo better UI than pop-up
 * @returns {undefined} Nothing is returned.
 */
function dagreLayout() {
	popupInput(); // def below

	// setup dagre
	const daG = new dagre.graphlib
		.Graph({ "compound": false })
		.setGraph({
			"rankdir": "LR", // left to right
			"ranker": "network-simplex",
			// values: "network-simplex", "tight-tree", "longest-path"
			"ranksep": parseFloat(ranksep),
			"nodesep": parseFloat(nodesep),
		})
		.setDefaultNodeLabel(() => ({}))
		.setDefaultEdgeLabel(() => ({}));

	// convert litegraph to dagre
	app.graph._nodes.forEach((n) => daG.setNode(
		n.id.toString(),
		{
			"width": n.size[0],
			"height": n.size[1],
		}
	));
	app.graph.links.forEach((e) => daG.setEdge(
		e.origin_id.toString(),
		e.target_id.toString()
	));

	// apply layout algorithm
	dagre.layout(daG);

	// retrieve nodes position
	for (const n of app.graph._nodes) {
		const nodeLaidOut = daG.node(n.id.toString());
		n.pos[0] = nodeLaidOut.x;
		n.pos[1] = nodeLaidOut.y;
	}

	app.graph.setDirtyCanvas(true, true); // refresh after applying the layout
	return;
}


/**
 * arrange nodes using ELK ‘layered’ layout
 * @see https://github.com/kieler/elkjs
 * @todo better UI than pop-up
 * @returns {undefined} Nothing is returned.
 */
function elkLayeredLayout() {
	popupInput(); // def below

	// convert litegraph to elk
	const myElkNodes = app.graph._nodes.map((n) => ({
		"id": n.id,
		"width": n.size[0],
		"height": n.size[1],
	}));
	const myElkEdges = app.graph.links.filter(Boolean).map((e) => ({
		"id": e.id,
		"sources": [ e.origin_id ],
		"targets": [ e.target_id ],
	}));

	// setup ELK
	const myElkGraph = {
		"id": "root",
		"children": myElkNodes,
		"edges": myElkEdges,
		"layoutOptions": {
			"elk.algorithm": "layered",
			"elk.direction": "RIGHT",
			"elk.layered.layering.strategy": "NETWORK_SIMPLEX",
			// values: "NETWORK_SIMPLEX", "LONGEST_PATH", "COFFMAN_GRAHAM"
			"elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
			// values: "NETWORK_SIMPLEX", "BRANDES_KOEPF", "LINEAR_SEGMENTS"
			"elk.layered.spacing.nodeNodeBetweenLayers": ranksep,
			"elk.spacing.nodeNode": nodesep,
		},
	};

	// apply layout algorithm
	const elk = new ELK()
		.layout(myElkGraph)
		.then((val) => {
			// retrieve nodes position
			for (const nodeLaidOut of val.children) {
				const n = app.graph.getNodeById(nodeLaidOut.id);
				n.pos[0] = nodeLaidOut.x;
				n.pos[1] = nodeLaidOut.y;
			}

			// refresh after applying the layout
			app.graph.setDirtyCanvas(true, true);
		})
		.catch(console.error);

	return;
}


/**
 * ask for user input to control layout density then
 * make a alert in case there’s any reroute node
 * @returns {undefined} Nothing is returned.
 */
function popupInput() {
	// change global value in a session
	ranksep = window.prompt("Enter spacing (px) between ranks/depths/columns", ranksep);
	nodesep = window.prompt("Enter spacing (px) between nodes in same rank/depth/column", nodesep);

	// make a alert in case there’s any reroute node
	for (const n of app.graph._nodes) {
		if (n.type === "Reroute") {
			window.alert(
				"Layout algorithms work better without Reroute nodes!\n"
				+ "better remove reroute before auto-layout then re-add after"
			);
			break;
		}
	}

	return;
}
