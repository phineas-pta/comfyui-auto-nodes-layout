import { app } from "/scripts/app.js"; // the Comfy application running in the browser
import "./dagre.min.js"; // copied from https://cdn.jsdelivr.net/npm/dagre/dist/dagre.min.js
import "./elk.bundled.min.js"; // copied from https://cdn.jsdelivr.net/npm/elkjs/lib/elk.bundled.min.js
// idk how to do named import with those


app.registerExtension({
	"name": "PTA.autoNodesLayout",
	"settings": [
		{
			id: "PTA.autoNodesLayout.ranksep",
			name: "spacing (px) between ranks/depths/columns",
			type: "number",
			defaultValue: 200,
		},
		{
			id: "PTA.autoNodesLayout.nodesep",
			name: "spacing (px) between nodes in same rank/depth/column",
			type: "number",
			defaultValue: 150,
		},
	],
	"aboutPageBadges": [
		{
			"label": "GitHub",
			"url": "https://github.com/phineas-pta/comfyui-auto-nodes-layout",
			"icon": "pi pi-github"
		}
	],
	async setup() { // Called at the end of the startup process. Add canvas menu options
		const orig = LGraphCanvas.prototype.getCanvasMenuOptions; // current user interface
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = orig.apply(this, arguments);
			options.push(myRightClickMenu); // add my custom function as menu options, see definition below
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
				"callback": dagreLayout // see definition below
			},
			{
				"content": "ELK.js ‘layered’ layout",
				"callback": elkLayeredLayout // see definition below
			},
		],
	},
};


/**
 * arrange nodes using Dagre layout
 * @see https://github.com/dagrejs/dagre
 * @returns {undefined} Nothing is returned.
 */
async function dagreLayout() {
	popupInput(); // see definition below

	// setup dagre
	const daG = new dagre.graphlib
		.Graph({ "compound": false })
		.setGraph({
			"rankdir": "LR", // left to right
			"ranker": "network-simplex",
			// values: "network-simplex", "tight-tree", "longest-path"
			"ranksep": app.extensionManager.setting.get("PTA.autoNodesLayout.ranksep"),
			"nodesep": app.extensionManager.setting.get("PTA.autoNodesLayout.nodesep"),
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
 * @returns {undefined} Nothing is returned.
 */
async function elkLayeredLayout() {
	popupInput(); // see definition below

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
			"elk.layered.spacing.nodeNodeBetweenLayers": app.extensionManager.setting.get("PTA.autoNodesLayout.ranksep"),
			"elk.spacing.nodeNode": app.extensionManager.setting.get("PTA.autoNodesLayout.nodesep"),
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
 * make a alert in case there’s any reroute node
 * also served as placeholder for any additional check in the future
 * @returns {undefined} Nothing is returned.
 */
function popupInput() {
	for (const n of app.graph._nodes) {
		if (n.type === "Reroute") {
			app.extensionManager.toast.add({
				severity: "warn",
				summary: "Warning",
				detail: "Layout algorithms work better without Reroute nodes!\nbetter remove reroute before auto-layout then re-add after",
			});
			break;
		}
	}
	return;
}
