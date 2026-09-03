import type { Message } from "../context/Message";

export type ModelResponse = | {
    type: 'text';
    content:string;
} | {
    type: 'tool_call';
    toolName: string;
    args: unknown;
}


export interface Model {
    invoke(prompt: Message[]): Promise<ModelResponse>
}