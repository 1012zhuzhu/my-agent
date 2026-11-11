package domain

type ExecutionContext struct {
	RunID        string
	Input        interface{}
	NodeInputs   map[string]interface{}
	NodeOutputs  map[string]interface{}
	Variables    map[string]interface{}
}