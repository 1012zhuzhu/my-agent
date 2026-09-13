import { SchemaValidator } from "./SchemaValidator";
import type { ToolResult } from "./Tool";
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
  ): Promise<ToolResult> {
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
//边界层负责判断调用是否合法，业务层负责判断执行是否成功。
}
//不 throw 给 Agent”不等于“隐藏系统错误”。错误可以对 Agent 降级处理，同时对开发者完整记录。