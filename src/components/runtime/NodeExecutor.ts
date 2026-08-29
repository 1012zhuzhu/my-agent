import { type FlowNode } from '../../type/index';
import { ExecutionContext, type NodeExecutionResult } from './ExecutionContext';


export interface NodeExecutor  {
  execute(
    node: FlowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>
}
