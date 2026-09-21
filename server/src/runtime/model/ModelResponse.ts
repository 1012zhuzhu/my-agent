export type ModelResponse =
| TextResponse
| ToolResponse

export interface TextResponse {
    type: 'text',
    content: string
}

export interface ToolResponse {
    type: 'tool_call',
    // 这个 ID 由真实模型生成，执行完工具后必须原样传回模型。
    toolCallId: string,
    toolName: string,
    args: unknown,
}
