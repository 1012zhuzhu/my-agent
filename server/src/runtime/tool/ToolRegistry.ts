import type { Tool, ToolDefinition } from './Tool.js'
//xixi9898_ yuguigou562

export class ToolRegistry {
    private readonly tools = new Map<string,Tool>()

    register(tool: Tool): void{
        this.tools.set(tool.name,tool)
    }
    get(name:string): Tool | undefined {
        return this.tools.get(name)
    }
    getDefinitions(): ToolDefinition[]{
        return Array.from(this.tools.values()).map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }))
    }
}