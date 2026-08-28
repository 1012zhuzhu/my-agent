import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useCanvasStore } from './store/useStore'
import Canvas from './components/Canvas'
import NodePalette from './components/NodePalette'
import NodeEditor from './components/NodeEditor'

function App() {
  const { isDarkMode } = useCanvasStore()

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
          <Canvas />
          <NodeEditor/>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App