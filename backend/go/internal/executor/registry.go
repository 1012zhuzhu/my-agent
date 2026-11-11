package executor

import (
	"fmt"
	"my-agent-v2/backend/go/internal/domain"
)

type Registry struct {
	executors map[domain.NodeType]Executor
}

func NewRegistry() *Registry {
	return &Registry{
		executors: make(map[domain.NodeType]Executor),
	}

}

func (r *Registry) Register(nodeType domain.NodeType, exec Executor) error{
	if nodeType == "" {
	return fmt.Errorf("nodetype can not be empty")
	}
	if exec == nil {
	return 	fmt.Errorf("exec must have some datas")
	}

	if _, exists := r.executors[nodeType]; exists{
	return 	fmt.Errorf("executor already registered : %s",nodeType)
	}

	r.executors[nodeType] = exec

	return nil
}

func (r *Registry) Get(nodeType domain.NodeType) (Executor, error) {
	if nodeType == "" {
		return nil, fmt.Errorf("node type cannot be empty")
	}

	exec, exists := r.executors[nodeType]
	if !exists {
		return nil, fmt.Errorf("executor not found: %s", nodeType)
	}

	return exec, nil
}
