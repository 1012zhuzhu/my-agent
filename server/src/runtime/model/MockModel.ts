import type { Message } from "../context/Message";
import type { ToolDefinition } from "../tool/Tool";
import type { Model } from "./model";
import type { ModelResponse } from "./ModelResponse";

export class MockModel implements Model {
    constructor(
        private readonly mockCity = "上海"
    ) {}

    async invoke(
        messages: Message[],
        tools: ToolDefinition[]
    ): Promise<ModelResponse> {
        const lastMessage = messages.at(-1);

        // 工具执行完成后，模拟模型根据工具结果生成最终回复。
        if (lastMessage?.role === "tool") {
            return {
                type: "text",
                content: `工具执行结果：${lastMessage.content}`
            };
        }

        // 查找当前可用的天气工具。
        const weatherTool = tools.find(
            tool => tool.name === "weather"
        );

        // 没有天气工具时，直接返回文本，不进入工具调用流程。
        if (!weatherTool) {
            return {
                type: "text",
                content: "没有可用的 weather 工具"
            };
        }

        // 模拟模型决定调用天气工具。
        return {
            type: "tool_calls",
            toolCalls: [
                {
                    toolCallId: "mock-weather-call-1",
                    toolName: weatherTool.name,
                    args: {
                        city: this.mockCity
                    }
                }
            ]
        };
    }
}
