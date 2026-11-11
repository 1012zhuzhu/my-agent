from app.schemas.tooldefinition import Tool


class ToolRegistry:
    def __init__(self):
        self.tools: dict[str, Tool] = {}


    def register(self, tool: Tool):
        if tool.name in self.tools:
            raise ValueError(f"Tool already registered: {tool.name}")

        self.tools[tool.name] = tool
  
    def get(self, name: str) -> Tool:
        tool = self.tools.get(name)

        if tool is None:
            raise ValueError(f"Tool not found : {name}")

        return tool