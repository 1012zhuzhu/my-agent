import type { Model } from "../../model/model";
import type { ToolDefinition } from "../../tool/Tool";
import type { AgentStateType } from "../AgentState";

export function createModelNode(
    model: Model,
    tools: ToolDefinition[],
) {
    return async function modelNode(
        state: AgentStateType
    ){
        console.log(
        "[Agent][ModelNode] messages:",
        state.messages.length
        )
        const response = await model.invoke(
            state.messages,
            tools
        )

        if(response.type === 'text'){
            console.log(
            "[Agent][ModelNode] final answer:",
            response.content
            )
            return {
                messages: [
                    {
                        role: 'assistant' as const,
                        content: response.content
                    }
                ]
            }
        }
        console.log(
            "[Agent][ModelNode] tool call:",
            response.toolCalls
        )

        return {
            messages: [
                {
                    role: 'assistant' as const,
                    content: '',
                    toolCalls: response.toolCalls
                }
            ]
        }
    }
}