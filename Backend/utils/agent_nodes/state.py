# utils/agent_nodes/state.py

_state = {}

def set_state(key: str, value, overwrite: bool = False):
    """
    Save raw data into the global state.
    - overwrite=False prevents accidental overwrites of existing keys.
    """
    if key in _state and not overwrite:
        raise KeyError(f"State key '{key}' already exists. Use overwrite=True to replace it.")
    _state[key] = value

def get_state(key: str, default=None):
    """
    Retrieve a value from the global state.
    Returns default if key is missing.
    """
    return _state.get(key, default)

def clear_state():
    """
    Reset the entire state dictionary.
    """
    _state.clear()

def update_state(key: str, value):
    """
    Safely update an existing key.
    Raises error if key does not exist.
    """
    if key not in _state:
        raise KeyError(f"Cannot update non-existing key '{key}'.")
    _state[key] = value