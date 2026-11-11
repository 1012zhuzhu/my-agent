from fastapi import APIRouter

from app.schemas.agentconfig import (
    AgentExecuteRequest,
    AgentExecuteResponse,
)
from app.service.agent_service import AgentService
from app.agent.runtime_impl import LangGraphRuntime

router = APIRouter()

runtime = LangGraphRuntime()
agent_service = AgentService(runtime=runtime)


@router.post("/internal/v1/agent/execute")
async def execute(
    request: AgentExecuteRequest
) -> AgentExecuteResponse:
    return await agent_service.execute(request)