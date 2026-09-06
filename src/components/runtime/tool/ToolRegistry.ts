import type { Tool, ToolDefintion } from "./Tool";


export class ToolRegistry {
    private tools = new Map<string,Tool>();
    register(tool: Tool){
        this.tools.set(
            tool.name,
            tool
        )
    }
    
    getDefinitions(): ToolDefintion[] {
    return Array.from(this.tools.values())
    .map(tool=>({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
    }));
    }

    get(name: string){
        return this.tools.get(name)
    }
}