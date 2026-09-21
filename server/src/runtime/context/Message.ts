import type { ToolErrorCode } from "../tool/ToolResult.js"

export type ToolMessage = {
    role: 'tool'
    // DeepSeek 用这个 ID 判断：当前结果是在回答哪一次工具调用。
    toolCallId: string
    toolName: string
    content: string
    success: boolean
    errorCode?: ToolErrorCode
}

export type Message = 
| {
    role: 'user'
    content: string
  }
| {
    role: 'assistant'
    content?: string
    // assistant 发起工具调用时，三项数据会一起保存到历史记录。
    toolCallId?: string
    toolName?: string
    args?: unknown
}
| ToolMessage

export type History = Message[]
