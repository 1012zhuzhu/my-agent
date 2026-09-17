export type ToolErrorCode =
| 'INVALID_ARGUMENT'
| 'TIMEOUT'
| 'INTERNAL_ERROR'
| "TOOL_NOT_ALLOWED"
| "TOOL_NOT_FOUND"

export type ToolResult = 
| ToolSuccessResult
| ToolFailureResult

export interface ToolSuccessResult {
    success: true
    content: string
    data?: unknown
}

export interface ToolFailureResult {
    success: false
    content: string
    errorCode: ToolErrorCode
}
