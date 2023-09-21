# ComfyUI auto nodes layout

a ComfyUI extension to apply better nodes layout algorithm to ComfyUI workflow (mostly for visualization purpose)

this repo is a working prototype of my proof-of-concept in comfyanonymous/ComfyUI#1547

## short intro

there’s already an [1-click auto-arrange graph](https://github.com/pythongosssss/ComfyUI-Custom-Scripts#auto-arrange-graph) but it relies on default `arrange()` of `LiteGraph.js` (backbone of ComfyUI) which [positions the nodes according to level of dependencies](https://github.com/jagenjo/litegraph.js/issues/9#issuecomment-377317416), it’s neat but imo the wires are very disorientated (for visualization purpose)

my ideal is to have all wires visible, in term of direction, flow and connection to nodes

from my very limited understanding, most if not all ComfyUI workflows can be qualified as [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph), so we can apply better [graph drawing algorithms](https://en.wikipedia.org/wiki/Graph_drawing), in particular here i focus on [hierarchical graph drawing](https://en.wikipedia.org/wiki/Layered_graph_drawing) the most suitable for directed acyclic graph

**credit**: inspiration from this [comment](https://github.com/jagenjo/litegraph.js/issues/9#issuecomment-376413726)

**disclaimer**: personal preference, graph very much larger, not always guarantee a better layout for all use-cases

## implementation details

the principle is use an external library to calculate all nodes position, then retrieve back to `LiteGraph.js`

recommend to remove reroute nodes:
- directed acyclic graph has start & end nodes
- the algorithms work by assigning ranks/depth to each node (hence “hierarchical” or “layered” in context of tree/upside-down graph)
- reroute nodes mess up ranks/depth so should be removed
- after applied layout u can re-add reroute nodes for any wires intercepted or  partially hidden by nodes
- *side-note*: since ComfyUI workflows are left-right hence no depth but column

requirements:
- ComfyUI version later than PR comfyanonymous/ComfyUI#1273 or commit `bc76b38`

implemented algorithms:
- Dagre layout from https://github.com/dagrejs/dagre
- ELK ‘layered’ layout from https://github.com/kieler/elkjs

undo/redo possible with https://github.com/bmad4ever/ComfyUI-Bmad-DirtyUndoRedo

2 options to control layout density:
- spacing between ranks/depths/columns
- spacing between nodes in same rank/depth/column

**TODO**:
- [x] refresh after apply layout (issues #1 #2)
- [x] add UI options to change density
- [ ] better UI than pop-up (?) for options to change density
- [ ] option to select layout strategy (see docs for each algo), maybe submenu

## example
using [noisy latent composition example](https://comfyanonymous.github.io/ComfyUI_examples/noisy_latent_composition/)

(the empty black rectangle box is browser viewport)

- original workflow:
![Imgur](https://i.imgur.com/jqa3SoD.png)
remove groups coz nodes gonna be placed very differently

- `LiteGraph.js` default auto-arrange:
![Imgur](https://i.imgur.com/3hTAdDU.png)

- `Dagre.js` layout:
![Imgur](https://i.imgur.com/19TVkpT.png)

- `ELK.js` ‘layered’ layout:
![Imgur](https://i.imgur.com/yNztWil.png)

## extra

other possible graph layout in JS (but unsatisfying to me nor for DAG):
- ELK: https://eclipse.dev/elk/reference/algorithms.html
- WebCOLA: https://github.com/tgdwyer/WebCola
- Cytoscape: https://blog.js.cytoscape.org/2020/05/11/layouts/#choice-of-layout
  - AVSDF: https://github.com/iVis-at-Bilkent/avsdf-base
  - CoSE: https://github.com/iVis-at-Bilkent/cose-base
- Graphology: https://graphology.github.io/standard-library/layout.html
- Springy: https://github.com/dhotson/springy
