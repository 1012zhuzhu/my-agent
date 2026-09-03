import type { Message, History } from "./Message";
import { ToolRegistry } from '../tool/ToolRegistry';

export interface NodeExecutionResult {
  output?: unknown;
  nextHandle?: string;
}

type NodeInPut = {
  nodeId: string;
  output: unknown;
  Handle?: string;
};

export class ExecutionContext {
  private readonly nodeOutPuts = new Map<string, unknown>();
  private readonly variable = new Map<string, unknown>();
  private readonly nodeInPuts = new Map<string, NodeInPut[]>();
  private  history : History = []
  
  constructor(
    private readonly toolRegistry: ToolRegistry
  ) {}
  

  getToolRegistry() {
    return this.toolRegistry;
  }

  setNodeOutPuts(nodeId: string, output: unknown) {
    this.nodeOutPuts.set(nodeId, output);
  }

  getNodeOutPuts(nodeId: string) {
    return this.nodeOutPuts.get(nodeId);
  }

  setVariable(name: string, output: unknown) {
    this.variable.set(name, output);
  }

  getVariable(name: string) {
    return this.variable.get(name);
  }

  setNodeInPuts(nodeId: string, input: NodeInPut) {
    const inputs = this.nodeInPuts.get(nodeId) ?? [];

    inputs.push(input);

    this.nodeInPuts.set(nodeId, inputs);
  }

  getNodeInPuts(nodeId: string): NodeInPut[] {
    return this.nodeInPuts.get(nodeId) ?? [];
  }

  getAllNodeOutPuts() {
    return Object.fromEntries(this.nodeOutPuts);
  }

  getAllVariable() {
    return Object.fromEntries(this.variable);
  }

  addMessage(message: Message){
    this.history.push(message)
  }

  getHistory(): History {
    return this.history
  }
}