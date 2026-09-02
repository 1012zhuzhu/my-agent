import { useCanvasStore } from '../store/useStore'
import { NODE_DEFINITION } from '../data/nodes'
import type { InputParam, SelectOption } from '../type';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from '@mui/material';

function NodeEditor() {
    const {nodes,editingNodes,updateNodeInput,setEditingNodeId} = useCanvasStore()
    const node = nodes.find(n => n.id === editingNodes)
    const def = node ? NODE_DEFINITION.find(d => d.name === node.data.name) : null

    const InputParam : InputParam[] = def?.inputs??[]
    const HandleClose = () => setEditingNodeId(null)
    if(!node || !def) return null
  return (
    <Dialog open={!!editingNodes} onClose={HandleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{def.label}-参数配置</DialogTitle>
        <DialogContent dividers>
            {InputParam.map(param => (
                <FieldInput
                    key={param.name}
                    param={param}
                    value={node.data.inputs[param.name]}
                    onChange={val => updateNodeInput(node.id, param.name, val)}
                />
            ))}
        </DialogContent>
        <DialogActions>
                <Button onClick={HandleClose}>关闭</Button>
        </DialogActions>       
    </Dialog>
  )
}

function FieldInput({
  param,
  value,
  onChange
}: {
  param: InputParam
  value: unknown
  onChange: (val: unknown) => void
}) {
  const commonProps = {
    fullWidth: true,
    margin: 'dense' as const,
    label: param.label,
    placeholder: param.placeholder,
    value: (value ?? param.default ?? '') as string
  }

  if (param.type === 'code') {
    return (
      <TextField
        {...commonProps}
        multiline
        rows={4}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  if (param.type === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
          />
        }
        label={param.label}
      />
    )
  }

  if (param.type === 'dropdown' && param.options) {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel>{param.label}</InputLabel>
        <Select
          value={(value ?? '') as string}
          label={param.label}
          onChange={e => onChange(e.target.value)}
        >
          {param.options.map((opt: SelectOption) => (
            <MenuItem key={opt.name} value={opt.name}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  // 默认：string / number
  return (
    <TextField
      {...commonProps}
      type={param.type === 'number' ? 'number' : 'text'}
      onChange={e =>
        onChange(
          param.type === 'number'
            ? Number(e.target.value)
            : e.target.value
        )
      }
    />
  )
}



export default NodeEditor