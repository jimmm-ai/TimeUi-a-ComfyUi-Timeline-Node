from .dependency_loader import load_dependencies


node_dependencies = {  # Must include path as period '.' delimited
    "ComfyUI_IPAdapter_plus.IPAdapterPlus": ["IPAdapterAdvanced", "IPAdapterUnifiedLoader"],
    "ComfyUI-KJNodes.nodes.mask_nodes": ["CreateFadeMaskAdvanced"],
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

    def handle_timeline(self, model=None, **kwargs):
        """ Handle lack of required dependencies here because all modules have to be imported by comfyui before finding them """
        dependencies = load_dependencies(node_dependencies, location="handle_timeline")
        if dependencies is None:
            print(f"Dependencies returned none, please see console for additional information related to the 'TimeUI-node'\nkwargs={kwargs}")
            return None

        IPAdapterAdvanced, _, CreateFadeMaskAdvanced = dependencies

        return (model,)

    def IS_CHANGED(id):
        return float("NaN")
    
    def onExecute(self):
        pass
