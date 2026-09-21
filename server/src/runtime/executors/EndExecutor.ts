import type { ExecutionContext } from "../context/ExecutionContext";
import type { NodeExecutionResult } from "../types/Execution";
import type { RuntimeNode } from "../types/Workflow";
import type { NodeExecutor } from "./NodeExecutor";

export class EndExecutor implements NodeExecutor{
    async execute(node: RuntimeNode, context: ExecutionContext): Promise<NodeExecutionResult> {
        if(node.data.name !== 'endNode') {
            throw new Error('EndExecutor recevied invalid node')
        }
        //这里取上流的一个数据
        const inputs = context.getNodeInputs(node.id)

        const finalValue = inputs.at(-1)?.output

        return {
            output:finalValue
        }
    }
}