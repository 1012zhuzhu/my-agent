import type { NodeExecutor } from "../NodeExecutor";
import type { FlowNode } from "../../../type";
import type {
  ExecutionContext,
  NodeExecutionResult,
} from "../context/ExecutionContext";

export class EndExecutor implements NodeExecutor {
  async execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const inputs = context.getNodeInPuts(node.id);
    const input =
      node.data.inputs.input ?? inputs[inputs.length - 1]?.output;

    return {
      output: input,
    };
  }
}
