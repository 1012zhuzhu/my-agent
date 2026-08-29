import { ThemeProvider, createTheme, CssBaseline, Button } from '@mui/material'
import { useCanvasStore } from './store/useStore'
import Canvas from './components/Canvas'
import NodePalette from './components/NodePalette'
import NodeEditor from './components/NodeEditor'


function App() {
  const { isDarkMode,saveFlow,} = useCanvasStore()

  const handleRun = async () => {
     try {
      const flow = saveFlow()

      const engine = new workflowEngine()

      const result = await engine.run(flow)

      console.log(
        'Workflow Result:',
        result.output
      )
    } catch (error) {
      console.error(
        'Workflow Error:',
        error
      )
    }
  }

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light'
    }
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex', height: '100vh' }}>
        <NodePalette />
        <div style={{ flex: 1, position: 'relative' }}>
          <Button
            variant="contained"
            onClick={handleRun}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
            }}
          >
            Run Workflow
          </Button>
          <Canvas />
          <NodeEditor/>
        </div>
      </div>
    </ThemeProvider>
  )
}
import { workflowEngine } from './components/runtime/workflowEngine'

export default App