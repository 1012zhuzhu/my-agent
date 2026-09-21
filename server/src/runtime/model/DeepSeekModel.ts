import type { Message } from "../context/Message.js"
import type { ToolDefinition } from "../tool/Tool.js"
import type { Model } from "./model.js"
import type { ModelResponse } from "./ModelResponse.js"

export type DeepSeekModelName =
  | "deepseek-flash"
  | "deepseek-v4-pro"

type DeepSeekMessage =
  | {
      role: "user"
      content: string
    }
  | {
      role: "assistant"
      content: string | null
      tool_calls?: {
        id: string
        type: "function"
        function: {
          name: string
          arguments: string
        }
      }[]
    }
  | {
      role: "tool"
      tool_call_id: string
      content: string
    }

type DeepSeekToolCall = {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

type DeepSeekResponse = {
  choices: {
    message: {
      content: string | null
      tool_calls?: DeepSeekToolCall[]
    }
  }[]
}

export class DeepSeekModel implements Model {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly modelName: DeepSeekModelName =
      "deepseek-flash"
  ) {}

  async invoke(
    messages: Message[],
    tools: ToolDefinition[]
  ): Promise<ModelResponse> {
    // 不在服务启动时强制要求 Key，这样没有 Key 时仍然可以使用 MockModel。
    // 只有画布真正选择 DeepSeek 节点时，才抛出清晰的配置错误。
    if (!this.apiKey) {
      throw new Error(
        "DEEPSEEK_API_KEY is not configured. Add it to server/.env and restart the server."
      )
    }

    if (messages.length === 0) {
      throw new Error(
        "DeepSeek requires at least one message"
      )
    }

    const deepSeekMessages =
      this.toDeepSeekMessages(messages)

    const deepSeekTools = tools.map(tool => ({
      type: "function" as const,

      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }))

    const response = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },

        body: JSON.stringify({
          model: this.modelName,

          messages: deepSeekMessages,

          thinking: {
            type: "disabled"
          },

          ...(deepSeekTools.length > 0
            ? {
                tools: deepSeekTools,
                tool_choice: "auto"
              }
            : {}),

          stream: false
        })
      }
    )

    const raw = await response.text()

    if (!response.ok) {
      throw new Error(
        `DeepSeek request failed: ${response.status} ${raw}`
      )
    }

    let data: DeepSeekResponse

    try {
      data = JSON.parse(raw) as DeepSeekResponse
    } catch {
      throw new Error(
        "DeepSeek returned an invalid JSON response"
      )
    }

    const message =
      data.choices[0]?.message

    if (!message) {
      throw new Error(
        "DeepSeek returned no message"
      )
    }

    const toolCall =
      message.tool_calls?.[0]

    if (toolCall) {
      // 当前执行器一次处理一个工具调用。模型可以在下一轮继续请求其他工具。
      let args: unknown

      try {
        args = JSON.parse(
          toolCall.function.arguments
        )
      } catch {
        // 模型参数不是合法 JSON 时不直接执行；后面的 SchemaValidator 会拒绝它。
        args = toolCall.function.arguments
      }

      return {
        type: "tool_call",
        toolCallId: toolCall.id,
        toolName: toolCall.function.name,
        args
      }
    }

    if (message.content === null) {
      throw new Error(
        "DeepSeek returned neither text nor a tool call"
      )
    }

    return {
      type: "text",
      content: message.content
    }
  }

  private toDeepSeekMessages(
    messages: Message[]
  ): DeepSeekMessage[] {
    return messages.map(message => {
      if (message.role === "user") {
        return {
          role: "user",
          content: message.content
        }
      }

      if (message.role === "assistant") {
        if (
          message.toolCallId &&
          message.toolName
        ) {
          return {
            role: "assistant",
            content: null,

            tool_calls: [
              {
                id: message.toolCallId,
                type: "function",

                function: {
                  name: message.toolName,

                  arguments:
                    JSON.stringify(
                      message.args ?? {}
                    )
                }
              }
            ]
          }
        }

        return {
          role: "assistant",
          content: message.content ?? ""
        }
      }

      return {
        role: "tool",
        // DeepSeek 的字段名是 snake_case，这里是内部类型到外部 API 的边界转换。
        tool_call_id: message.toolCallId,
        content: message.content
      }
    })
  }
}
