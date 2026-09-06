import { create } from 'zustand'
import type { FlowData, FlowEdge, FlowNode } from '../type'
import { NODE_DEFINITION } from '../data/nodes'

interface CanvasStore {
    nodes: FlowNode[]
    edges: FlowEdge[]
    isDarkMode: boolean
    editingNodes: string | null

    setEditingNodeId: (id: string | null) => void
    setNodes: (nodes: FlowNode[]) => void
    addNode: (nodeTypes: string, position: {x: number; y: number}) => void
    setEdges: (edges: FlowEdge[]) => void
    toggleDarkMode: () => void
    saveFlow: () => FlowData
    loadFlow: (data: FlowData) => void
    clearCanvas: () => void
    updateNodeInput: (nodeId: string, inputKey: string, inputValue: unknown) => void
}

export const useCanvasStore = create<CanvasStore>((set,get) => ({
    nodes: [],
    edges: [],
    isDarkMode: false,
    editingNodes: null,

    setNodes: (nodes) => set({nodes}),
    addNode: (nodeTypes,position) => set((state) => {
        const def = NODE_DEFINITION.find(d => d.name === nodeTypes)
        if(!def) return state
        const inputs = Object.fromEntries(
        def.inputs.map(input => [
        input.name,
        input.default
            ])
        )
        console.log("创建节点的 inputs:", inputs)
        const newNode: FlowNode = {
            id: `node_${Date.now()}`,
            type: 'customNode',
            position,
            data: {
                name: def.name,
                label: def.label,
                icon: def.icon,
                color: def.color,
                inputs,
                outputs: def.outputs
            }
        }
        return { nodes: [...state.nodes, newNode] }
    }),

    updateNodeInput: (nodeId: string, inputKey: string, inputValue: unknown) => set((state) => ({
        nodes: state.nodes.map(n => {
            if(n.id !== nodeId) return n
            return{
                ...n,
                data:{
                    ...n.data,
                    inputs: {...n.data.inputs, [inputKey]:inputValue}
                }

            }
    })
    })),

    setEditingNodeId: (id) => set({editingNodes: id}),

    setEdges: (edges) => set({edges}),

    toggleDarkMode:()=> set((s) => ({isDarkMode: !s.isDarkMode})),

    saveFlow: () => ({
        nodes: get().nodes,
        edges: get().edges,
        viewport:{x:0,y:0,zoom:1},
    }),

    loadFlow: (data) => {
        set({nodes:data.nodes, edges:data.edges})
    },

    clearCanvas: () => set({
        nodes: [],
        edges: []
    })
}))
