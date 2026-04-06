package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"z01.ascii-art-web/pkg/middleware"
	"z01.ascii-art-web/pkg/router"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      middleware.Logging(router.Routes()),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Println("Server running on port " + port)

	err := server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
