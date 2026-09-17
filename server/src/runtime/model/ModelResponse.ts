export type ModelResponse =
| TextResponse
| ToolResponse

export interface TextResponse {
    type: 'text',
    content: string
}

export interface ToolResponse {
    type: 'tool_call',
    toolName: string,
    args: unknown
}