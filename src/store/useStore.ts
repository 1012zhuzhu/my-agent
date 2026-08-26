import { create } from 'zustand'
import type { FlowData, FlowEdge, FlowNode } from '../type'


interface CanvasStore {
    nodes: FlowNode[]
    edges: FlowEdge[]
    isDarkMode: boolean

    setNodes: (nodes: FlowNode[]) => void
    setEdges: (edges: FlowEdge[]) => void
    toggleDarkMode: () => void
    saveFlow: () => FlowData
    loadFlow: (data: FlowData) => void
    clearCanvas: () => void
}

export const useCanvasStore = create<CanvasStore>((set,get) => ({
    nodes: [],
    edges: [],
    isDarkMode: false,

    setNodes: (nodes) => set({nodes}),
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