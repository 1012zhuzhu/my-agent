package workflow

import (
    "testing"
    "my-agent-v2/backend/go/internal/domain"
)

func TestValidateWorkflowValid(t *testing.T) {
    wf := domain.Workflow{
    ID: "workflow-001",

    Nodes: []domain.Node{
        {
            ID:   "node-001",
            Type: "startNode",
        },
        {
            ID:   "node-002",
            Type: "llmNode",
        },
		{
            ID:   "node-003",
            Type: "endNode",
        },
    },

    Edges: []domain.Edge{
        {
            ID:     "edge-002",
            Source: "node-001",
            Target: "node-002",
        },
		{
			ID:     "edge-002",
			Source: "node-002",
			Target: "node-003",
		},
    },
}

    err := ValidateWorkflow(wf)

    if err != nil {
        t.Fatalf("expected valid workflow, got error: %v", err)
    }
}