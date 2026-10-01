import type { AgentStateType } from "./AgentState";

export function routeModelResult(
    state: AgentStateType
): "tool" | "end" {
    const lastMessage = state.messages.at(-1)

    if(
        lastMessage?.role === "assistant" &&
        lastMessage.toolCallId && lastMessage.toolName
    ) {
        return "tool"
    }

    return "end"
}