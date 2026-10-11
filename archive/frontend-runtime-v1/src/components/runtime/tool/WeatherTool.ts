import type { Schema, Tool, ToolResult } from "./Tool"

export class WeatherTool implements Tool {
  name = 'weather'
  description = '查询指定城市的天气'

  parameters: Schema = {
    type: 'object',

    properties: {
      city: {
        type: 'string',
        description: '需要查询天气的城市'
      }
    },

    required: ['city']
  }

//   async execute(args: unknown): Promise<ToolResult> {
//   try {
//     // 调天气 API

//     return {
//       success: true,
//       content: "上海天气晴，25℃",
//       data: {
//         city: "上海",
//         temperature: 25
//       }
//     }
//   } catch (error) {
//     return {
//       success: false,
//       content: "天气查询失败",
//       error: error instanceof Error
//         ? error.message
//         : "unknown error"
//     }
//   }
// }
  async execute(args: unknown): Promise<ToolResult> {
    void args
    return {
      success: false,
      content: '查询天气失败',
      errorCode: 'TIMEOUT'
    }
  }
}
