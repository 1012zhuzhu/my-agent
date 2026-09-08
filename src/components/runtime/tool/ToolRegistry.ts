import type { Tool, ToolDefintion } from "./Tool";


export class ToolRegistry {
    private tools = new Map<string,Tool>();
    register(tool: Tool){
        this.tools.set(
            tool.name,
            tool
        )
    }
    
    getDefinitions(
        names?: string[]
    ): ToolDefintion[] {
    const tools = names
        ? names
            .map(name => this.tools.get(name))
            .filter(
                (tool): tool is Tool => Boolean(tool)
            )
        : Array.from(this.tools.values())
        return tools.map(tool=>({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }));
    }

    get(name: string){
        return this.tools.get(name)
    }
}