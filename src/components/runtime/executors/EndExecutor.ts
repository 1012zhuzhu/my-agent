import type { NodeExecutor } from "../NodeExecutor";
import type { FlowNode } from "../../../type";
import type {
  ExecutionContext,
  NodeExecutionResult,
} from "../ExecutionContext";
import { Handle } from "reactflow";

export class EndExecutor implements NodeExecutor {
  async execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const input = node.data.inputs.input ?? context.getVariable('lastOutput')
    return {
      output: input,
    };
  }
}
