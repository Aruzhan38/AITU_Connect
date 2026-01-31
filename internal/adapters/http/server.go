package http

import "net/http"

func NewServer(h *Handler) *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc("/", HomeHandler)
	mux.HandleFunc("/login", LoginHandler)
	mux.HandleFunc("/api/canteens", h.GetCanteens)
	mux.HandleFunc("/api/canteen-news", h.CreateCanteenNews)
	mux.HandleFunc("/api/canteens/", h.GetCanteenNews)

	return &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
}
