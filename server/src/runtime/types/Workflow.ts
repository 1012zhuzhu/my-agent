import type {
    ConditionRuntimeNode,
    EndRuntimeNode,
    LLMRuntimeNode,
    StartRuntimeNode,
} from "../data/node.js"

export type RuntimeNode =
| StartRuntimeNode
| LLMRuntimeNode
| ConditionRuntimeNode
| EndRuntimeNode

export interface RuntimeEdge {
    source: string
    target: string
    sourceHandle?: string | null
}

export interface RuntimeFlow{
    nodes: RuntimeNode[]
    edges: RuntimeEdge[]
}
