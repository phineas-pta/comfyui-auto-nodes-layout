import { app } from "/scripts/app.js";

// https://cdn.jsdelivr.net/npm/dagre/dist/dagre.min.js
import "./dagre.min.js";
// https://cdn.jsdelivr.net/npm/elkjs/lib/elk.bundled.min.js
import "./elk.bundled.min.js";
// idk how to do named import with those

app.registerExtension({
	"name": "doof.autoNodesLayout",
	setup() { // Add canvas menu options
		const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = orig.apply(this, arguments);
			options.push(myRightClickMenu); // def below
			return options;
		}
	}
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
			}
		]
	}
};

/**
 * arrange nodes using Dagre layout
 * @see https://github.com/dagrejs/dagre
 * @todo add options to change density
 * @returns {undefined} Nothing is returned.
 */
function dagreLayout() {
	detectRerouteNode(); // def below

	// setup dagre
	const daG = new dagre.graphlib
		.Graph()
		.setGraph({
			"rankdir": "LR", // left to right
			"ranker": "network-simplex", // values: "network-simplex", "tight-tree", "longest-path"
			"nodesep": 100, // spacing in same column, can be changed
			"ranksep": 200, // spacing between columns, can be changed
		});

	// convert litegraph to dagre
	app.graph._nodes.forEach((n) => daG.setNode(
		n.id.toString(),
		{
			"label": n.type,
			"width": n.size[0],
			"height": n.size[1]
		}
	));
	app.graph.links.forEach((e) => daG.setEdge(
		e.origin_id.toString(),
		e.target_id.toString(),
		{ "label": e.type }
	));
	dagre.layout(daG);

	// retrieve nodes position
	for (const n of app.graph._nodes) {
		const nodeLaidOut = daG.node(n.id.toString());
		n.pos[0] = nodeLaidOut.x;
		n.pos[1] = nodeLaidOut.y;
	}

	return;
}

/**
 * arrange nodes using ELK ‘layered’ layout
 * @see https://github.com/kieler/elkjs
 * @todo add options to change density
 * @returns {undefined} Nothing is returned.
 */
function elkLayeredLayout() {
	detectRerouteNode(); // def below

	// convert litegraph to elk
	const myElkNodes = app.graph._nodes.map((n) => ({
		"id": n.id,
		"width": n.size[0],
		"height": n.size[1]
	}));
	const myElkEdges = app.graph.links.filter(Boolean).map((e) => ({
		"id": e.id,
		"sources": [ e.origin_id ],
		"targets": [ e.target_id ]
	}));
	const myElkGraph = {
		"id": "root",
		"children": myElkNodes,
		"edges": myElkEdges,
		"layoutOptions": {
			"elk.algorithm": "layered"
		}
	}

	// setup ELK & retrieve nodes position
	const elk = new ELK()
		.layout(myElkGraph)
		.then((val) => {
			for (const nodeLaidOut of val.children) {
				const n = app.graph.getNodeById(nodeLaidOut.id);
				n.pos[0] = nodeLaidOut.x * 2; // add more spacing
				n.pos[1] = nodeLaidOut.y * 2;
			}
		})
		.catch(console.error);

	return;
}

/**
 * make a alert in case there’s any reroute node
 * @returns {undefined} Nothing is returned.
 */
function detectRerouteNode() {
	for (const n of app.graph._nodes) {
		if (n.constructor.name === "RerouteNode") {
			window.alert(
				"Layout algorithms work best without Reroute nodes!\n"
				+ "better remove reroute before auto-layout then re-add after"
			);
			break;
		}
	}
	return;
}
