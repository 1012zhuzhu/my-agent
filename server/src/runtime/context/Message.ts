import type { ToolErrorCode } from "../tool/Tool.js"

export type ToolMessage = {
    role: 'tool'
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
    toolName?: string
    args?: unknown
}
| ToolMessage

export type History = Message[]