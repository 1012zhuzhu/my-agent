import type { FlowNode } from "../../../type";
import type { ExecutionContext, NodeExecutionResult } from "../context/ExecutionContext";
import type { NodeExecutor } from "../NodeExecutor";
type ConditionOperator = 
| "equals"
| "notEquals"
| "contains"

function isConditionOperator(
  value:unknown
): value is ConditionOperator{
  return (
    value === "equals"||
    value === "notEquals"||
    value === "contains"
  )
}
export class ConditionExecutor implements NodeExecutor {

  async execute(
    node: FlowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {

    const inputs = context.getNodeInPuts(node.id)

    if (inputs.length === 0) {
      throw new Error(
        `Condition node ${node.id} has no input`
      )
    }

    const upstreamValue =
      inputs[0].output

    const operator =
      node.data.inputs.operator

    const expectedValue = node.data.inputs.value
    console.log("upstreamValue:", upstreamValue)
    console.log("expectedValue:", expectedValue)

    console.log('这里是condition节点',node.data.inputs);
    
    if(!isConditionOperator(operator)){
      throw new Error('这里的类型验证存在问题')
    }

    let result = false

    switch (operator) {

      case "equals": 
        result = upstreamValue === expectedValue
        break 

      case "notEquals":
        result =
          upstreamValue !== expectedValue
        break

      case "contains":
        result =
          typeof upstreamValue === "string" &&
          typeof expectedValue === "string" &&
          upstreamValue.includes(expectedValue)
        break
    }

    return {
      output: result,
      nextHandle:
        result ? "true" : "false"
    }
  }
}