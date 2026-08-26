import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useCanvasStore } from './store/useStore'
import Canvas from './components/Canvas'

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
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas />
      </div>
    </ThemeProvider>
  )
}

export default App