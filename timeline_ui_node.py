from .dependency_loader import load_dependencies


node_dependencies = {
    "ComfyUI_IPAdapter_plus": ["IPAdapterAdvanced", "IPAdapterUnifiedLoader"],
    "ComfyUI-KJNodes": ["CreateFadeMaskAdvanced"],
}


class TimelineUI:
    class_type = "jimmm.ai.TimelineUI"
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):

        input_types = {
            "required": {
                "model": ("MODEL", {}),
            },
        }

        return input_types

    RETURN_TYPES = ("MODEL",)
    RETURN_NAMES = ("model",)

    FUNCTION = "handle_timeline"
    CATEGORY = "anim_timeline"

    def handle_timeline(self, model=None, ipadapter_preset: str="", video_width: int=0, video_height: int=0, interpolation_mode: str="", number_animation_frames: int=0, frames_per_second: int=0, time_format: str=""):
        """ Handle lack of required dependencies here because all modules have to be imported by comfyui before finding them """
        dependencies = load_dependencies(node_dependencies, location="handle_timeline")
        if dependencies is None:
            return None

        IPAdapterAdvanced, _, CreateFadeMaskAdvanced = dependencies

        return {
            "ui": {},
            "result": (model,)
        }

    def IS_CHANGED(id):
        return float("NaN")
    
    def onExecute(self):
        pass
