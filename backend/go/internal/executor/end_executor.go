package executor

import (
	"context"
	"fmt"
	"my-agent-v2/backend/go/internal/domain"
)

type EndExecutor struct{}

func NewEndExecutor() *EndExecutor {
	return &EndExecutor{}
}

func (e *EndExecutor) Execute(
	ctx  context.Context,
	node domain.Node,
	execCtx *domain.ExecutionContext,
) (*domain.NodeExecutionResult,error){
	if node.Type != domain.NodeTypeEnd {
		return nil, fmt.Errorf("invalid node type: %s", node.Type)
	}

	if execCtx == nil {
		return nil, fmt.Errorf("execution context cannot be nil")
	}

	input,exists := execCtx.NodeInputs[node.ID]
	if !exists {
		return nil, fmt.Errorf("input not found for end node %s",node.ID)
	}

	return &domain.NodeExecutionResult{
		Output: input,
	},nil
}

var _ Executor = (*EndExecutor)(nil)