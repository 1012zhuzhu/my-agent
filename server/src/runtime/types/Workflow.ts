export interface RuntimeNode {
    id: string
    data: {
        name: string
        inputs: Record<string, unknown>
    }
}

export interface RuntimeEdge {
    source: string
    target: string
    sourceHandle?: string | null
}

export interface RuntimeFlow{
    nodes: RuntimeNode[]
    edges: RuntimeEdge[]
}