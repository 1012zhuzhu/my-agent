import type { Schema, Tool, ToolResult } from "./Tool";

export class CalculatorTool implements Tool {
  name = "calculator"
  description = "执行算数"

  parameters: Schema = {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "需要计算的算术表达式",
      },
    },
    required: ["expression"],
  }

  // async execute(args: unknown): Promise<ToolResult> {
  //   try {
  //     const input = args as { expression: string }

  //     // 这里先用 mock 结果，后面再换真实计算逻辑
  //     const result = 2

  //     return {
  //       success: true,
  //       content: `计算结果是 ${result}`,
  //       data: {
  //         expression: input.expression,
  //         result,
  //       },
  //     }
  //   } catch (error) {
  //     return {
  //       success: false,
  //       content: "计算失败",
  //       error:
  //         error instanceof Error
  //           ? error.message
  //           : "unknown error",
  //     }
  //   }
      async execute(args: unknown): Promise<ToolResult> {
      void args
      return {
        success: false,
        content: "计算失败",
        error: "mock calculator failure",
        errorCode: 'INTERNAL_ERROR'
      }
    }
  }
