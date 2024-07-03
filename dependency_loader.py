from .common_imports import sys, logging

class Dummy:
    def __init__(self, module_name):
        self.module_name = module_name


def get_dependency(module_name, items):
    module_items = []

    for item in items:
        failed = False
        try:
            module_items.append(getattr(sys.modules[module_name], item))
        except KeyError:
            logging.error(f"TimeUI.dependency_loader KeyError: Couldn't find module {module_name} in sys")
            failed = True
        except AttributeError:
            logging.error(f"TimeUI.dependency_loader AttributeError: {item} not in {module_name}")
            failed = True

        if failed: module_items.append(Dummy(f"{module_name}.{item}"))

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
