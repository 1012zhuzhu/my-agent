import { ConditionExecutor } from "./runtime/executors/ConditionExecutor"
import { EndExecutor } from "./runtime/executors/EndExecutor"
import { LLMExecutor } from "./runtime/executors/LLMExecutor"
import type { NodeExecutor } from "./runtime/executors/NodeExecutor"
import { StartExecutor } from "./runtime/executors/StartExecutor"
import { MockModel } from "./runtime/model/MockModel"
import { ModelFactory } from "./runtime/model/ModelFactory"
import { ToolRegistry } from "./runtime/tool/ToolRegistry"
import { ToolRunner } from "./runtime/tool/ToolRunner"
import { WeatherTool } from "./runtime/tool/WeatherTool"
import type { RuntimeFlow } from "./runtime/types/Workflow"
import { workflowEngine } from "./runtime/workflowEngine"

const toolRegistry = new ToolRegistry()

toolRegistry.register(new WeatherTool())

const toolRunner = new ToolRunner(toolRegistry)

// 测试仍使用 Mock，不会消耗 DeepSeek API；正式运行时由节点的 model 字段切换模型。
const modelFactory = new ModelFactory()
modelFactory.register("mock", new MockModel())

const executors: Record<string, NodeExecutor> = {
  startNode: new StartExecutor(),

  llmNode: new LLMExecutor(
    modelFactory,
    toolRunner,
    toolRegistry
  ),

  conditionNode: new ConditionExecutor(),

  endNode: new EndExecutor()
}

const engine = new workflowEngine(executors)

const flow: RuntimeFlow = {
  nodes: [
    {
      id: "start-1",
      data: {
        name: "startNode"
      }
    },

    {
      id: "llm-1",
      data: {
        name: "llmNode",
        inputs: {
          model: "mock",
          prompt: "回答用户问题",
          tools: ["weather"]
        }
      }
    },

    {
      id: "condition-1",
      data: {
        name: "conditionNode",
        inputs: {
          operator: "contains",
          value: "阴"
        }
      }
    },

    {
      id: "end-true",
      data: {
        name: "endNode",
        inputs: {
          input: ""
        }
      }
    },

    {
      id: "end-false",
      data: {
        name: "endNode",
        inputs: {
          input: ""
        }
      }
    }
  ],

  edges: [
    {
      source: "start-1",
      target: "llm-1"
    },

    {
      source: "llm-1",
      target: "condition-1"
    },

    {
      source: "condition-1",
      target: "end-true",
      sourceHandle: "true"
    },

    {
      source: "condition-1",
      target: "end-false",
      sourceHandle: "false"
    }
  ]
}
const result = await engine.run(
  flow,
  "帮我查上海天气"
)

console.log(result)
