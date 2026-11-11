from app.agent.state import AgentState
from app.schemas.message import (
    AssistantMessage,
    ToolMessage,
)
from app.tools.toolrunner import ToolRunner


class ToolNode:
    def __init__(self, runner: ToolRunner):
        self.runner = runner

    async def execute(self, state: AgentState):
        messages = state["messages"]

        if not messages:
            raise ValueError("AgentState messages is empty")

        last_message = messages[-1]

        if not isinstance(last_message, AssistantMessage):
            raise ValueError("Last message must be an AssistantMessage")

        if not last_message.tool_calls:
            raise ValueError("AssistantMessage has no tool calls")

        tool_messages = []

        for tool_call in last_message.tool_calls:
            result = await self.runner.execute(tool_call)

            tool_message = ToolMessage(
                tool_call_id=tool_call.tool_call_id,
                tool_name=tool_call.tool_name,
                content=(
                    str(result["result"])
                    if result["success"]
                    else result["error"]["message"]
                ),
                success=result["success"],
                error_code=(
                    None
                    if result["success"]
                    else result["error"]["code"]
                )
            )

            tool_messages.append(tool_message)

        return {"messages": tool_messages}