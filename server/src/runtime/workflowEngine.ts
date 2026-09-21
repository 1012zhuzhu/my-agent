import { ExecutionContext } from "./context/ExecutionContext";
import type { NodeExecutor } from "./executors/NodeExecutor";
import type { NodeExecutionResult } from "./types/Execution";
import type { RuntimeEdge, RuntimeFlow, RuntimeNode } from "./types/Workflow";

export class workflowEngine {
    private readonly executors: Record<string,NodeExecutor>
//这里存在疑问
    constructor(
        executors: Record<string,NodeExecutor>
    ){
        this.executors = executors
    }
    async run(
        flow: RuntimeFlow,
        input: unknown
    ):Promise<NodeExecutionResult> {
        const context = new ExecutionContext()

        context.setVariable('input',input)

        const startNode = flow.nodes.find(
            node => node.data.name === 'startNode'
        )
        if(!startNode){
            throw new Error('star node not found')
        }
        const maxStep = 50
        let currentNode : RuntimeNode = startNode

        for(let step = 0; step < maxStep; step++){
            console.log(
            "step:",
            step,
            "currentNode:",
            currentNode.id,
            currentNode.data.name
            )
            const executor = this.executors[currentNode.data.name]

            if(!executor){
                throw new Error(
                    `Executor not found: ${currentNode.data.name}`
                )
            }

            const result = await executor.execute(
                currentNode,
                context
            )
            context.setNodeOutput(
                currentNode.id,
                result.output
            )

            if(currentNode.data.name === 'endNode'){
                return result
            }

            const nextEdge = this.findNextEdge(
                currentNode,
                flow.edges,
                result.nextHandle
            )
            if(!nextEdge){
                throw new Error(
                    `Outgoing edge not found: ${currentNode.id}`
                )
            }

            const nextNode = flow.nodes.find(
                node => node.id === nextEdge.target
            )

            if(!nextNode){
                throw new Error(
                `Target node not found: ${nextEdge.target}`
            )
            }
            context.addNodeInput(nextNode.id,{
                nodeId: currentNode.id,
                output: result.output
            })
            currentNode = nextNode
            
        }
        throw new Error(
                "Workflow execution exceeded maximum steps"
            )
    }
    private findNextEdge(
    node: RuntimeNode,
    edges: RuntimeEdge[],
    sourceHandle?: string
    ): RuntimeEdge | undefined {
            const outgoingEdges = edges.filter(
                edge => edge.source === node.id
            )

            if(sourceHandle) {
                return outgoingEdges.find(
                    edge => edge.sourceHandle === sourceHandle
                )
            }

            if(outgoingEdges.length === 1){
                return outgoingEdges[0]
            }

            if (outgoingEdges.length > 1) {
                throw new Error(
                `Node "${node.id}" has multiple outgoing edges but no sourceHandle was provided`
                )
            }

            return undefined
    }
}
