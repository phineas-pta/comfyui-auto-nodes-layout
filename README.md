# ComfyUI auto nodes layout

a ComfyUI extension to apply better nodes layout algorithm to ComfyUI workflow (mostly for visualization purpose)

this repo is a working prototype of my proof-of-concept in comfyanonymous/ComfyUI#1547

## short intro

there's already an [1-click auto-arrange graph](https://github.com/pythongosssss/ComfyUI-Custom-Scripts#auto-arrange-graph) but it relies on default `arrange()` of `LiteGraph.js` which [positions the nodes according to level of dependencies](https://github.com/jagenjo/litegraph.js/issues/9#issuecomment-377317416), it's neat but imo the wires are very disorientated for visualization purpose

from my very limited understanding, most if not all ComfyUI workflows can be qualified as [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph), so we can apply better graph drawing algorithm

credit: inspiration from this [comment](https://github.com/jagenjo/litegraph.js/issues/9#issuecomment-376413726)

disclaimer: personal preference, not always guarantee a better layout

## implementation

requirements:
- ComfyUI version later than PR comfyanonymous/ComfyUI#1273 or commit `bc76b38`

implemented algorithms:
- Dagre layout from https://github.com/dagrejs/dagre
- ELK ‘layered’ layout from https://github.com/kieler/elkjs

other possible choices (but unsatisfied to me):
- ELK layouts: https://eclipse.dev/elk/reference/algorithms.html
- Cytoscape layouts: https://blog.js.cytoscape.org/2020/05/11/layouts/#choice-of-layout

undo/redo possible with https://github.com/bmad4ever/ComfyUI-Bmad-DirtyUndoRedo

TODO:
- add UI options to change density