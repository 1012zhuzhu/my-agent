import { SchemaValidator } from './SchemaValidator';
import { ToolRegistry } from './ToolRegistry';
export class ToolRunner {
    constructor(
        private toolRegistry: ToolRegistry
    ) {}

    async run(
        toolName: string,
        args: unknown
    ): Promise<unknown> {
        const tool = this.toolRegistry.get(toolName)
        console.log(
            "ToolRunner收到的args:",
            args,
            typeof args
        );
        if(!tool){
            throw new Error(`Tool not found: ${toolName}`)
        }


        SchemaValidator.Validate(tool.parameters ,args)
        return await tool.execute(args)
    }
}