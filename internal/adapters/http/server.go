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

	deleteHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		h.DeletePost(w, r)
	})
	mux.Handle("/api/posts/", AuthMiddleware(h.authUC)(deleteHandler))

	mux.HandleFunc("/api/canteens", h.GetCanteens)

	mux.Handle("/api/canteens/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			h.CanteensSubrouter(w, r)
			return
		}

		AuthMiddleware(h.authUC)(
			RequireRoles("admin", "moderator", "staff", "club_leader")(http.HandlerFunc(h.CanteensSubrouter)),
		).ServeHTTP(w, r)
	}))

	mux.Handle("/api/news/",
		AuthMiddleware(h.authUC)(
			RequireRoles("admin", "moderator")(http.HandlerFunc(h.NewsByID)),
		),
	)

	mux.Handle("/api/users", AuthMiddleware(h.authUC)(
		RequireRoles("admin", "moderator")(http.HandlerFunc(h.GetUsers)),
	))

	mux.Handle("/api/users/role", AuthMiddleware(h.authUC)(
		RequireRoles("admin", "moderator")(http.HandlerFunc(h.UpdateUserRole)),
	))

	mux.Handle("/api/admin/stats", AuthMiddleware(h.authUC)(
		RequireRoles("admin")(http.HandlerFunc(h.GetStats)),
	))

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("ui/static"))))

	mux.HandleFunc("/admin", h.AdminPage)
	mux.HandleFunc("/moderator", h.ModeratorPage)

	return &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
}
