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

        if(!tool){
            throw new Error(`Tool not found: ${toolName}`)
        }

        return await tool.execute(args)
    }
}