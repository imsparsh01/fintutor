class StaleBaselineWriteError(Exception):
    """A direct baseline write used an obsolete durable version."""

    def __init__(self, current: dict, proposed: dict):
        super().__init__("Baseline record changed")
        self.current = current
        self.proposed = proposed


def require_version(current: dict, expected_version: int, proposed: dict) -> None:
    if current["version"] != expected_version:
        raise StaleBaselineWriteError(current=current, proposed=proposed)
