package api

import (
	"my-agent-v2/backend/go/internal/domain"
	"my-agent-v2/backend/go/internal/workflow"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RunWorkflowRequest struct {
	Flow  domain.Workflow `json:"flow"`
	Input interface{}     `json:"input"`
	RunID string          `json:"run_id"`
}

type WorkflowHandler struct {
	engine *workflow.Engine
}

func NewWorkflowHandler(engine *workflow.Engine) *WorkflowHandler {
	return &WorkflowHandler{
		engine: engine,
	}
}

func (h *WorkflowHandler) Run(c *gin.Context) {
	var req RunWorkflowRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error" : "invalid request body",
		})
		return
	}

	if req.RunID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "run_id is required",
		})
		return
	}

	result, err := h.engine.Execute(
		c.Request.Context(),
		req.Flow,
		req.RunID,
		req.Input,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"run_id" : req.RunID,
		"output" : result,
	})
}