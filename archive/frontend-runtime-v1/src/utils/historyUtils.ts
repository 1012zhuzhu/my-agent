import type { Message, ToolMessage } from "../components/runtime/context/Message";


export function getLastToolMessage(
    history: Message[],
    toolName: string,
): ToolMessage|undefined {
    return history.findLast(
        (message): message is ToolMessage => 
            isToolMessage(message) && message.toolName === toolName
    )
}
export function isToolMessage(
  message: Message,
): message is ToolMessage {
  return message.role === 'tool'
}
