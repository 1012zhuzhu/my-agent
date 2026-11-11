package main

import (
	"log"
	"my-agent-v2/backend/go/internal/api"
	"my-agent-v2/backend/go/internal/bootstrap"
)

func main() {
	app,err:= bootstrap.NewApp("http://localhost:8000");
	if  err != nil {
		log.Fatalf("failed to initialize app: %v", err)
	}
	router := api.NewRouter(app)

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("failed to start server %v", err)
	}	
}