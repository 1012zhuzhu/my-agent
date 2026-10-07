import { ToolRunner } from '../../tool/ToolRunner'
import type { AgentStateType } from '../AgentState'

export function createToolNodes(
    toolRunner: ToolRunner,
    allowedTools: string[]
) {
    return async function toolNode(
        state: AgentStateType
    ) {
        const lastMessage = state.messages.at(-1)

        if (
            !lastMessage ||
            lastMessage.role !== 'assistant' ||
            !lastMessage.toolCalls ||
            lastMessage.toolCalls.length === 0
        ) {
            throw new Error(
                "toolNode requires an assistant tool call message"
            )
        }

        const toolCalls = lastMessage.toolCalls

        const messages = []

        for (const toolCall of toolCalls) {

            console.log(
                "[Agent][ToolNode] executing tool:",
                {
                    toolName: toolCall.toolName,
                    args: toolCall.args
                }
            )

            const result = await toolRunner.run(
                toolCall.toolName,
                toolCall.args,
                allowedTools
            )

            console.log(
                "[Agent][ToolNode] result:",
                result
            )

            if (result.success) {
                messages.push({
                    role: "tool" as const,
                    toolCallId: toolCall.toolCallId,
                    toolName: toolCall.toolName,
                    content: result.content,
                    success: true
                })
            } else {
                messages.push({
                    role: "tool" as const,
                    toolCallId: toolCall.toolCallId,
                    toolName: toolCall.toolName,
                    content: result.content,
                    success: false,
                    errorCode: result.errorCode
                })
            }
        }

        return {
            messages
        }
    }
}
// console.log(
        //     "[Agent][ToolNode] executing tool:",
        //     {
        //         toolName: lastMessage.toolName,
        //         args: lastMessage.args
        //     }
        // )

        // const result = await toolRunner.run(
        //     lastMessage.toolName,
        //     lastMessage.args,
        //     allowedTools
        // )
        // console.log(
        //     "[Agent][ToolNode] result:",
        //     result
        // )
        // if(result.success){
            
        //     return {
        //         messages: [
        //             {
        //                 role: "tool" as const,
        //                 toolCallId: lastMessage.toolCallId,
        //                 toolName: lastMessage.toolName,
        //                 content: result.content,
        //                 success: true
        //             }
        //         ]
        //     }
        // }
        // return {
        //     messages: [
        //         {
        //             role: "tool" as const,
        //             toolCallId: lastMessage.toolCallId,
        //             toolName: lastMessage.toolName,
        //             content: result.content,
        //             success: false,
        //             errorCode: result.errorCode
        //         }
        //     ]
        // }