import type { ExecutionContext } from "../context/ExecutionContext";
import type { NodeExecutionResult } from "../types/Execution";
import type { RuntimeNode } from "../types/Workflow";

export interface NodeExecutor{
    execute(
        node: RuntimeNode,
        context: ExecutionContext
    ):Promise<NodeExecutionResult>
}