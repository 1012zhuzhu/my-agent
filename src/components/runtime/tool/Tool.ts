export interface Tool {
    name: string;
    description: string;
    parameters: Schema;
    execute(args: unknown): Promise<ToolResult>;
}
export type ToolErrorCode = 
| 'INVALID_ARGUMENT'
| 'TIMEOUT'
| 'INTERNAL_ERROR'

export interface ToolDefintion {
    name: string;
    description: string;
    parameters: Schema
}
export interface Schema {
    type:'object';
    properties:{
        [key: string] : {
            type: string;
            description?: string
        }
    }

    required?: string[];
}
export interface ToolResult {
    content: string
    data?: unknown
    success: boolean
    error?: string
    errorCode?: ToolErrorCode
}