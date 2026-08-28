export interface SelectOption {
  name: string
  label: string
}
export interface InputParam{
    options: SelectOption[]
    name: string
    label: string
    type: 'string' | 'number' | 'boolean' | 'code' | 'dropdown' | 'asyncOptions'
    optional?: boolean
    default?: unknown
    placeholder?: string
    show?: Record<string,unknown>
}

export interface NodeDefinition {
    name: string
    label: string
    icon: string
    color: string
    inputs: InputParam[]
    outputs: {name: string; label: string}[]
}

export interface FlowNode {
    id: string
    type: string
    position: {x: number; y: number }
    data: {
        icon: string
        name:string
        label: string
        inputs: Record<string, unknown>
        outputs?: {name: string; label: string}[]
        color?: string
    }
}

export interface FlowEdge {
    id: string
    source: string
    target: string
    sourceHandle: string
    targetHandle: string
}

export interface FlowData {
    nodes: FlowNode[]
    edges: FlowEdge[]
    viewport: {x: number; y:number; zoom: number}
}