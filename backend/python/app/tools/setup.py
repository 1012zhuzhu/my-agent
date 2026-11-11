from app.tools.mock_tools import weather_tool
from app.tools.registry import ToolRegistry


def create_tool_registry():
    registry = ToolRegistry()
    registry.register(weather_tool)

    return registry