package workflow

import (
    "context"
    "testing"

    "my-agent-v2/backend/go/internal/domain"
    "my-agent-v2/backend/go/internal/executor"
)

func TestEngine_Execute_HelloWorld(t *testing.T) {
    // 1. 创建 Registry
	registry := executor.NewRegistry()

	// 2. 注册 StartExecutor 和 EndExecutor
	if err := registry.Register(
		"startNode",
		executor.NewStartExecutor(),
	); err != nil {
		t.Fatalf("register start executor failed: %v", err)
	}

	if err:= registry.Register(
		"endNode",
		executor.NewEndExecutor(),
	);err != nil {
		t.Fatalf("register end executor failed: %v", err)
	}
    
    // 3. 创建 Engine

	engine := NewEngine(registry)

	// 4. 创建 StartNode -> EndNode 的 Workflow
	wf := domain.Workflow{
		ID:"workflow1",
		Nodes: []domain.Node{
			{
				ID:   "start-1",
				Type: "startNode",
			},
			{
				ID:    "end-1",
				Type:  "endNode",
			},
		},
		Edges: []domain.Edge{
			{
				ID:           "edge-1",
				Source:       "start-1",
				Target:       "end-1",
				SourceHandle: "success",
			},
		},
	}
    

    // 5. 执行 Engine，输入 Hello World
	result ,err := engine.Execute(
		context.Background(),
		wf,
		"run-1",
		"Hello World",
	)
	if err != nil {
		t.Fatalf("workflow execution failed: %v", err)
	}
    // 6. 判断最终输出是否等于 Hello World

	got, ok := result.(string)
	if !ok {
		t.Fatalf("expected string result, got %T", result)
	}

	if got != "Hello World" {
		t.Fatalf(
			"expected Hello World, got %s",
			got,
		)
	}
}