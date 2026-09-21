import type { ExecutionContext } from "../context/ExecutionContext";
import type { NodeExecutionResult } from "../types/Execution";
import type { RuntimeNode } from "../types/Workflow";
import type { NodeExecutor } from "./NodeExecutor";

export class ConditionExecutor implements NodeExecutor{
    async execute(node: RuntimeNode, context: ExecutionContext): Promise<NodeExecutionResult> {
        if(node.data.name !== 'conditionNode'){
            throw new Error('ConditionExecutor received invalid node')
        }
        const inputs = context.getNodeInputs(node.id)

        const sourceValue = inputs.at(-1)?.output

        const {
            operator,
            value
        } = node.data.inputs
        //operator = node.data.inputs.operator
        let matched = false

        switch (operator) {
        case "equals": 
            matched = String(sourceValue) === value
            break

        case "notEquals":
            matched = String(sourceValue) !== value
            break

        case "contains":
            matched = String(sourceValue).includes(value)
            break
        }

        return {
        output: matched,
        nextHandle: matched ? "true" : "false"
        }
    }
}