package http

import (
	"AITU_Connect/internal/usecase"
	"context"
	"log"
	"net/http"
	"strings"
)

type ctxKey string

const (
	userIDKey ctxKey = "userID"
	roleKey   ctxKey = "role"
)

func UserIDFromContext(ctx context.Context) (int64, bool) {
	v := ctx.Value(userIDKey)
	id, ok := v.(int64)
	return id, ok
}

func RoleFromContext(ctx context.Context) (string, bool) {
	v := ctx.Value(roleKey)
	role, ok := v.(string)
	return role, ok
}

func AuthMiddleware(auth *usecase.AuthUsecase) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			log.Printf("[AUTH] %s %s | Authorization header: %q", r.Method, r.URL.Path, h)

			if !strings.HasPrefix(h, "Bearer ") {
				log.Printf("[AUTH] Missing or invalid Bearer token format")
				http.Error(w, "missing token", http.StatusUnauthorized)
				return
			}
			token := strings.TrimPrefix(h, "Bearer ")
			log.Printf("[AUTH] Token length: %d", len(token))

			id, role, err := auth.VerifyToken(token)
			if err != nil {
				log.Printf("[AUTH] Token verification failed: %v", err)
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			log.Printf("[AUTH] Token verified | UserID: %d, Role: %s", id, role)
			ctx := context.WithValue(r.Context(), userIDKey, id)
			ctx = context.WithValue(ctx, roleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireRoles(allowed ...string) func(http.Handler) http.Handler {
	allowedSet := map[string]bool{}
	for _, r := range allowed {
		allowedSet[r] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := RoleFromContext(r.Context())
			if !ok || !allowedSet[role] {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
