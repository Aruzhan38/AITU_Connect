package http

import "net/http"

func NewServer(h *Handler) *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc("/", h.HomePage)
	mux.HandleFunc("/login", h.LoginPage)
	mux.HandleFunc("/api/canteens", h.GetCanteens)
	mux.HandleFunc("/api/canteens/", h.GetCanteenNews)
	mux.HandleFunc("/auth/register", h.Register)
	mux.HandleFunc("/auth/login", h.Login)
	mux.Handle("/me", AuthMiddleware(h.authUC)(http.HandlerFunc(h.Me)))
	mux.Handle("/api/posts/create", AuthMiddleware(h.authUC)(http.HandlerFunc(h.CreatePost)))
	mux.HandleFunc("/api/posts/feed", h.GetFeed)
	mux.HandleFunc("/feed", func(w http.ResponseWriter, r *http.Request) {
		render(w, "feed.tmpl", nil)
	})
	mux.Handle(
		"/api/canteen-news",
		AuthMiddleware(h.authUC)(
			RequireRoles("admin", "moderator")(http.HandlerFunc(h.CreateCanteenNews)),
		),
	)
	mux.HandleFunc("/canteens", h.CanteensPage)

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("ui/static"))))

	return &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
}
