import { SchemaValidator } from "./SchemaValidator";
import { ToolRegistry } from "./ToolRegistry";
export class ToolRunner {
  private readonly toolRegistry: ToolRegistry;

  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  async run(
    toolName: string,
    args: unknown,
    allowedTools?: string[],
  ): Promise<unknown> {
    if (allowedTools && !allowedTools.includes(toolName)){
        throw new Error(
            `Tool not allowed: ${toolName}`
        )
    }
    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    SchemaValidator.Validate(tool.parameters, args);
    return await tool.execute(args);
  }
}
