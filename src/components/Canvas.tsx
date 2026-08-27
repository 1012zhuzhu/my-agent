import { useCallback, useEffect, useRef } from 'react'
import { CustomNodeComponent } from './nodes/CustomNode'
import { useCanvasStore } from '../store/useStore'
import ReactFlow, { Background, Controls, useEdgesState, useNodesState, type Edge, type OnConnect, type OnEdgesChange, type OnNodesChange } from 'reactflow'
import type { FlowEdge, FlowNode } from '../type'

const nodeType = {customNode: CustomNodeComponent}

function Canvas() {
  const {nodes: nodeStore, edges: edgeStore, setNodes,setEdges} = useCanvasStore()
  const [rfNodes, rfSetNodes,onChangNodes] = useNodesState([])
  const [rfEdges, rfSetEdge,onChangEdge] = useEdgesState([])
  const nodeChangeRef = useRef(false)
  const edgeChangeRef = useRef(false)

  useEffect(() =>{
      if(!nodeChangeRef.current){
        rfSetNodes(nodeStore.map(n => ({
          ...n,type:'customNode'
        })
      )
    )
      }
      nodeChangeRef.current = false
  },[nodeStore])  

  useEffect(() =>{
      if(!edgeChangeRef.current){
        rfSetEdge(edgeStore)
      }
      edgeChangeRef.current = false
  },[edgeStore])

  const syncToStore: OnNodesChange = useCallback((changes) => {
    nodeChangeRef.current = true
    onChangNodes(changes)
    const updated = changes.reduce((acc, c) => {
      const node = rfNodes.find(n => n.id === c.id)
      if (!node) return acc
      if (c.type === 'remove') return acc.filter(n => n.id !== c.id)
      return acc.map(n => n.id === c.id ? { ...n, ...c } : n)
    }, rfNodes)
    setNodes(updated as FlowNode[])
  }, [rfNodes, rfSetNodes,onChangNodes])

  const syncEdgesToStore: OnEdgesChange = useCallback((changes) => {
    edgeChangeRef.current = true
    onChangEdge(changes)
    const updated = changes.reduce((acc, c) => {
      if (c.type === 'remove') return acc.filter(e => e.id !== c.id)
      return acc.map(e => e.id === c.id ? { ...e, ...c } : e)
    }, rfEdges)
    setEdges(updated as FlowEdge[])
  }, [rfEdges, rfSetEdge,onChangEdge])

  const onConnect: OnConnect = useCallback((params) => {
  const newEdge: FlowEdge = {
    id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle
  }
  const updated = [...rfEdges, newEdge]
  rfSetEdge(updated)  // ← 只通过 ReactFlow 的 setter
  setEdges(updated as FlowEdge[])  // ← 同步到 store
}, [rfEdges, rfSetEdge, setEdges])

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={syncToStore}
      onEdgesChange={syncEdgesToStore}
      onConnect={onConnect}
      nodeTypes={nodeType}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  )
}

export default Canvas