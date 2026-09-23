import type { Message } from "../context/Message";
import type { ToolDefinition } from "../tool/Tool";
import type { Model } from "./model";
import type { ModelResponse } from "./ModelResponse";
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

      if(reply.tool_calls.length !== 1){
       throw new Error("当前仅支持一次一个工具调用");
    }

      const call = reply.tool_calls[0] as DeepSeekToolCall;
      
      if (
        typeof call !== "object" ||
        call === null ||
        Array.isArray(call) ||
        !("id" in call) ||
        typeof call.id !== "string"
      ) {
        throw new Error("DeepSeek 工具调用缺少有效的 id");
      }
      if (
        typeof call.function !== "object" ||
        call.function === null ||
        Array.isArray(call.function) ||
        typeof call.function.name !== "string" ||
        typeof call.function.arguments !== "string"
      ) {
        throw new Error("DeepSeek 工具调用缺少有效的 function");
      }
      let args: unknown;
      try{
        args = JSON.parse(call.function.arguments) 
      }catch{
        throw new Error('DeepSeek返回的工具参数不合法')
      }
      return {
        type: 'tool_call',
        toolCallId: call.id,
        toolName: call.function.name,
        args,
      }
    }


    if("content" in reply && typeof reply.content === 'string'){
      return {
        type:  'text',
        content: reply.content
      }
    }
    
    throw new Error("DeepSeek 返回格式错误：没有文字或工具调用");
  }
  private toDeepSeekMessage(message: Message[]): DeepSeekMessage[]{
    return message.map((message) => {
      if(message.role === 'user'){
        return{
          role:'user',
          content: message.content
        }  
      }
      
        if(message.role === 'tool'){
          return{
            role: 'tool',
            tool_call_id: message.toolCallId,
            content: message.content
          }
        }
        if(message.role === 'assistant'){
          const wantsTool = message.toolCallId !== undefined || message.toolName !== undefined;

          if(wantsTool){
            if(!message.toolCallId || !message.toolName){
               throw new Error("工具调用缺少 ID 或工具名");
            }
            return {
            role: 'assistant',
            content: null,
            tool_calls:[{
              id:message.toolCallId,
              type: 'function',
              function:{
                name:message.toolName,
                arguments: JSON.stringify(message.args?? {})
              }
            }]
          }
          }

          if(typeof message.content !== 'string'){
           throw new Error("assistant 文字消息缺少 content");
          }
          return {
            role: "assistant",
            content: message.content
          };
        }
        throw new Error('这里有问题哦')
    })
  }
}