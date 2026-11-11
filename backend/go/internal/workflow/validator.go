package workflow

import (
	"fmt"
	"my-agent-v2/backend/go/internal/domain"
)

func ValidateWorkflow(wf domain.Workflow) error {
	seen := make(map[string]struct{})
	seenEdge := make(map[string]struct{})

	if len(wf.Edges) == 0 {
		return fmt.Errorf("workflow must contain at least one edge")
	}

	for _, node := range wf.Nodes {
		if node.ID == "" {
			return fmt.Errorf("node ID cannot be empty")
		}
		if _, exists := seen[node.ID];exists{
				return fmt.Errorf("duplicate node ID: %s", node.ID)
		}
		seen[node.ID] = struct{}{}
	} 
	for _, edge := range wf.Edges{
		if edge.ID == "" {
			return fmt.Errorf("edge ID cannot be empty")
		}

		if _, exists := seenEdge[edge.ID]; exists {
			return fmt.Errorf("duplicate Edge ID: %s", edge.ID)
		}

		if edge.Source == "" {
			return fmt.Errorf("edge source cannot be empty")
		}

		if _, exists := seen[edge.Source]; !exists {
			return fmt.Errorf("edge references unknown source node: %s", edge.Source)
		}

		if edge.Target == "" {
			return fmt.Errorf("edge Target cannot be empty")
		}

		if _, exists := seen[edge.Target]; !exists {
			return fmt.Errorf("edge references unknown target node: %s", edge.Target)
		}

		seenEdge[edge.ID] = struct{}{}
	}

	return nil
}