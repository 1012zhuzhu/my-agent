package executor

import (
	"context"
	"my-agent-v2/backend/go/internal/domain"
)

type Executor interface {
	Execute(
		ctx context.Context,
		node domain.Node,
		execCtx *domain.ExecutionContext,
	)(*domain.NodeExecutionResult,error)
}