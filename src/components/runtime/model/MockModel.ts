import type { Message } from "../context/Message";
import type { ToolDefintion } from "../tool/Tool";
import type { Model, ModelResponse } from "./Model";

export class MockModel implements Model{
  async invoke(prompt:Message[],tools: ToolDefintion[]): Promise<ModelResponse> {
    console.log('mock收到',prompt);
    const lastMessage = prompt[prompt.length-1]
    console.log('mock收到了工具',tools);
    if (!lastMessage) {
      throw new Error("Mock model requires at least one message");
    }

    if (lastMessage.role === "user") {
       const calculator = tools.find(
        tool => tool.name === 'calculator'
       )
       if(!calculator){
        
          return {
            type:'text',
            content:'没有模组调用计算方法'
          }
        }

        return {
          type: 'tool_call',
          toolName: calculator.name,
          args: {
            expression: lastMessage.content ?? ''
          }
        }
    }
    
    if (lastMessage.role === "tool") {
        return {
          type:'text',
          content:lastMessage.content ?? ''
        }
    }
    throw new Error("你的MockModel很着急");
  }
}

