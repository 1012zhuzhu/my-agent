import type { FlowData, FlowNode } from "../../../type";
import { ExecutionContext } from "../context/ExecutionContext";
import type { NodeExecutor } from "../NodeExecutor";
import { EndExecutor } from "./EndExecutor";
import { ConditionExecutor } from "./ConditionExecutor";
import { LLMExecutor } from "./LLMExecutor";
import { StartExecutor } from "./StartExecutor";
import { type FlowEdge } from "../../../type/index";
import { ToolRegistry} from '../tool/ToolRegistry';
import { CalculatorTool } from "../tool/CalculatorTool";
import { WeatherTool,} from "../tool/WeatherTool";
import { WorkflowError } from "../error/WorkflowError";

export class workflowEngine {
  private readonly executor: Record<string, NodeExecutor>;

  constructor() {
    this.executor = {
      startNode: new StartExecutor(),
      llmNode: new LLMExecutor(),
      conditionNode: new ConditionExecutor(),
      // Compatibility for workflows saved before the node type typo was fixed.
      coditionNode: new ConditionExecutor(),
      endNode: new EndExecutor(),
    };
  }
  async run(flow: FlowData) {
    const toolRegistry = new ToolRegistry()
    toolRegistry.register(new CalculatorTool())
    toolRegistry.register(new WeatherTool())
    const context = new ExecutionContext(toolRegistry);

    const startNode = flow.nodes.find((n) => n.data.name === "startNode");
    if (!startNode) {
      throw new WorkflowError(
        "MISSING_START_NODE",
        "Workflow must contain a Start Node",
      );
    }
    let currentNode: FlowNode | undefined = startNode;

    let incomingHanlde: string | undefined;

    const step = 50;
    for (let i = 0; i < step; i++) {
      if (!currentNode) {
        throw new WorkflowError(
          "CURRENT_NODE_NOT_FOUND",
          "Workflow current node was not found",
        );
      }
      const executor = this.executor[currentNode.data.name];
      if (!executor) {
        throw new WorkflowError(
          "EXECUTOR_NOT_FOUND",
          `Executor not found for node type: ${currentNode.data.name}`,
        );
      }
      const result = await executor.execute(currentNode, context);

      context.setNodeOutPuts(currentNode.id, result.output);
      if (currentNode.data.name === "endNode") {
        console.log(result.output)
        return result
      }

      incomingHanlde = result.nextHandle;

      const nextEdge = this.findNextEdge(
        currentNode,
        flow.edges,
        incomingHanlde,
      );
      if (!nextEdge) {
        throw new WorkflowError(
          "OUTGOING_EDGE_NOT_FOUND",
          `No outgoing edge found for node: ${currentNode.id}`,
        );
      }
      const nextNode = flow.nodes.find((node) => node.id === nextEdge.target);
      if (!nextNode) {
        throw new WorkflowError(
          "TARGET_NODE_NOT_FOUND",
          `Workflow target node not found: ${nextEdge.target}`,
        );
      }

      const lastNodeId = nextEdge.source;
      const lastNodeOutput = context.getNodeOutPuts(lastNodeId);
      context.setNodeInPuts(nextNode.id, {
        nodeId: lastNodeId,
        output: lastNodeOutput,
      });
      currentNode = nextNode;
    }
    throw new WorkflowError(
      "MAX_STEPS_EXCEEDED",
      "Workflow execution exceeded maximum steps",
    );
  }

  private findNextEdge(
    node: FlowNode,
    edges: FlowEdge[],
    sourceHandle?: string,
  ) {
    return edges.find((edge) => {
      if (edge.source !== node.id) {
        return false;
      }
      if (!sourceHandle) {
        return true;
      }

      return edge.sourceHandle === sourceHandle;
    });
  }
  // private findNextEdge(
  //     node: FlowNode,
  //     edges: FlowEdge[],
  //     sourceHanlde?: string
  // ){
  //     edges.find(edge => {
  //         if( !== edge.source){
  //             return false
  //         }
  //         if(!sourceHanlde){
  //             return true
  //         }
  //         return edge.sourceHandle === sourceHanlde
  //     })
  // }
}
