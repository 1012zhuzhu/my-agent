import type { FlowNode } from "../../../type";
import type { NodeExecutor } from "../NodeExecutor";
import type {
  ExecutionContext,
  NodeExecutionResult,
} from "../context/ExecutionContext";

export class ConditionExecutor implements NodeExecutor {
  async execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const expression = node.data.inputs.expression;
    if (typeof expression !== "string" || !expression.trim()) {
      throw new Error("Condition node requires an expression");
    }

    const inputs = context.getNodeInPuts(node.id);
    const input = inputs[inputs.length - 1]?.output;
    const condition = this.evaluate(expression.trim(), input);

    return {
      output: input,
      nextHandle: condition ? "true" : "false",
    };
  }

  private evaluate(expression: string, input: unknown): boolean {
    if (expression === "true") {
      return true;
    }
    if (expression === "false") {
      return false;
    }
    if (expression === "$input") {
      return Boolean(input);
    }

    const comparison = expression.match(/^\$input\s*(===|!==)\s*(.+)$/);
    if (!comparison) {
      throw new Error(
        'Unsupported condition expression. Use true, false, $input, $input === <value>, or $input !== <value>.',
      );
    }

    const [, operator, rawValue] = comparison;
    let value: unknown = rawValue;
    try {
      value = JSON.parse(rawValue);
    } catch {
      // Unquoted values are compared as strings.
    }

    return operator === "===" ? input === value : input !== value;
  }
}
