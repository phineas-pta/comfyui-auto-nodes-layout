# ComfyUI auto nodes layout

a ComfyUI extension that applies an improved node layout algorithm to ComfyUI workflows, primarily for better visualization

this serves as a working prototype of the proof-of-concept detailed in Comfy-Org/ComfyUI#1547

## description

while ComfyUI includes a [1-click auto-arrange feature](https://github.com/pythongosssss/ComfyUI-Custom-Scripts#auto-arrange-graph) based on `LiteGraph.js`’s default `arrange()` method, which [organizes nodes by dependency levels](https://github.com/jagenjo/litegraph.js/issues/9#issuecomment-377317416), i find its wire orientation often leads to visual clutter

for better visualization, my goal is to ensure all connections are clearly visible, indicating their direction, flow, and specific node attachments

given my limited understanding, it appears most (if not all) ComfyUI workflows can be classified as [directed acyclic graphs](https://en.wikipedia.org/wiki/Directed_acyclic_graph); this suggests that more advanced [graph drawing algorithms](https://en.wikipedia.org/wiki/Graph_drawing) could be applied; specifically, i’m focusing on [hierarchical graph drawing](https://en.wikipedia.org/wiki/Layered_graph_drawing), which seems particularly well-suited for directed acyclic graphs.

**credit**: this approach was inspired by this [comment](https://github.com/jagenjo/litegraph.js/issues/9#issuecomment-376413726)

**disclaimer**: this reflects a personal preference, and it often produces larger graphs

> [!IMPORTANT]
> it’s recommended to remove ‘ReRoute’ nodes from your ComfyUI workflows prior to applying the layout

Here’s why:
- Directed acyclic graphs, like ComfyUI workflows, are typically structured with clear start and end nodes. Layout algorithms for such graphs operate by assigning a ‘column’ or ‘rank’ to each node, creating a layered visual hierarchy.
- ‘ReRoute’ nodes disrupt this column assignment. Their presence can lead to misaligned nodes and a less intuitive, harder-to-read layout.
- You can re-introduce ‘ReRoute’ nodes after the layout has been applied. This allows you to manage any wires that might be intercepted or partially obscured by other nodes in the newly optimized arrangement.

It’s worth noting that since ComfyUI workflows are inherently oriented from left to right, the concept of ‘depth’ is more accurately described as a ‘column’ or ‘rank’ within this hierarchical context.

## how to use

**Installation**: via ComfyUI Manager for ease of use, or clone this repository manually using `git` if you’re developing (no additional requirements needed)

**Using**:
1. Finalize your workflow, then remove any Reroute nodes from your graph (you can add them back afterward if needed)
2. Access the layout options by either:
   - Right-clicking on the canvas, or
   - Navigating to the top menu bar: Extensions > 📍 auto nodes layout
3. Choose your preferred layout algorithm from the available options
4. Customize the spacing between columns and nodes by adjusting the settings in ComfyUI settings

## implementation details

the principle is to use an external library to compute all nodes position, then retrieve back to `LiteGraph.js`

requirements: ComfyUI version ≥ 0.12.3

implemented algorithms:
- Dagre layout from https://github.com/dagrejs/dagre
- ELK ‘layered’ layout from https://github.com/kieler/elkjs

2 options to control layout density:
- horizontal spacing between columns
- vertical spacing between nodes in same column

## example

using [noisy latent composition example](https://comfyanonymous.github.io/ComfyUI_examples/noisy_latent_composition/)

(the empty black rectangle box is browser viewport)

- original workflow:
![Imgur](https://i.imgur.com/jqa3SoD.png)
remove groups because nodes gonna be placed very differently

- `LiteGraph.js` default auto-arrange:
![Imgur](https://i.imgur.com/3hTAdDU.png)

- `Dagre.js` layout:
![Imgur](https://i.imgur.com/19TVkpT.png)

- `ELK.js` ‘layered’ layout:
![Imgur](https://i.imgur.com/yNztWil.png)

## extra

other possible graph layout in JS (but unsatisfying to me nor suitable for DAG):
- ELK: https://eclipse.dev/elk/reference/algorithms.html
- WebCOLA: https://github.com/tgdwyer/WebCola
- Cytoscape: https://blog.js.cytoscape.org/2020/05/11/layouts/#choice-of-layout
  - AVSDF: https://github.com/iVis-at-Bilkent/avsdf-base
  - CoSE: https://github.com/iVis-at-Bilkent/cose-base
- Graphology: https://graphology.github.io/standard-library/layout.html
- Springy: https://github.com/dhotson/springy
