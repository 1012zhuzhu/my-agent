package executor

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"my-agent-v2/backend/go/internal/domain"
	"net/http"
	"time"
)

type AgentExecutor struct {
	pythonBaseURL string
	client *http.Client
}

type AgentExecuteRequest struct {
	RunID  string      `json:"run_id"`
	NodeID string      `json:"node_id"`
	Input  interface{} `json:"input"`
	Config domain.AgentConfig `json:"config"`
}

type AgentExecuteResponse struct {
	Output interface{} `json:"output"`
}

func NewAgentExecutor(pythonBaseURL string) *AgentExecutor {
    return &AgentExecutor{
        pythonBaseURL: pythonBaseURL,
        client: &http.Client{
            Timeout: 30 * time.Second,
        },
    }
}

func (e *AgentExecutor) Execute(
	ctx context.Context,
	node domain.Node,
	execCtx *domain.ExecutionContext,
) (*domain.NodeExecutionResult,error){
	if node.Type != domain.NodeTypeAgent {
		return nil,fmt.Errorf("invalid node type: %s",node.Type)
	}

	if execCtx == nil {
		return nil, fmt.Errorf("execution context cannot be nil")
	}

	config, err := parseAgentConfig(node.Config)
	if err != nil {
		return nil, fmt.Errorf("parse agent config: %w",err)
	}

	input, exists := execCtx.NodeInputs[node.ID]
	if !exists {
		return nil, fmt.Errorf("input not found for agent node %s", node.ID)
	}

	request := AgentExecuteRequest{
		RunID: execCtx.RunID,
		NodeID: node.ID,
		Input: input,
		Config: config,
	}
	
	body, err := json.Marshal(request)
	if err != nil {
		return nil,err
	}

	req,err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		e.pythonBaseURL+"/internal/v1/agent/execute",
		bytes.NewReader(body),
	)
	if err != nil {
		return nil,err
	}

	req.Header.Set("Content-Type", "application/json")

	resq, err := e.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call python agent service: %w",err)
	}
	defer resq.Body.Close()

	if resq.StatusCode < 200 || resq.StatusCode >= 300 {
    errorBody, readErr := io.ReadAll(
        io.LimitReader(resq.Body, 1024*1024),
    )

    if readErr != nil {
        return nil, fmt.Errorf(
            "python agent service returned status %d; read error body: %w",
            resq.StatusCode,
            readErr,
        )
    }

    return nil, fmt.Errorf(
        "python agent service returned status %d: %s",
        resq.StatusCode,
        string(errorBody),
    )
}

	var agentResponse AgentExecuteResponse

	if err := json.NewDecoder(resq.Body).Decode(&agentResponse); err != nil {
		return nil, fmt.Errorf("decode agent response: %w",err)
	}

	return &domain.NodeExecutionResult{
		Output:     agentResponse.Output,
		NextHandle: "success",
	}, nil
}

func parseAgentConfig(
	config map[string]interface{},
)(domain.AgentConfig, error){
	var result domain.AgentConfig

	systemPrompt, ok := config["system_prompt"].(string)
	if !ok {
		return result, fmt.Errorf("invalid or missing system_prompt")
	}

	model, ok:= config["model"].(string)
	if !ok {
		return result, fmt.Errorf("invalid or missing model")
	}

	result.SystemPrompt = systemPrompt
	result.Model = model

	return result, nil
}

var _ Executor = (*AgentExecutor)(nil)