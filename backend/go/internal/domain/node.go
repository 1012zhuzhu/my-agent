package domain

type NodeType string

const (
    NodeTypeStart NodeType = "startNode"
    NodeTypeAgent NodeType = "agentNode"
    NodeTypeEnd   NodeType = "endNode"
)

type Node struct {
    ID     string
    Type   NodeType
    Config map[string]interface{}
}