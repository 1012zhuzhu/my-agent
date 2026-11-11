from typing import Annotated, TypedDict

from app.schemas.message import Message


def merge_messages(
    current: list[Message],
    new: list[Message]
) -> list[Message]:
    return current + new


class AgentState(TypedDict):
    messages: Annotated[list[Message], merge_messages]