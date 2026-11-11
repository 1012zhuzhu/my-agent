import pytest

from app.agent.nodes.model_node import create_model_node
from app.model.mock_model import MockModel
from app.schemas.message import UserMessage, AssistantMessage


@pytest.mark.asyncio
async def test_model_node_text_response():
    # 1. 创建模型
    model = MockModel()

    # 2. 创建 ModelNode
    node = create_model_node(model, [])

    # 3. 准备初始状态
    state = {
        "messages": [
            UserMessage(content="你好")
        ]
    }

    # 4. 执行节点
    result = await node(state)

    # 5. 检查结果
    assert len(result["messages"]) == 1
    assert isinstance(result["messages"][0], AssistantMessage)
    assert result["messages"][0].content == "hello model"