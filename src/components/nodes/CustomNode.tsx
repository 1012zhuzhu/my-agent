import { Box, Paper, Typography } from '@mui/material'
import type { FlowNode } from '../../type'
import { Handle,Position } from 'reactflow'
import { memo, useCallback } from 'react'
import { useCanvasStore } from '../../store/useStore'

interface CustomNodeProps {
    id: string,
    data: FlowNode['data'],
    selected?: boolean
}

function CustomNode({id,data, selected} : CustomNodeProps) {
    const outputs = data.outputs ?? [{ name: 'output', label: '输出' }]
    const {setEditingNodeId} = useCanvasStore()

    const handleDoubleClick = useCallback(() =>{
        setEditingNodeId(id)
    },[id,setEditingNodeId])

  return (
    <Paper onDoubleClick={handleDoubleClick}
        sx={{
            p:1.5,
            minWidth:100,
            borderColor: data.color || '#ccc',
            borderWidth: selected ? 2 : 1,
            borderStyle: 'solid',
            borderRadius: 2
        }}
        
    >
        <Handle
            type='target'
            position={Position.Top}
            id='input'
            style={{ background: data.color}}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,mb: 1}}>
            <Box
                sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background:data.color,
                    display: 'flex',
                    alignItems:'center',
                    justifyContent: 'center',
                    color:'#fff',
                    fontSize: 12
                }}
            >
                {data.icon}
            </Box>
            <Typography variant='subtitle2'>{data.label}</Typography>
        </Box>
        {Object.entries(data.inputs || {}).map(([key, value]) => (
            <Typography 
            key={key} variant='caption' color='text.secondary' sx={{display: 'block'}}>
                {key}: {String(value)?.slice(0,20)}...
            </Typography>
        ))}
        {outputs.map((out, i) => (
            <Handle
                key={i}
                type='source'
                position={Position.Bottom}
                id={out.name}
                style={{background: data.color}}
            />
        ))}
    </Paper>
  )
}

export const CustomNodeComponent = memo(CustomNode)