from typing import Any

from pydantic import BaseModel


class AgentConfig(BaseModel):
    system_prompt: str
    model: str

class AgentExecuteRequest(BaseModel):
    run_id: str
    node_id: str
    input: Any
    config: AgentConfig

class AgentExecuteResponse(BaseModel):
    output: Any