import type { ExecutionContext } from "../context/ExecutionContext";
import type { NodeExecutionResult } from "../types/Execution";
import type { RuntimeNode } from "../types/Workflow";
import type { NodeExecutor } from "./NodeExecutor";

export class StartExecutor implements NodeExecutor {
    async execute(node: RuntimeNode, context: ExecutionContext): Promise<NodeExecutionResult> {
        if(node.data.name !== 'startNode'){
            throw new Error('startExecutor received invalid node')
        }

        const input = context.getVariable('input')

        return {
            output: input
        }
    }
}
