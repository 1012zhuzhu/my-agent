import type { ExecutionContext } from "../context/ExecutionContext"
import type { ModelFactory } from "../model/ModelFactory"
import type { ToolRegistry } from "../tool/ToolRegistry"
import type { ToolRunner } from "../tool/ToolRunner"
import type { NodeExecutionResult } from "../types/Execution"
import type { RuntimeNode } from "../types/Workflow"
import type { NodeExecutor } from "./NodeExecutor"

export class LLMExecutor implements NodeExecutor {
  constructor(
    private readonly modelFactory: ModelFactory,
    private readonly toolRunner: ToolRunner,
    private readonly toolRegistry: ToolRegistry
  ) {}

  async execute(
    node: RuntimeNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    if (node.data.name !== "llmNode") {
      throw new Error(
        "LLMExecutor received invalid node"
      )
    }

    // 一次 LLM 节点允许进行多轮“模型 -> 工具 -> 模型”，防止工具循环无限运行。
    const maxStep = 50

    const allowedTools =
      node.data.inputs.tools ?? []

    const modelName =
      node.data.inputs.model

    // model 字段来自前端节点配置，因此同一个 Executor 可以切换 Mock 或 DeepSeek。
    const model = this.modelFactory.get(modelName)

    // 读取 Workflow 上游传给当前 LLMNode 的数据
    const inputs =
      context.getNodeInputs(node.id)

    const sourceValue =
      inputs.at(-1)?.output

    let inputText = ""

    if (typeof sourceValue === "string") {
      inputText = sourceValue
    } else if (
      sourceValue !== undefined &&
      sourceValue !== null
    ) {
      inputText = JSON.stringify(sourceValue)
    }

    const prompt = node.data.inputs.prompt ?? ""

    const userContent = [
      prompt,
      inputText
    ]
      .filter(Boolean)
      .join("\n")

    if (!userContent) {
      throw new Error(
        `LLM node "${node.id}" requires a prompt or upstream input`
      )
    }

    // 第一次调用真实模型前，历史记录必须至少包含一条用户消息。
    context.addMessage({
      role: "user",
      content: userContent
    })

    // 只把当前节点勾选的工具定义暴露给模型。
    const tools = this.toolRegistry
      .getDefinitions()
      .filter(tool =>
        allowedTools.includes(tool.name)
      )

    for (
      let step = 0;
      step < maxStep;
      step++
    ) {
      const response =
        await model.invoke(
          context.getHistory(),
          tools
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

      if (response.type === "tool_call") {
        // 先保存模型原始工具调用，随后保存同一 toolCallId 对应的执行结果。
        context.addMessage({
          role: "assistant",
          toolCallId: response.toolCallId,
          toolName: response.toolName,
          args: response.args
        })

        const result =
          await this.toolRunner.run(
            response.toolName,
            response.args,
            allowedTools
          )

        if (result.success) {
          context.addMessage({
            role: "tool",
            toolCallId:
              response.toolCallId,
            toolName:
              response.toolName,
            content:
              result.content,
            success: true
          })
        } else {
          context.addMessage({
            role: "tool",
            toolCallId:
              response.toolCallId,
            toolName:
              response.toolName,
            content:
              result.content,
            success: false,
            errorCode:
              result.errorCode
          })
        }

        continue
      }
    }

    throw new Error(
      "LLMExecutor exceeded maximum steps"
    )
  }
}
