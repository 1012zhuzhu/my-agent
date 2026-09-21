import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Stack,
  TextField,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import Canvas from "./components/Canvas";
import NodeEditor from "./components/NodeEditor";
import NodePalette from "./components/NodePalette";
import { useCanvasStore } from "./store/useStore";

type WorkflowApiResponse =
  | {
      success: true;
      result: {
        output: unknown;
      };
    }
  | {
      success: false;
      message: string;
    };

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function formatOutput(output: unknown): string {
  if (typeof output === "string") {
    return output;
  }

  return JSON.stringify(output, null, 2) ?? String(output);
}

function App() {
  const { isDarkMode, saveFlow } = useCanvasStore();
  const [workflowInput, setWorkflowInput] = useState("帮我查上海天气");
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setRunMessage(null);

    try {
      // 前端只发送画布和用户输入。DeepSeek API Key 永远只保存在 server/.env。
      const savedFlow = saveFlow();
      const response = await fetch(`${API_BASE_URL}/api/workflow/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flow: savedFlow,
          input: workflowInput,
        }),
      });

      const data = (await response.json()) as WorkflowApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.success ? "Workflow execution failed" : data.message,
        );
      }

      const output = formatOutput(data.result.output);
      setRunMessage({ type: "success", content: output });
      console.log("Workflow Result:", data.result.output);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Workflow execution failed";

      setRunMessage({ type: "error", content: message });
      console.error("Workflow Error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: "flex", height: "100vh" }}>
        <NodePalette />
        <div style={{ flex: 1, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 10,
              width: 340,
            }}
          >
            <Stack spacing={1}>
              <TextField
                size="small"
                label="工作流输入"
                value={workflowInput}
                onChange={(event) => setWorkflowInput(event.target.value)}
                disabled={isRunning}
              />
              <Button
                variant="contained"
                onClick={handleRun}
                disabled={isRunning}
                startIcon={
                  isRunning ? <CircularProgress size={16} color="inherit" /> : null
                }
              >
                {isRunning ? "运行中..." : "Run Workflow"}
              </Button>
              {runMessage && (
                <Alert
                  severity={runMessage.type}
                  sx={{
                    maxHeight: 180,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {runMessage.content}
                </Alert>
              )}
            </Stack>
          </Box>
          <Canvas />
          <NodeEditor />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
