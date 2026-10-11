import type { Message } from "../context/Message";
import type { ToolDefintion } from "../tool/Tool";

export type ModelResponse = | {
    type: 'text';
    content:string;
} | {
    type: 'tool_call';
    toolName: string;
    args: unknown;
}


export interface Model {
    invoke(prompt: Message[],tools: ToolDefintion[]): Promise<ModelResponse>
}