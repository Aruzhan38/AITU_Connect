package http

import (
	"net/http"
	"strings"
)

func NewServer(h *Handler) *http.Server {
	mux := http.NewServeMux()

	
	mux.HandleFunc("/", h.HomePage)
	mux.HandleFunc("/login", h.LoginPage)
	mux.HandleFunc("/feed", h.FeedPage)
	mux.HandleFunc("/canteens", h.CanteensPage)
	mux.HandleFunc("/clubs", h.ClubsPage)
	mux.HandleFunc("/profile", h.ProfilePage)

	mux.HandleFunc("/canteens/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(strings.TrimSuffix(r.URL.Path, "/"), "/menu") {
			h.CafeMenuPage(w, r)
			return
		}
		h.CanteenNewsPage(w, r)
	})

	
	mux.HandleFunc("/auth/register", h.Register)
	mux.HandleFunc("/auth/login", h.Login)
	mux.Handle("/me", AuthMiddleware(h.authUC)(http.HandlerFunc(h.Me)))
	mux.Handle("/api/profile/update", AuthMiddleware(h.authUC)(http.HandlerFunc(h.UpdateProfile)))

	
	mux.Handle("/api/posts/create", AuthMiddleware(h.authUC)(http.HandlerFunc(h.CreatePost)))
	mux.HandleFunc("/api/posts/feed", h.GetFeed)

	
	postsHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		
		if strings.HasSuffix(r.URL.Path, "/like") {
			AuthMiddleware(h.authUC)(http.HandlerFunc(h.LikePost)).ServeHTTP(w, r)
			return
		}
		
		if r.Method == http.MethodDelete {
			AuthMiddleware(h.authUC)(http.HandlerFunc(h.DeletePost)).ServeHTTP(w, r)
			return
		}
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})
	mux.Handle("/api/posts/", postsHandler)

	
	mux.HandleFunc("/api/canteens", h.GetCanteens)

	mux.Handle("/api/canteens/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimSuffix(r.URL.Path, "/")

		if strings.HasSuffix(path, "/news") {
			if r.Method == http.MethodGet {
				h.CanteensSubrouter(w, r)
				return
			}
			AuthMiddleware(h.authUC)(
				RequireRoles("admin", "moderator", "staff")(http.HandlerFunc(h.CanteensSubrouter)),
			).ServeHTTP(w, r)
			return
		}
		http.NotFound(w, r)
	}))

	mux.Handle("/api/uploads/canteen-image",
		AuthMiddleware(h.authUC)(
			RequireRoles("admin", "staff")(http.HandlerFunc(h.UploadCanteenImage)),
		),
	)

	mux.Handle("/api/news/",
		AuthMiddleware(h.authUC)(
			RequireRoles("admin", "moderator", "staff")(http.HandlerFunc(h.NewsByID)),
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
