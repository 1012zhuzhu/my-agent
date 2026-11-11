package executor

import (
	"context"
	"fmt"
	"my-agent-v2/backend/go/internal/domain"
)

type StartExecutor struct{}

func NewStartExecutor() *StartExecutor {
    return &StartExecutor{}
}

func (e *StartExecutor) Execute(
    ctx context.Context,
    node domain.Node,
    execCtx *domain.ExecutionContext,
) (*domain.NodeExecutionResult, error) {
    if node.Type != domain.NodeTypeStart {
    return nil, fmt.Errorf("invalid node type: %s", node.Type)
	}

	if execCtx == nil {
		return nil, fmt.Errorf("execution context cannot be nil")
	}

	if execCtx.Input == nil {
		return nil, fmt.Errorf("workflow input cannot be nil")
	}

	return &domain.NodeExecutionResult{
		Output: execCtx.Input,
		NextHandle: "success",
	},nil
}

var _ Executor = (*StartExecutor)(nil)