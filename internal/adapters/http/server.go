package http

import "net/http"

func NewServer(h *Handler) *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc("/", h.HomePage)
	mux.HandleFunc("/login", h.LoginPage)
	mux.HandleFunc("/canteens", h.CanteensPage)
	mux.HandleFunc("/canteens/", h.CanteenNewsPage)
	mux.HandleFunc("/feed", func(w http.ResponseWriter, r *http.Request) {
		render(w, "feed.tmpl", nil)
	})

	mux.HandleFunc("/auth/register", h.Register)
	mux.HandleFunc("/auth/login", h.Login)
	mux.Handle("/me", AuthMiddleware(h.authUC)(http.HandlerFunc(h.Me)))

	mux.Handle("/api/posts/create", AuthMiddleware(h.authUC)(http.HandlerFunc(h.CreatePost)))
	mux.HandleFunc("/api/posts/feed", h.GetFeed)

	mux.HandleFunc("/api/canteens", h.GetCanteens) //список кафешек

	mux.Handle("/api/canteens/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			h.CanteensSubrouter(w, r)
			return
		} // только админы

		AuthMiddleware(h.authUC)(
			RequireRoles("staff", "admin")(http.HandlerFunc(h.CanteensSubrouter)),
		).ServeHTTP(w, r)
	})) // защита пост онли рид

	mux.Handle("/api/news/",
		AuthMiddleware(h.authUC)(
			RequireRoles("staff", "admin")(http.HandlerFunc(h.NewsByID)),
		),
	) //пэтч или удалить

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("ui/static"))))

	return &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
}
