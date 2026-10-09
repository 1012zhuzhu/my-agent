import type { Message } from "../context/Message";
import type { ToolDefinition } from "../tool/Tool";
import type { Model } from "./model";
import type { ModelResponse } from "./ModelResponse";
import { type ToolCall } from './ModelResponse';
type DeepSeekToolCall = {
  id: string;
  type: 'function';
  function:{
    name: string,
    arguments: string
  }
}

type DeepSeekMessage = 
|{
  role: 'user';
  content: string;
}
|{
  role: 'tool';
  tool_call_id: string;
  content: string;
}
|{role: 'assistant'; content: string}
|{
  role: 'assistant';
  content: string | null;
  tool_calls: DeepSeekToolCall[];
}


export class DeepSeekModel implements Model{
  private readonly apiKey: string | undefined;
  private readonly modelName: string;

  constructor(apiKey: string | undefined, modelName: string){
    this.apiKey = apiKey
    this.modelName = modelName
  }
  async invoke(messages: Message[], tools: ToolDefinition[]): Promise<ModelResponse> {
    if(!this.apiKey){
      throw new Error("缺少DEEPSEEK_API_KEY");
    }
    
    if(messages.length === 0){
      throw new Error("这里需要用户的对话需求")
    }
    const deepSeekMessages = this.toDeepSeekMessage(messages);

    const deepSeekTools = tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }))
    const httpResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: deepSeekMessages,
        tools: deepSeekTools.length > 0 ? deepSeekTools: undefined,
        stream:false,
        thinking: {type: 'disabled'}
      })
    })
    if (!httpResponse.ok) {
      throw new Error(`DeepSeek 请求失败，状态码：${httpResponse.status}`);
    }

    const data: unknown = await httpResponse.json(); 

    if(
      typeof data !== 'object' || data === null || !('choices' in data) || !Array.isArray(data.choices)
    ) {
      throw new Error("DeepSeek 返回格式错误：缺少 choices");
    }

    const firstChoice: unknown = data.choices[0];

    if(typeof firstChoice !== 'object' || firstChoice === null || !("message" in firstChoice)){
      throw new Error('DeepSeek 返回格式错误缺少message')
    }

    const reply: unknown = firstChoice.message;

    if(typeof reply !== 'object' || reply === null || Array.isArray(reply)) {
      throw new Error('DeepSeek 返回格式错误: message不是对象')
    }

    if (
      "tool_calls" in reply &&
      Array.isArray(reply.tool_calls) &&
      reply.tool_calls.length > 0
    ) {

    console.log(
      "[DeepSeek] tool_calls:",
      JSON.stringify(reply.tool_calls, null, 2)
    )


      const toolCalls = reply.tool_calls 
      
      const parsedToolCalls : ToolCall[] = toolCalls.map((call) =>
      {
        if(
          typeof call !== "object" || call === null || Array.isArray(call) || !("id" in call) || typeof call.id !== "string"
        ){
          throw new Error("DeepSeek 工具调用缺少有效的 id")
        }
        if(
          typeof call.function !== "object" || call.function === null || Array.isArray(call.function) || typeof call.function.name !== "string" || typeof call.function.arguments !== "string"
        ){
          throw new Error("DeepSeek 工具调用缺少有效的 function");
        }

        let args : unknown

        try{
          args = JSON.parse(call.function.arguments) 
        }catch{
          throw new Error('DeepSeek返回的工具参数不合法')
        }

        return {
          toolCallId: call.id,
          toolName: call.function.name,
          args
        }
      })

      return {
        type: 'tool_calls',
        toolCalls: parsedToolCalls
      }

      // if (
      //   typeof toolCalls !== "object" ||
      //   toolCalls === null ||
      //   Array.isArray(toolCalls) ||
      //   !("id" in toolCalls) ||
      //   typeof toolCalls !== "string"
      // ) {
      //   throw new Error("DeepSeek 工具调用缺少有效的 id");
      // }
      // if (
      //   typeof call.function !== "object" ||
      //   call.function === null ||
      //   Array.isArray(call.function) ||
      //   typeof call.function.name !== "string" ||
      //   typeof call.function.arguments !== "string"
      // ) {
      //   throw new Error("DeepSeek 工具调用缺少有效的 function");
      // }
      // let args: unknown;
      // try{
      //   args = JSON.parse(call.function.arguments) 
      // }catch{
      //   throw new Error('DeepSeek返回的工具参数不合法')
      // }
      // return {
      //   type: 'tool_calls',
      //   toolCalls: 
      // }
    }


    if("content" in reply && typeof reply.content === 'string'){
      return {
        type:  'text',
        content: reply.content
      }
    }
    
    throw new Error("DeepSeek 返回格式错误：没有文字或工具调用");
  }
  private toDeepSeekMessage(
    messages: Message[]
): DeepSeekMessage[] {

    return messages.map((message) => {

        if (message.role === 'user') {
            return {
                role: 'user',
                content: message.content
            }
        }

        if (message.role === 'tool') {
            return {
                role: 'tool',
                tool_call_id: message.toolCallId,
                content: message.content
            }
        }

        if (message.role === 'assistant') {

            if (
                message.toolCalls &&
                message.toolCalls.length > 0
            ) {
                return {
                    role: 'assistant',
                    content: null,
                    tool_calls: message.toolCalls.map(
                        (toolCall) => ({
                            id: toolCall.toolCallId,
                            type: 'function' as const,
                            function: {
                                name: toolCall.toolName,
                                arguments: JSON.stringify(
                                    toolCall.args ?? {}
                                )
                            }
                        })
                    )
                }
            }

            if (typeof message.content !== 'string') {
                throw new Error(
                    "assistant 文字消息缺少 content"
                )
            }

            return {
                role: 'assistant',
                content: message.content
            }
        }

        throw new Error('对于将message转换deepseekmessage这里有问题哦')
    })
}
}