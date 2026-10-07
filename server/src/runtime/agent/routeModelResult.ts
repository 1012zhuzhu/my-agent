import type { AgentStateType } from "./AgentState";

export function routeModelResult(
    state: AgentStateType
): "tool" | "end" {
    const lastMessage = state.messages.at(-1)

    if(
        lastMessage?.role === "assistant" &&
        lastMessage.toolCalls && lastMessage.toolCalls?.length > 0
    ) {
        return "tool"
    }

    return "end"
}