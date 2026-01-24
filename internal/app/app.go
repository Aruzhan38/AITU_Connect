package app

import (
	"log"
	"net/http"

	"AITU_Connect/internal/adapters/http"
)

func Run() {
	server := http.NewServer()

	log.Println("Server started on :8080")
	log.Fatal(server.ListenAndServe())
}
