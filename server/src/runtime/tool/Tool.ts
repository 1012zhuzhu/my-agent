import type { ObjectSchema} from "./Schema.js"
import type { ToolResult } from "./ToolResult.js"


export interface Tool {
    name: string
    description: string
    parameters: ObjectSchema

    execute(
        args: Record<string,unknown>
    ): Promise<ToolResult>
}

export type ToolDefinition = Pick<Tool,'name'|'description'| 'parameters'>