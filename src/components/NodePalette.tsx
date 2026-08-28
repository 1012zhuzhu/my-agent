import { useCanvasStore } from '../store/useStore'
import type { NodeDefinition } from '../type';
import { NODE_DEFINITION } from '../data/nodes';

function NodePalette() {
    const {addNode} = useCanvasStore();

    const handleDragStart = (e: React.DragEvent, def: NodeDefinition) => {
        e.dataTransfer.setData('application/reactflow', def.name)
        e.dataTransfer.effectAllowed = 'move'
    }

  return (
    <div
        style={{
            width:200,
            height:'100vh',
            background:'#f5f5f5',
            borderRight:'1px solid #ddd',
            padding: 16,
            overflow:'auto'
        }}
    >
        <h4 style={{ marginBottom: 16}}>节点</h4>
        {NODE_DEFINITION.map(def => (
            <div
          key={def.name}
          draggable
          onDragStart={(e) => handleDragStart(e, def)}
          style={{
            padding: '8px 12px',
            marginBottom: 8,
            background: '#fff',
            borderRadius: 6,
            cursor: 'grab',
            border: `2px solid ${def.color}40`,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{
            width: 16, height: 16, borderRadius: '50%',
            background: def.color, display: 'inline-block'
          }} />
          {def.label}
        </div>
      ))}
    </div>
  )
}
export default NodePalette