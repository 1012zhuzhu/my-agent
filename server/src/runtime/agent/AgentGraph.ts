import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import type { Model } from "../model/model";
import type { ToolDefinition } from "../tool/Tool";
import type { ToolRunner } from "../tool/ToolRunner";
import { createModelNode } from "./nodes/modelNode";
import { createToolNodes } from "./nodes/toolNode";
import { AgentState } from "./AgentState";
import { routeModelResult } from "./routeModelResult";

const checkpointer = new MemorySaver()

export function createAgentGraph(
    model: Model,
    tools: ToolDefinition[],
    toolRunner: ToolRunner,
    allowedTools: string[]
){
    const modelNode = createModelNode(
        model,
        tools
    )

    const toolNode = createToolNodes(
        toolRunner,
        allowedTools
    )

    // const checkpointer = new MemorySaver()

    const graph = new StateGraph(AgentState)
    .addNode(
        "model",
        modelNode
    )
    .addNode(
        "tool",
        toolNode
    )
    .addEdge(
        START,
        "model"
    )
    .addConditionalEdges(
        "model",
        routeModelResult,
        {
            tool:'tool',
            end:END
        }
    )
    .addEdge(
        "tool",
        "model"
    )
    return graph.compile({
        checkpointer
    })
}