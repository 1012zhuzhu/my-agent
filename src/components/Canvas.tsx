import { useCallback, useEffect, useRef } from 'react'
import { CustomNodeComponent } from './nodes/CustomNode'
import { useCanvasStore } from '../store/useStore'
import ReactFlow, { Background, Controls, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, type EdgeChange, type NodeChange, type OnConnect, type OnEdgesChange, type OnNodesChange } from 'reactflow'
import type { FlowEdge, FlowNode } from '../type'

const nodeType = {customNode: CustomNodeComponent}

function Flow() {
  const {nodes: nodeStore, edges: edgeStore, setNodes,setEdges, addNode} = useCanvasStore()
  const [rfNodes, rfSetNodes,onChangNodes] = useNodesState([])
  const [rfEdges, rfSetEdge,onChangEdge] = useEdgesState([])
  const nodeChangeRef = useRef(false)
  const edgeChangeRef = useRef(false)
  const { screenToFlowPosition } = useReactFlow()

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

  const syncToStore : OnNodesChange = useCallback((changes) => {
    nodeChangeRef.current = true
    onChangNodes(changes)
    const update = changes.reduce((acc: FlowNode[], c: NodeChange) => {
    if (c.type === 'add' && c.item) {
      return [...acc, c.item as FlowNode]
    }
    if (c.type === 'remove') {
      return acc.filter(n => n.id !== c.id)
    }
    if (c.type === 'position' && c.position) {
      const newPosition = c.position  // ← TS 到这里知道它绝对不是 undefined
      return acc.map(n => n.id === c.id
        ? { ...n, position: newPosition }
        : n
      )
    }
    return acc
  }, rfNodes as FlowNode[])
    setNodes(update)
  },[onChangNodes,setNodes,rfNodes])

  const syncEdgesToStore: OnEdgesChange = useCallback((changes) => {
  edgeChangeRef.current = true
  onChangEdge(changes)

  const update = changes.reduce((acc: FlowEdge[], c: EdgeChange) => {
    if (c.type === 'remove') {
      return acc.filter(e => e.id !== c.id)
    }
    return acc  // ← 其他所有类型（select 等）直接原样返回，什么都不做
  }, rfEdges)

  setEdges(update)
}, [rfEdges, onChangEdge, setEdges])

  const onConnect: OnConnect = useCallback((params) => {
  const newEdge = {
    id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
    source: params.source,        // 源节点 ID
    target: params.target,        // 目标节点 ID
    sourceHandle: params.sourceHandle,  // 源输出点 ID
    targetHandle: params.targetHandle    // 目标输入点 ID
  }
  const update = [...rfEdges, newEdge]
  setEdges(update as FlowEdge[])       // 存到 store
  rfSetEdge(update)      // 通知 ReactFlow 重新渲染
}, [rfEdges,setEdges,rfSetEdge])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/reactflow')
    if (!type) return
    const position = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    })
    addNode(type, position)
  }, [addNode, screenToFlowPosition])

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={syncToStore}
      onEdgesChange={syncEdgesToStore}
      onConnect={onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      nodeTypes={nodeType}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  )
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}