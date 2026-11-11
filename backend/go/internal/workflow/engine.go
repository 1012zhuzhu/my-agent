package workflow

import (
	"context"
	"fmt"

	"my-agent-v2/backend/go/internal/domain"
	"my-agent-v2/backend/go/internal/executor"
)

type Engine struct {
	registry *executor.Registry
	maxSteps int
}

func NewEngine(registry *executor.Registry) *Engine {
	return &Engine{
		registry: registry,
		maxSteps: 50,
	}
}

func (e *Engine) Execute(
	ctx context.Context,
	wf domain.Workflow,
	runID string,
	input interface{},
) (interface{}, error) {

	// 1. 校验 Workflow
	if err := ValidateWorkflow(wf); err != nil {
		return nil, fmt.Errorf("invalid workflow: %w", err)
	}

	// 2. 初始化执行上下文
	execCtx := &domain.ExecutionContext{
		RunID:       runID,
		Input:       input,
		NodeInputs:  make(map[string]interface{}),
		NodeOutputs: make(map[string]interface{}),
		Variables:   make(map[string]interface{}),
	}

	// 3. 建立 Node ID 到 Node 指针的映射
	nodeMap := make(map[string]*domain.Node)

	for i := range wf.Nodes {
		node := &wf.Nodes[i]
		nodeMap[node.ID] = node
	}

	// 4. 查找 StartNode
	var startNode *domain.Node

	for i := range wf.Nodes {
		if wf.Nodes[i].Type == domain.NodeTypeStart {
			startNode = &wf.Nodes[i]
			break
		}
	}

	if startNode == nil {
		return nil, fmt.Errorf("start node not found")
	}

	// 5. 初始化当前节点
	currentNode := startNode
	steps := 0
	// 6. 开始执行 Workflow
	for {

		// 检查 Context 是否已经取消
		if err := ctx.Err(); err != nil {
			return nil, fmt.Errorf("workflow execution canceled: %w", err)
		}
		
		if steps >= e.maxSteps {
			return nil,fmt.Errorf(
				"workflow execution exceeded max step: %d",e.maxSteps,
			)
			
		}
		steps++
		// 6.1 根据当前节点类型获取 Executor
		nodeExecutor, err := e.registry.Get(currentNode.Type)
		if err != nil {
			return nil, fmt.Errorf(
				"get executor for node %s: %w",
				currentNode.ID,
				err,
			)
		}

		// 6.2 执行当前节点
		result, err := nodeExecutor.Execute(ctx, *currentNode, execCtx)
		if err != nil {
			return nil, fmt.Errorf(
				"execute node %s: %w",
				currentNode.ID,
				err,
			)
		}

		if result == nil {
			return nil, fmt.Errorf(
				"executor returned nil result for node %s",
				currentNode.ID,
			)
		}

		// 6.3 保存当前节点的执行输出
		execCtx.NodeOutputs[currentNode.ID] = result.Output

		// 6.4 如果当前节点是 EndNode，结束 Workflow
		if currentNode.Type == domain.NodeTypeEnd {
			return result.Output, nil
		}

		// 6.5 根据当前节点和 NextHandle 查找下一条 Edge
		var nextEdge *domain.Edge

		for i := range wf.Edges {
			edge := &wf.Edges[i]

			if edge.Source == currentNode.ID &&
				edge.SourceHandle == result.NextHandle {
				nextEdge = edge
				break
			}
		}

		if nextEdge == nil {
			return nil, fmt.Errorf(
				"no matching edge found for node %s with handle %s",
				currentNode.ID,
				result.NextHandle,
			)
		}

		// 6.6 根据 Edge.Target 查找下一个节点
		nextNode, exists := nodeMap[nextEdge.Target]
		if !exists {
			return nil, fmt.Errorf(
				"target node %s not found",
				nextEdge.Target,
			)
		}

		// 6.7 将当前节点的输出传递给下一个节点
		execCtx.NodeInputs[nextNode.ID] = result.Output

		// 6.8 更新当前节点
		currentNode = nextNode
	}
}