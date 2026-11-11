from app.schemas.agentconfig import (
    AgentExecuteRequest,
    AgentExecuteResponse
)
from app.agent.runtime import AgentRuntime

class AgentService:
    def __init__(self, runtime: AgentRuntime):
        self.runtime = runtime

    async def execute(
        self,
        request: AgentExecuteRequest
    ) -> AgentExecuteResponse:

        output = await self.runtime.execute(request)

        return AgentExecuteResponse(
            output=output
        )
