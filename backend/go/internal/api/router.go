package api

import (
    "github.com/gin-gonic/gin"
    "my-agent-v2/backend/go/internal/bootstrap"
)

func NewRouter(app *bootstrap.App) *gin.Engine {
    router := gin.Default()

    handler := NewWorkflowHandler(app.Engine)

    router.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "status": "ok",
        })
    })

    router.POST("/api/workflow/run",handler.Run)

    return router
}