from typing import Literal, Union,Protocol
from pydantic import BaseModel

from app.schemas.message import Message, ToolCall
from app.schemas.tooldefinition import ToolDefinition


class TextResponse(BaseModel):
    type: Literal["text"] = "text"
    content: str


class ToolResponse(BaseModel):
    type: Literal["tool_calls"] = "tool_calls"
    tool_calls: list[ToolCall]


ModelResponse = Union[TextResponse, ToolResponse]

class Model(Protocol):
    def invoke(
        self,
        messages: list[Message],
        tools: list[ToolDefinition]
    ) -> ModelResponse:
        ...