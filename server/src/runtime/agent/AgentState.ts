import type { Message } from "../context/Message";
import {Annotation} from "@langchain/langgraph"
export const AgentState = Annotation.Root({
    messages: Annotation<Message[]>({
        reducer: (
            currentMessages,
            newMessages
        ) => {
            return [
                ...currentMessages,
                ...newMessages
            ]
        },

        default: () => []
    })
})

export type AgentStateType = typeof AgentState.State