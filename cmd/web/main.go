package main

import (
	"log"
	"net/http"
	"time"
	"z01.ascii-art-web/pkg/middleware"
	"z01.ascii-art-web/pkg/router"
)

func main() {
	server := &http.Server{
		Addr:         ":8080",
		Handler:      middleware.Logging(router.Routes()),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Println("Server running at http://localhost:8080")

	err := server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}

}
