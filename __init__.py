# -*- coding: utf-8 -*-

"""
@author: PTA
@title: auto nodes layout
@nickname: auto nodes layout
@description: a ComfyUI extension to apply better nodes layout algorithm to ComfyUI workflow (mostly for visualization purpose)
"""

# this file is the entry point so ComfyUI can detect as extension/custom node
# for more specifications see https://github.com/ltdrdata/ComfyUI-Manager

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web" # so ComfyUI can use custom CSS/JS

__all__ = ["WEB_DIRECTORY"]
