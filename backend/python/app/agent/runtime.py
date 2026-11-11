from typing import Any, Protocol

from app.schemas.agentconfig import AgentExecuteRequest


class AgentRuntime(Protocol):
    async def execute(self, request: AgentExecuteRequest) -> Any:
        ...