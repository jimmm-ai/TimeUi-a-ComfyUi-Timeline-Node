from .timeline_ui_node import TimelineUI
import sys
import os


sys.path.insert(0,os.path.dirname(os.path.realpath(__file__)))
module_root_directory = os.path.dirname(os.path.realpath(__file__))
module_js_directory = os.path.join(module_root_directory, "js")

NODE_CLASS_MAPPINGS = {
    "jimmm.ai.TimelineUI": TimelineUI,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "jimmm.ai.TimelineUI": "TimelineUI",
}

WEB_DIRECTORY = "./js"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
