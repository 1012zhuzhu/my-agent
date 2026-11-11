from langgraph.graph import StateGraph, START, END

from app.agent.state import AgentState
from app.agent.nodes.model_node import ModelNode
from app.agent.nodes.tool_node import ToolNode
from app.schemas.message import AssistantMessage


class AgentGraph:
    def __init__(
        self,
        model_node: ModelNode,
        tool_node: ToolNode
    ):
        self.graph = StateGraph(AgentState)

        # 注册节点
        self.graph.add_node("model", model_node.execute)
        self.graph.add_node("tool", tool_node.execute)

        # 设置入口
        self.graph.add_edge(START, "model")

        # 设置模型节点的条件路由
        self.graph.add_conditional_edges(
            "model",
            self.route_after_model,
            {
                "tool": "tool",
                "end": END
            }
        )

        # 工具执行完后重新调用模型
        self.graph.add_edge("tool", "model")

        # 编译图
        self.app = self.graph.compile()

    @staticmethod
    def route_after_model(state: AgentState):
        messages = state["messages"]

        if not messages:
            raise ValueError("AgentState messages is empty")

        last_message = messages[-1]

        if not isinstance(last_message, AssistantMessage):
            raise ValueError("Last message must be an AssistantMessage")

        if last_message.tool_calls:
            return "tool"

        return "end"

    async def invoke(self, messages):
        return await self.app.ainvoke({
            "messages": messages
        })