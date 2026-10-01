import type { Tool } from "./Tool.js"
import type { ToolResult } from "./ToolResult.js"

export class ManmanTool implements Tool {
  name = "manman"

  description =
    "和曼曼相关的小助手，可以根据当前场景提供约会、表达或小惊喜建议。曼曼是用户交往三年的女朋友。"

  parameters = {
    type: "object" as const,

    properties: {
      action: {
        type: "string" as const,
        description:
          "想做的事情，例如 date、message、surprise"
      },

      context: {
        type: "string" as const,
        description:
          "当前场景或补充信息"
      }
    },

    required: ["action"]
  }

  async execute(
    args: Record<string, unknown>
  ): Promise<ToolResult> {

    const action =
      typeof args.action === "string"
        ? args.action
        : ""

    const context =
      typeof args.context === "string"
        ? args.context
        : ""

    if (!action) {
      return {
        success: false,
        content: "action 不能为空",
        errorCode: "INVALID_ARGUMENT"
      }
    }

    if (action === "date") {
      return {
        success: true,

        content:
          `给曼曼的约会建议：不要把三天两夜排得太满。` +
          `可以留一段完全没有安排的时间，两个人一起吃点东西、散步、看电影或者随便聊天。` +
          (context
            ? ` 当前场景：${context}`
            : ""),

        data: {
          action,
          suggestion:
            "留一段没有明确计划的二人时间"
        }
      }
    }

    if (action === "message") {
      return {
        success: true,

        content:
          "可以直接和曼曼说：谈了三年了，但每次快见到你的时候，我居然还是会有点紧张。",

        data: {
          action
        }
      }
    }

    if (action === "surprise") {
      return {
        success: true,

        content:
          "小惊喜不需要很贵。可以买她平时喜欢吃的东西，或者在她没注意的时候准备一个很小的礼物，重点是让她知道你记得她喜欢什么。",

        data: {
          action
        }
      }
    }

    return {
      success: false,
      content:
        `暂不支持 action: ${action}`,
      errorCode: "INVALID_ARGUMENT"
    }
  }
}