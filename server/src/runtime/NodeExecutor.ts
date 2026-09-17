import type { ExecutionContext } from "./context/ExecutionContext.js";
import type { NodeExecutionResult } from "./types/Execution.js";
import type { RuntimeNode } from "./types/Workflow.js";

export interface NodeExecutor {
    execute(
        node: RuntimeNode,
        context: ExecutionContext,
    ): Promise<NodeExecutionResult>
}
