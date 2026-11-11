package domain

type Workflow struct {
	ID     string
	Nodes  []Node
	Edges  []Edge
}