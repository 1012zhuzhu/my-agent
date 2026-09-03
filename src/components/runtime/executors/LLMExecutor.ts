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

    // 记录用户输入
    context.addMessage({
      role: "user",
      content: prompts,
    });

    // 3. 获取当前 LLM 节点选择的模型
    console.log('这里是用户的prompt',node.data.inputs.prompt);

    console.log('只是测试',context.getHistory());
    
    
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

    while(step < maxStep){
      console.log('这是第一次调用模型',context.getHistory());
    // 6. 第一次调用模型
    const response = await model.invoke(
      context.getHistory()
    );
    
    

    console.log("LLM返回:", response);
    if(response.type === 'text'){
      return{
        output:response.content,
        nextHandle:'output'
      }
    }

    if (response.type === "tool_call") {

      // 7. 找到工具
      const tool = context
        .getToolRegistry()
        .get(response.toolName);

      if (!tool) {
        throw new Error(`Tool not found: ${response.toolName}`);
      }

      // 8. 记录模型的 Tool Call
      context.addMessage({
        role: "assistant",
        toolName: response.toolName,
        args: response.args,
      });

      // 9. 执行工具
      const toolResult = await tool.execute(response.args);

      console.log("toolResult:", toolResult);

      // 10. 记录工具结果
      context.addMessage({
        role: "tool",
        content: String(toolResult),
      });

    step++
      }

    }
    throw new Error("Agent execution exceeded maximum steps");
  }
    
}