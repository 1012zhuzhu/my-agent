import type { Message } from "../context/Message";
import type { ToolDefinition } from "../tool/Tool";
import type { Model } from "./model";
import type { ModelResponse } from "./ModelResponse";

export class MockModel implements Model {
    async invoke(tools: ToolDefinition[], messages: Message[]): Promise<ModelResponse> {
        return{
            type: 'text',
            content:'mock response'
        }
    }
}