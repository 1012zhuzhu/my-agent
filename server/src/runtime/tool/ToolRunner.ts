import { SchemaValidator } from "./SchemaValidator.js"
import type { ToolRegistry } from "./ToolRegistry.js"
import type { ToolResult } from "./ToolResult.js"



export class ToolRunner {
    constructor(
        private readonly registry: ToolRegistry
    ){}

    async run(
        toolName: string,
        args: unknown,
        allowedTools: string[]
    ): Promise<ToolResult> {
        if(!allowedTools.includes(toolName)){
            return {
                success:false,
                content: `Tool${toolName} is not allowed`,
                errorCode:'INTERNAL_ERROR'
            }
        }

        const tool = this.registry.get(toolName)

        if(!tool){
           return {
            success: false,
            content: `Tool${toolName} is not registered`,
            errorCode: 'INVALID_ARGUMENT'
           }
        }

        const validation = SchemaValidator.validate(tool.parameters, args)

        if(!validation.valid){
            return {
                success: false,
                content: validation.message,
                errorCode: 'INVALID_ARGUMENT'
            }
        }
        try {
            return await tool.execute(
            args as Record<string, unknown>
            )
        } catch (error) {
            console.error(
            `Tool "${toolName}" execution failed`,
            error
            )

        return {
        success: false,
        content: "Tool execution failed",
        errorCode: "INTERNAL_ERROR"
        }
    }
}
}