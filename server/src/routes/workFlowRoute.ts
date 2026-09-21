import { Router } from "express"

import { workflowEngine } from "../runtime/workflowEngine.js"
import { toRuntimeFlow } from "../runtime/toRuntimeFlow.js"

import { ToolRegistry } from "../runtime/tool/ToolRegistry.js"
import { WeatherTool } from "../runtime/tool/WeatherTool.js"
import { ToolRunner } from "../runtime/tool/ToolRunner.js"

import { MockModel } from "../runtime/model/MockModel.js"
import { DeepSeekModel } from "../runtime/model/DeepSeekModel.js"
import { ModelFactory } from "../runtime/model/ModelFactory.js"

import { LLMExecutor } from "../runtime/executors/LLMExecutor.js"
import type { NodeExecutor } from "../runtime/executors/NodeExecutor.js"
import { StartExecutor } from "../runtime/executors/StartExecutor.js"
import { ConditionExecutor } from "../runtime/executors/ConditionExecutor.js"
import { EndExecutor } from "../runtime/executors/EndExecutor.js"

const toolRegistry =
  new ToolRegistry()

toolRegistry.register(
  new WeatherTool()
)

const toolRunner =
  new ToolRunner(toolRegistry)

const modelFactory =
  new ModelFactory()

modelFactory.register(
  "mock",
  new MockModel()
)

const deepSeekApiKey =
  process.env.DEEPSEEK_API_KEY?.trim() ||
  undefined

// 即使本地暂时没有 Key，也注册 DeepSeek。这样 Mock 仍能正常运行，
// 只有用户真正选择 DeepSeek 时，DeepSeekModel 才提示如何配置 Key。
modelFactory.register(
  "deepseek-flash",
  new DeepSeekModel(
    deepSeekApiKey,
    "deepseek-flash"
  )
)

modelFactory.register(
  "deepseek-v4-pro",
  new DeepSeekModel(
    deepSeekApiKey,
    "deepseek-v4-pro"
  )
)

const executors:
  Record<string, NodeExecutor> = {

  startNode:
    new StartExecutor(),

  llmNode:
    new LLMExecutor(
      modelFactory,
      toolRunner,
      toolRegistry
    ),

  conditionNode:
    new ConditionExecutor(),

  endNode:
    new EndExecutor()
}

const router = Router()

const engine =
  new workflowEngine(executors)

router.post(
  "/run",
  async (req, res) => {
    const {
      flow,
      input
    } = req.body ?? {}

    if (!flow) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "flow is required"
        })
    }

    try {
      // 浏览器提交的是 React Flow 的保存格式，先在服务端校验并转换成运行时格式。
      const runtimeFlow =
        toRuntimeFlow(flow)

      const result =
        await engine.run(
          runtimeFlow,
          input
        )

      return res.json({
        success: true,
        result
      })
    } catch (error) {
      console.error(
        "Workflow execution error:",
        error
      )

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "workflow execution failed"
        })
    }
  }
)

export default router
