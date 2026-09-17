import { ExecutionContext } from "./runtime/context/ExecutionContext"
import { LLMExecutor } from "./runtime/executors/LLMExecutor"
import { MockModel } from "./runtime/model/MockModel"

const executor = new LLMExecutor(
  new MockModel()
)

const context = new ExecutionContext()

const node = {
  id: "llm-1",
  data: {
    name: "llmNode",
    inputs: {}
  }
}

const result = await executor.execute(
  node,
  context
)

console.log("result:", result)
console.log("history:", context.getHistory())