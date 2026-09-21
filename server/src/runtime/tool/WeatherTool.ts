import type { Tool } from "./Tool.js"
import type { ToolResult } from "./ToolResult.js"

export class WeatherTool implements Tool {
  name = "weather"

  description = "查询指定城市的天气"

  parameters = {
    type: "object" as const,

    properties: {
      city: {
        type: "string" as const,
        description: "需要查询天气的城市"
      }
    },

    required: ["city"]
  }

  async execute(
    args: unknown
  ): Promise<ToolResult> {
    const { city } = args as {
      city: string
    }

    return {
      success: true,
      content: `${city}今天晴，温度20°C`,
      data: {
        city,
        weather: "晴",
        temperature: 20
      }
    }
  }
}