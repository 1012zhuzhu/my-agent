from dataclasses import dataclass
from typing import Any, Awaitable, Callable
from pydantic import BaseModel

class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: dict[str,Any]

@dataclass
class Tool:
    name: str
    description: str
    parameters: dict[str, Any]
    execute: Callable[[dict[str,Any]],Awaitable[Any]]