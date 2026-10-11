import { getLastToolMessage } from "../../../utils/historyUtils";
import type { Message } from "../context/Message";
import type { ToolDefintion } from "../tool/Tool";
import type { Model, ModelResponse } from "./Model";

export class MockModel implements Model {
  async invoke(
    prompt: Message[],
    tools: ToolDefintion[]
  ): Promise<ModelResponse> {

    console.log('mock收到快照',JSON.parse(JSON.stringify(prompt)))
    console.log('mock收到了工具', tools)

    const lastMessage = prompt[prompt.length - 1]

    if (!lastMessage) {
      throw new Error("Mock model requires at least one message")
    }

    const calculator = tools.find(
      tool => tool.name === 'calculator'
    )

    const weather = tools.find(
      tool => tool.name === 'weather'
    )

    if (!calculator) {
      return {
        type: 'text',
        content: '没有 calculator 工具'
      }
    }

    if (!weather) {
      return {
        type: 'text',
        content: '没有 weather 工具'
      }
    }

    // const hasCalculator = prompt.some(
    //   message => 
    //     message.role === 'tool'&& message.toolName === 'calculator'&& message.success
    // )
    
    // const hasWeather = prompt.some(
    //   message => 
    //     message.role === 'tool'&& message.toolName === 'weather'&& message.success
    // )
    
    
    // if(!hasWeather){
    //   return {
    //     type: 'tool_call',
    //     toolName: weather.name,
    //     args: {
    //       city: '上海'
    //     }
    //   }
    // }

    const calculatorState = getLastToolMessage(prompt,'calculator')
    const weatherState = getLastToolMessage(prompt, 'weather')

    const weatherTimeCount = prompt.filter(
      message => 
        message.role === 'tool' &&
        message.toolName === 'weather' &&
        message.success === false &&
        message.errorCode === 'TIMEOUT'
    ).length

    if(!calculatorState){
      return{
        type: 'tool_call',
        toolName: calculator.name,
        args:{
          expression: '1+1'
        }
      }
    }
    if(!weatherState){
      return{
        type: 'tool_call',
        toolName: weather.name,
        args: {city: '上海'}
      }
    }

    if(
      weatherState?.success === false &&
      weatherState.errorCode === 'TIMEOUT' &&
      weatherTimeCount < 2
    ) {
      return {
        type: 'tool_call',
        toolName: weather.name,
        args:{
          city: '上海'
        }
      }
    }

    return {
      type: 'text',
      content: `
        计算：${calculatorState.success
          ? calculatorState.content
          : '计算失败'} ${calculatorState.errorCode}

        天气：${weatherState.success
          ? weatherState.content
          : '天气查询失败'} ${weatherState.errorCode}
      `
    }
  }
}

