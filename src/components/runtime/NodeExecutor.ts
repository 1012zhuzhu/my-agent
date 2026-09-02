import { type FlowNode } from "../../type/index";
import {
  ExecutionContext,
  type NodeExecutionResult,
} from "./context/ExecutionContext";

export interface NodeExecutor {
  execute(
    node: FlowNode,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult>;
}
