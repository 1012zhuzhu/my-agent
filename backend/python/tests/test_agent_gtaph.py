
import pytest

from app.agent.graph import AgentGraph
from app.agent.nodes.model_node import ModelNode
from app.agent.nodes.tool_node import ToolNode

from app.model.mock_model import MockModel
from app.model.base import TextResponse, ToolResponse

from app.schemas.message import (
    UserMessage,
    AssistantMessage,
    ToolMessage,
    ToolCall,
)
from app.schemas.tooldefinition import ToolDefinition

from app.tools.setup import create_tool_registry
from app.tools.toolrunner import ToolRunner
from app.tools.validator import SchemaValidator


class UnknownToolModel:
    """专门用于测试不存在的工具。"""

    async def invoke(self, messages, tools):
        # 收到工具执行结果后，生成最终回答
        if messages and isinstance(messages[-1], ToolMessage):
            return TextResponse(
                content="工具调用失败，已收到错误信息"
            )

        # 第一次调用模型时，请求一个不存在的工具
        return ToolResponse(
            tool_calls=[
                ToolCall(
                    tool_call_id="call_unknown",
                    tool_name="unknown_tool",
                    args={}
                )
            ]
        )


@pytest.mark.asyncio
async def test_agent_graph_tool_call_loop():
    """测试正常的 Model → Tool → Model 闭环。"""

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

    # 4. 初始化节点
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

    # 6. 执行 Agent
    result = await agent_graph.invoke([
        UserMessage(content="上海今天天气怎么样？")
    ])

    messages = result["messages"]

    # 7. 验证正常工具调用结果
    assert isinstance(messages[0], UserMessage)
    assert any(isinstance(msg, ToolMessage) for msg in messages)

    final_message = messages[-1]

    assert isinstance(final_message, AssistantMessage)
    assert final_message.content is not None
    assert "上海" in final_message.content


@pytest.mark.asyncio
async def test_agent_graph_unknown_tool():
    """测试工具不存在时，Agent 是否能正常处理错误。"""

    # 1. 初始化工具注册表
    registry = create_tool_registry()

    # 2. 构造模型可见的工具定义
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

    # 4. 使用专门制造错误的 Model
    model_node = ModelNode(
        model=UnknownToolModel(),
        tools=tools
    )

    tool_node = ToolNode(runner)

    # 5. 组装 AgentGraph
    agent_graph = AgentGraph(
        model_node=model_node,
        tool_node=tool_node
    )

    # 6. 执行 Agent
    result = await agent_graph.invoke([
        UserMessage(content="查询天气")
    ])

    messages = result["messages"]

    # 7. 找到工具执行失败产生的 ToolMessage
    error_messages = [
        msg for msg in messages
        if isinstance(msg, ToolMessage)
    ]

    assert len(error_messages) == 1

    error_message = error_messages[0]

    # 8. 验证错误信息
    assert error_message.success is False
    assert error_message.error_code == "TOOL_NOT_FOUND"
    assert "unknown_tool" in error_message.content

    # 9. 验证模型收到了错误，并生成最终回答
    final_message = messages[-1]

    assert isinstance(final_message, AssistantMessage)
    assert final_message.content == "工具调用失败，已收到错误信息"
