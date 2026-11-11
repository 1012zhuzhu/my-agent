
from app.agent.runtime import AgentRuntime
from app.agent.graph import AgentGraph
from app.agent.nodes.model_node import ModelNode
from app.agent.nodes.tool_node import ToolNode

from app.model.mock_model import MockModel

from app.schemas.message import UserMessage
from app.schemas.tooldefinition import ToolDefinition

from app.tools.setup import create_tool_registry
from app.tools.toolrunner import ToolRunner
from app.tools.validator import SchemaValidator


class LangGraphRuntime:
    def __init__(self):
        # 1. 初始化工具注册表
        self.registry = create_tool_registry()

        # 2. 将内部 Tool 转换为模型可见的 ToolDefinition
        self.tools = [
            ToolDefinition(
                name=tool.name,
                description=tool.description,
                parameters=tool.parameters
            )
            for tool in self.registry.tools.values()
        ]

        # 3. 初始化工具执行器
        self.runner = ToolRunner(
            registry=self.registry,
            validator=SchemaValidator()
        )

        # 4. 初始化节点
        self.model_node = ModelNode(
            model=MockModel(),
            tools=self.tools
        )
        self.tool_node = ToolNode(self.runner)

        # 5. 组装 AgentGraph
        self.graph = AgentGraph(
            model_node=self.model_node,
            tool_node=self.tool_node
        )

    async def execute(self, request):
        # 将 Go 传入的 input 转换成 Agent 的用户消息
        user_message = UserMessage(
            content=str(request.input)
        )

        # 执行 AgentGraph
        result = await self.graph.invoke([user_message])

        # 获取最终消息
        messages = result["messages"]
        final_message = messages[-1]

        return {
            "content": final_message.content,
            "model": request.config.model
        }
