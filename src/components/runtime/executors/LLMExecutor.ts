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
    
    const input = context.getNodeInPuts(node.id)
    console.log("LLM获得的输入:", input)
    const prompt = input.map(n => n.output).join("\n")
    console.log("LLM最终收到的Prompt:", prompt)//之后要修复得到的类型
    const output = {
      response: `[Mock LLM]${prompt}`,
    };
    context.setVariable(
      'lastOutput',
      output
    )
    
    return {
      output:`此处调用了LLM+start${prompt}`,
      nextHandle: "output",
    };
  }
}
