import pytest

from app.agent.graph import AgentGraph
from app.agent.nodes.model_node import ModelNode
from app.agent.nodes.tool_node import ToolNode
from app.model.mock_model import MockModel
from app.agent.state import AgentState
from app.schemas.message import (
    UserMessage,
    AssistantMessage,
    ToolMessage,
)
from app.schemas.tooldefinition import ToolDefinition
from app.tools.setup import create_tool_registry
from app.tools.toolrunner import ToolRunner
from app.tools.validator import SchemaValidator


@pytest.mark.asyncio
async def test_agent_graph_tool_call_loop():

    # 1. 初始化工具注册表
    registry = create_tool_registry()

    # 2. 将内部 Tool 转换为模型可见的 ToolDefinition
    tools = [
        ToolDefinition(
            name=tool.name,
            description=tool.description,
            parameters=tool.parameters
        )
        for tool in registry.tools.values()
    ]

    # 3. 初始化 ToolRunner
    runner = ToolRunner(
        registry=registry,
        validator=SchemaValidator()
    )

    # 4. 初始化两个节点
    model_node = ModelNode(
        model=MockModel(),
        tools=tools
    )

    tool_node = ToolNode(runner)

    # 5. 组装 AgentGraph
    agent_graph = AgentGraph(
        model_node=model_node,
        tool_node=tool_node
    )

    # 6. 输入用户消息并执行
    result = await agent_graph.invoke([
        UserMessage(content="上海今天天气怎么样？")
    ])

    # 7. 验证最终结果
    messages = result["messages"]

    assert isinstance(messages[0], UserMessage)
    assert any(isinstance(msg, ToolMessage) for msg in messages)

    final_message = messages[-1]

    assert isinstance(final_message, AssistantMessage)
    assert final_message.content is not None
    assert "上海" in final_message.content