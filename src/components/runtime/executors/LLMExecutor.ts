import type { NodeExecutor } from "../NodeExecutor";
import type { FlowNode } from "../../../type";
import type {
  ExecutionContext,
  NodeExecutionResult,
} from "../context/ExecutionContext";
import { ModelFactory } from "../model/ModelFactory";
import type { ModelConfig } from "../model/ModelCofig";
import { ToolRunner } from '../tool/ToolRunner';

export class LLMExecutor implements NodeExecutor {
  async execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {

    // 1. 获取上游节点传过来的输入
    const inputs = context.getNodeInPuts(node.id);

    // 2. 把上游输入组成 Prompt
    const upstreamPrompt = inputs
      .map((n) =>
        typeof n.output === "string" ? n.output : JSON.stringify(n.output),
      )
      .join("\n");
    const configuredPrompt = node.data.inputs.prompt;
    const prompts = [
      typeof configuredPrompt === "string" ? configuredPrompt.trim() : "",
      upstreamPrompt,
    ]
      .filter(Boolean)
      .join("\n");

    if (!prompts) {
      throw new Error("LLM node requires a prompt or an upstream input");
    }

    // 记录用户输入
    context.addMessage({
      role: "user",
      content: prompts,
    });

    // 3. 获取当前 LLM 节点选择的模型
    const modelName = node.data.inputs.model;

    if (typeof modelName !== "string" || !modelName) {
      throw new Error("LLM node must have a model");
    }

    // 4. 创建模型配置
    const config: ModelConfig = {
      provider: "mock",
      model: modelName,
    };

    // 5. 创建模型
    const model = ModelFactory.create(config);
    let step = 0
    const maxStep = 50
    const toolRunner = new ToolRunner(
        context.getToolRegistry()
      )

    while(step < maxStep){
      const tools = context
        .getToolRegistry()
        .getDefinitions()
      // 6. 调用模型
      const response = await model.invoke(
        context.getHistory(),
        tools
      );
    if(response.type === 'text'){
      return{
        output:response.content,
        nextHandle:'output'
      }
    }

    if (response.type === "tool_call") {

      

      const toolResult = await toolRunner.run(
        response.toolName,
        response.args
      );

      context.addMessage({
        role: "assistant",
        toolName: response.toolName,
        args: response.args,
      });

      

      context.addMessage({
        role: "tool",
        content: String(toolResult),
      });

      step++;
    }
    }
    throw new Error("Agent execution exceeded maximum steps");
  }
    
}
