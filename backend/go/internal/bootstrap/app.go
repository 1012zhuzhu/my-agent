package bootstrap

import (
	"my-agent-v2/backend/go/internal/domain"
	"my-agent-v2/backend/go/internal/executor"
	"my-agent-v2/backend/go/internal/workflow"
)

type App struct {
	Engine *workflow.Engine
}

func NewApp(pythonBaseURL string) (*App, error) {
	registry := executor.NewRegistry()

	startExecutor := executor.NewStartExecutor()
	agentExecutor := executor.NewAgentExecutor(pythonBaseURL)
	endExecutor := executor.NewEndExecutor()

	if err := registry.Register(domain.NodeTypeStart, startExecutor); err != nil {
		return nil, err
	}

	if err := registry.Register(domain.NodeTypeAgent, agentExecutor); err != nil {
		return nil, err
	}

	if err := registry.Register(domain.NodeTypeEnd, endExecutor); err != nil {
		return nil, err
	}

		engine := workflow.NewEngine(registry)

		return &App{Engine: engine},nil
	}