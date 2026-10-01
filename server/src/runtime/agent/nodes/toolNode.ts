import { ToolRunner } from '../../tool/ToolRunner';
import type { AgentStateType } from '../AgentState';
export function createToolNodes(
    toolRunner: ToolRunner,
    allowedTools: string[]
){
    return async function toolNode(
        state: AgentStateType
    ){
        const lastMessage = state.messages.at(-1)

        if(
            !lastMessage ||
            lastMessage.role !== 'assistant' || 
            !lastMessage.toolCallId ||
            !lastMessage.toolName
        ){
            throw new Error(
                "toolNode requires an assistant tool call message"
            )
        }
        console.log(
            "[Agent][ToolNode] executing tool:",
            {
                toolName: lastMessage.toolName,
                args: lastMessage.args
            }
        )

        const result = await toolRunner.run(
            lastMessage.toolName,
            lastMessage.args,
            allowedTools
        )
        console.log(
            "[Agent][ToolNode] result:",
            result
        )
        if(result.success){
            
            return {
                messages: [
                    {
                        role: "tool" as const,
                        toolCallId: lastMessage.toolCallId,
                        content: result.content,
                        success: true
                    }
                ]
            }
        }
        return {
            messages: [
                {
                    role: "tool" as const,
                    toolCallId: lastMessage.toolCallId,
                    toolName: lastMessage.toolName,
                    content: result.content,
                    success: false,
                    errorCode: result.errorCode
                }
            ]
        }
    }
}