from typing import Any

from app.schemas.agentconfig import AgentExecuteRequest



class MockRuntime:
    def execute(self, request: AgentExecuteRequest) -> Any:
        user_input = request.input
        model = request.config.model

        return {
            "content" : f"hello world: {user_input}",
            "model" : model,
        }