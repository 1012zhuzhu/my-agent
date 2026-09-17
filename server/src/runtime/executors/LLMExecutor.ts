import type { ExecutionContext } from "../context/ExecutionContext";
import type { Model } from "../model/model";
import type { NodeExecutor } from "../NodeExecutor";
import type { NodeExecutionResult } from "../types/Execution";
import type { RuntimeNode } from "../types/Workflow";

export class LLMExecutor implements NodeExecutor{
    constructor(
        private readonly model: Model
    ){}
    async execute(node: RuntimeNode,
       context: ExecutionContext
      ): Promise<NodeExecutionResult> {
        const response = await this.model.invoke(
          context.getHistory(),
          []
      )

    if (response.type === "text") {
      context.addMessage({
        role: "assistant",
        content: response.content
      })

      return {
        output: response.content
      }
    }

    throw new Error(
      `Unsupported model response type: ${response.type}`
    )
    }
}