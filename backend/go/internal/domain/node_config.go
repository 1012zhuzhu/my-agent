package domain

type AgentConfig struct {
	SystemPrompt string `json:"system_prompt"`
	Model        string `json:"model"`
}