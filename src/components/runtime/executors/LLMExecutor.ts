import type { NodeExecutor } from "../NodeExecutor";
import type { FlowNode } from "../../../type";
import type {
  ExecutionContext,
  NodeExecutionResult,
} from "../ExecutionContext";

export class LLMExecutor implements  NodeExecutor{
  async execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const prompt = String(node.data.inputs.prompt ?? "");
    const output = {
      response: `[Mock LLM]${prompt}`,
    };
    context.setVariable(
      'lastOutput',
      output
    )
    return {
      output,
      nextHandle: "output",
    };
  }
}
