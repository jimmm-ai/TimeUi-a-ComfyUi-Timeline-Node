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
        # Attempting to collect the presets from IPAdapter Plus but has a default if import fails due to node loading issues
        presets = [
            'LIGHT - SD1.5 only (low strength)',
            'STANDARD (medium strength)',
            'VIT-G (medium strength)',
            'PLUS (high strength)',
            'PLUS FACE (portraits)',
            'FULL FACE - SD1.5 only (portraits stronger)'
        ]

        return {
            "required": {
                "model": ("MODEL", {}),
            },
            "optional": {
                "ipadapter_preset": (presets, {
                    "default": "LIGHT - SD1.5 only (low strength)"
                }),
                "video_width": ("INT", {
                    "default": 512,
                    "min": 0,
                    "max": 10000,
                    "step": 1
                }),
                "video_height": ("INT", {
                    "default": 512,
                    "min": 0,
                    "max": 10000,
                    "step": 1
                }),
                "interpolation_mode": (["Linear", "Ease_in", "Ease_out", "Ease_in_out"], {
                    "default": "Linear"
                }),
                "number_animation_frames": ("INT", {
                    "default": 96,
                    "min": 8,
                    "max": 12000,
                    "step": 12
                }),
                "frames_per_second": ("INT", {
                    "default": 12,
                    "min": 8,
                    "max": 60,
                    "step": 8
                }),
                "time_format": (["Frames", "Seconds"], {
                    "default": "Frames"
                }),
            }
        }

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

    def IS_CHANGED(id):
        return float("NaN")
    
    def onExecute(self):
        pass
