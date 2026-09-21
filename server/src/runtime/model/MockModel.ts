import type { Message } from "../context/Message";
import type { ToolDefinition } from "../tool/Tool";
import type { Model } from "./model";
import type { ModelResponse } from "./ModelResponse";

export class MockModel implements Model {
    async invoke(
        message:Message[],
        tools:ToolDefinition[]
    ): Promise<ModelResponse> {
        const lastMessage = message.at(-1)

        if(lastMessage?.role === 'tool'){
            return{
                type: 'text',
                content: `工具执行结果:${lastMessage?.content}`
            }
        }

        const weather = tools.find(tool => tool.name === 'weather')

        if(!weather){
            return {
                type: 'text',
                content: '没有可用的 weather 工具'
            }
        }

        return{
            type: 'tool_call',
            toolCallId: 'mock-weather-call',
            toolName: weather.name,
            args:{
                city: '上海'
            }
        }
    }
}
