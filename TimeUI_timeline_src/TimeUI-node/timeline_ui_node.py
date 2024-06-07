class TimelineUI:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "model": ("MODEL", {}),
            }
        }

    RETURN_TYPES = ("MODEL",)
    RETURN_NAMES = ("Model",)

    FUNCTION = "handle_timeline"
    CATEGORY = "TimelineUI"

    def handle_timeline(self, model=None):
        pass

NODE_CLASS_MAPPINGS = {
    "TimelineUI": TimelineUI,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "TimelineUI": "Timeline UI",
}
