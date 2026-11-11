from app.schemas.message import ToolCall
from app.tools.registry import ToolRegistry
from app.tools.validator import SchemaValidator


class ToolRunner:
    def __init__(
        self,
        registry: ToolRegistry,
        validator: SchemaValidator
    ):
        self.registry = registry
        self.validator = validator

    async def execute(self, tool_call: ToolCall):
        # 1. 查找工具
        try:
            tool = self.registry.get(tool_call.tool_name)
        except ValueError:
            return {
                "success": False,
                "result": None,
                "error": {
                    "code": "TOOL_NOT_FOUND",
                    "message": f"Tool not found: {tool_call.tool_name}"
                }
            }

        # 2. 校验工具参数
        args = tool_call.args

        validator_result = self.validator.validate(
            tool.parameters,
            args
        )

        if not validator_result["success"]:
            return {
                "success": False,
                "result": None,
                "error": {
                    "code": "INVALID_ARGUMENT",
                    "message": validator_result["error"]
                }
            }

        # 3. 执行工具
        try:
            result = await tool.execute(args)

            return {
                "success": True,
                "result": result,
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "result": None,
                "error": {
                    "code": "TOOL_EXECUTION_ERROR",
                    "message": str(e)
                }
            }