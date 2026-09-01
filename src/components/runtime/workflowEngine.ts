import type { FlowData, FlowNode } from "../../type";
import { ExecutionContext } from "./ExecutionContext";
import type { NodeExecutor } from "./NodeExecutor";
import { EndExecutor } from "./executors/EndExecutor";
import { LLMExecutor } from "./executors/LLMExecutor";
import { StartExecutor } from './executors/StartExecutor';
import { type FlowEdge } from '../../type/index';


export class workflowEngine {
  private readonly executor : Record<string,NodeExecutor>

  constructor(){
    this.executor = {
        startNode: new StartExecutor(),
        llmNode: new LLMExecutor(),
        endNode: new EndExecutor()
    }
  }
  async run(flow: FlowData){
    const context = new ExecutionContext()

    const startNode = flow.nodes.find(n => n.data.name === 'startNode')
    if(!startNode) {
        throw new Error(
            'Workflow must contain a Start Node'
        )
    }
    let currentNode: FlowNode | undefined = startNode

    let incomingHanlde : string | undefined

    const step = 50
    for(let i=0; i<step;i++){
        if(!currentNode){
            throw new Error(
                'Workflow dont find need Node'
            )
        }
    const executor = this.executor[currentNode.data.name]
    if(!executor){
        throw new Error(
                `Workflow dont find need Node${currentNode.data.name}`
            )
    }
    const result =await executor.execute(
        currentNode,
        context
    )

    context.setNodeOutPuts(
        currentNode.id,
        result.output
    )
    if(currentNode.data.name === "endNode"){
        return(
            result.output,
            console.log(result.output)
            
        )
    }
    
    incomingHanlde = result.nextHandle

    const nextEdge = this.findNextEdge(
        currentNode,
        flow.edges,
        incomingHanlde
    )
    if(!nextEdge){
        throw new Error(
            `No outgoing edge found for node: ${currentNode.id}`
        )
    }
    currentNode = flow.nodes.find(
        node => node.id === nextEdge.target
    )

    const lastNodeId = nextEdge.source 
    const lastNodeOutput = context.getNodeOutPuts(lastNodeId)
    context.setNodeInPuts(
        currentNode?.id,
        {
           nodeId:lastNodeId,
           output: lastNodeOutput
        }
    )

    }
    throw new Error(
      'Workflow execution exceeded maximum steps'
    )
    
}
    

    private findNextEdge(
        node:FlowNode,
        edges: FlowEdge[],
        sourceHandle?: string
    ){
        return edges.find(edge =>{
            if(edge.source !== node.id){
                return false
            }
            if(!sourceHandle) {
                return true
            }

            return edge.sourceHandle === sourceHandle
        })
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
