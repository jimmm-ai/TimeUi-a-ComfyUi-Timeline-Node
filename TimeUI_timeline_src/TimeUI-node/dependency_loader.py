import sys
import logging


class Dummy:
    def __init__(self, module_name):
        self.module_name = module_name


def get_dependency(module_name, items):
    module_items = []
    if module_name in sys.modules:
        module = sys.modules[module_name]
        for item in items:
            if hasattr(module, item):
                module_items.append(getattr(module, item))
            else: module_items.append(Dummy(f"{module.__name__}.{item}"))

    return module_items


def load_dependencies(dependency_dict: dict={}, location: str=None):
    import_success = True
    dependencies = []
    for key, items in dependency_dict.items():
        dependencies.extend(get_dependency(key, items))

    for item in dependencies:
        if type(item) == Dummy:
            import_success = False
            file_path = "TimeUI-node/dependency_loader.load_dependencies(...)"
            logging.error(f"{file_path}{f'at {location}' if location is not None else ''}: could not find required dependency \"{item.module_name}\", please see list of required nodes to install requirements and try again")

    return tuple(dependencies) if import_success else None
