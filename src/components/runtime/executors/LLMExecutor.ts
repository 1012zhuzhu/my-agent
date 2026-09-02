import type { NodeExecutor } from "../NodeExecutor";
import type { FlowNode } from "../../../type";
import type {
  ExecutionContext,
  NodeExecutionResult,
} from "../context/ExecutionContext";
import { ModelFactory } from "../model/ModelFactory";
import type { ModelConfig } from "../model/ModelCofig";

export class LLMExecutor implements NodeExecutor {
  async execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {

    // 1. 获取上游节点传过来的输入
    const input = context.getNodeInPuts(node.id);

    // 2. 把上游输入组成 Prompt
    const prompts = input
      .map((n) => n.output)
      .join("\n");

    // 3. 获取当前 LLM 节点选择的模型
    const modelName = node.data.inputs.model;

    if (typeof modelName !== "string" || !modelName) {
      throw new Error("LLM node must have a model");
    }

    // 4. 创建模型配置
    const config: ModelConfig = {
      provider:'mock',
      model: modelName,
    };//这里之后需要研究

    // 5. 根据配置创建模型
    const model = ModelFactory.create(config);

    // 6. 调用模型
    const response = await model.invoke(prompts);

    console.log("LLM返回:", response);

    // 7. 保存执行结果
    context.setVariable("lastOutput", response);

    const registry = context.getToolRegistry();

    const calculator = registry.get("calculator");

    console.log("找到的工具:", calculator);

    return {
      output: response,
      nextHandle: "output",
    };
  }
}