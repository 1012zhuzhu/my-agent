import type { Message } from "../context/Message.js";
import type { ToolDefinition } from "../tool/Tool.js";
import type { ModelResponse } from "./ModelResponse.js";

export interface Model {
  invoke(
    tools: ToolDefinition[],
    messages: Message[]
): Promise<ModelResponse>
}