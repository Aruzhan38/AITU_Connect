package http

import "net/http"

func NewServer() *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc("/", HomeHandler)
	mux.HandleFunc("/login", LoginHandler)
	mux.HandleFunc("/canteen", CanteenHandler)

	return &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
}
