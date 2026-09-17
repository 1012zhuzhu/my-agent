import type { History, Message } from "./Message.js"
import type { ToolRegistry } from "../tool/ToolRegistry.js"

export interface NodeInput {
    nodeId: string
    output: unknown
    handle?: string
}

export class ExecutionContext {
    private readonly nodeOutputs = new Map<string, unknown>()
    private readonly variables = new Map<string, unknown>()
    private readonly nodeInputs = new Map<string, NodeInput[]>()
    private readonly history: Message[] = []
    private readonly toolRegistry: ToolRegistry

    constructor(toolRegistry: ToolRegistry) {
        this.toolRegistry = toolRegistry
    }

    getToolRegistry(): ToolRegistry {
        return this.toolRegistry
    }

    setNodeOutput(nodeId: string, output: unknown): void {
        this.nodeOutputs.set(nodeId, output)
    }

    getNodeOutput(nodeId: string): unknown {
        return this.nodeOutputs.get(nodeId)
    }

    setVariable(name: string, value: unknown): void {
        this.variables.set(name, value)
    }

    getVariable(name: string): unknown {
        return this.variables.get(name)
    }

    addNodeInput(nodeId: string, input: NodeInput): void {
        const inputs = this.nodeInputs.get(nodeId) ?? []
        inputs.push(input)
        this.nodeInputs.set(nodeId, inputs)
    }

    getNodeInputs(nodeId: string): NodeInput[] {
        return this.nodeInputs.get(nodeId) ?? []
    }

    addMessage(message: Message): void {
        this.history.push(message)
    }

    getHistory(): Message[] {
        return this.history
    }
}
