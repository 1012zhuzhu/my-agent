import type { Message } from "../context/Message";
import type { Model, ModelResponse } from "./Model";

export class MockModel implements Model{
  async invoke(prompt:Message[]): Promise<ModelResponse> {
    console.log('mock收到',prompt);
    const lastMessage = prompt[prompt.length-1]

    if (lastMessage.role === "user") {
        return {
          type: "tool_call",
          toolName: "calculator",
          args: lastMessage.content
        }
    }

    if (lastMessage.role === "tool") {
        return {
          type:'text',
          content:lastMessage.content
        }
    }
    throw new Error("你的MockModel很着急");
  }
}

