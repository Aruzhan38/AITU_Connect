package app

import (
	"AITU_Connect/internal/adapters/http"
	"log"
)

func Run() {
	server := http.NewServer()

	log.Println("Server started on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}
