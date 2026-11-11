from typing import Annotated, Literal,Union
from pydantic import BaseModel, Field

class ToolCall(BaseModel):
    tool_call_id: str
    tool_name: str
    args: dict

class UserMessage(BaseModel):
    role: Literal["user"] = "user"
    content: str

class AssistantMessage(BaseModel):
    role: Literal["assistant"] = "assistant"
    content: str | None = None
    tool_calls: list["ToolCall"] | None = None

class ToolMessage(BaseModel):
    role: Literal["tool"] = "tool"
    tool_call_id: str
    tool_name: str
    content: str
    success: bool

Message = Annotated[
    Union[UserMessage, AssistantMessage, ToolMessage],
    Field(discriminator="role")
]