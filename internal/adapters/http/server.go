package http

import (
	"net/http"
	"strings"
)

func NewServer(h *Handler) *http.Server {
	mux := http.NewServeMux()

	// Pages
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

	mux.HandleFunc("/communities", h.CommunitiesPage)
	mux.HandleFunc("/communities/", h.CommunityFeed)

	// Auth
	mux.HandleFunc("/auth/register", h.Register)
	mux.HandleFunc("/auth/login", h.Login)
	mux.Handle("/me", AuthMiddleware(h.authUC)(http.HandlerFunc(h.Me)))
	mux.Handle("/api/profile/update", AuthMiddleware(h.authUC)(http.HandlerFunc(h.UpdateProfile)))

	// Posts
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

	// Canteens
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

	// Users
	mux.Handle("/api/users", AuthMiddleware(h.authUC)(
		RequireRoles("admin", "moderator")(http.HandlerFunc(h.GetUsers)),
	))
	mux.Handle("/api/users/role", AuthMiddleware(h.authUC)(
		RequireRoles("admin", "moderator")(http.HandlerFunc(h.UpdateUserRole)),
	))

	// Admin stats
	mux.Handle("/api/admin/stats", AuthMiddleware(h.authUC)(
		RequireRoles("admin")(http.HandlerFunc(h.GetStats)),
	))

	// Communities API
	mux.Handle("/api/communities", AuthMiddleware(h.authUC)(http.HandlerFunc(h.GetCommunities)))
	mux.Handle("/api/communities/join/", AuthMiddleware(h.authUC)(http.HandlerFunc(h.JoinCommunity)))
	mux.Handle("/api/communities/leave/", AuthMiddleware(h.authUC)(http.HandlerFunc(h.LeaveCommunity)))
	mux.HandleFunc("/api/communities/", h.GetCommunityPosts) // /api/communities/{id}/posts

	// Static
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("ui/static"))))

	// Admin pages
	mux.HandleFunc("/admin", h.AdminPage)
	mux.HandleFunc("/moderator", h.ModeratorPage)

	return &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
}
