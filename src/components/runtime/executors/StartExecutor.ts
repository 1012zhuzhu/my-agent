import type { NodeExecutor } from "../NodeExecutor";
import type { FlowNode } from "../../../type";
import type {
  ExecutionContext,
  NodeExecutionResult,
} from "../context/ExecutionContext";

export class StartExecutor implements NodeExecutor {
  async execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const output = {
      message: "workflow start",
      varables: context.getAllVariable(),
    };

    console.log("start这里接通了");
    return {
      output: node.id,
      nextHandle: "output",
    };
  }
}
