package http

import (
	"AITU_Connect/internal/model"
	"AITU_Connect/internal/usecase"
	"AITU_Connect/pkg"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

func (h *Handler) HomePage(w http.ResponseWriter, r *http.Request) {
	render(w, "index.tmpl", nil)
}

func (h *Handler) LoginPage(w http.ResponseWriter, r *http.Request) {
	render(w, "login.tmpl", nil)
}
func (h *Handler) CanteensPage(w http.ResponseWriter, r *http.Request) {
	render(w, "canteen.tmpl", nil)
}

func (h *Handler) FeedPage(w http.ResponseWriter, r *http.Request) {
	render(w, "feed.tmpl", nil)
}

func (h *Handler) CanteenNewsPage(w http.ResponseWriter, r *http.Request) {
	render(w, "canteen_news.tmpl", nil)
}

type Handler struct {
	canteenUC *usecase.CanteenUsecase
	authUC    *usecase.AuthUsecase
	postUC    *usecase.PostUsecase
}

func NewHandler(canteenUC *usecase.CanteenUsecase, authUC *usecase.AuthUsecase, postUC *usecase.PostUsecase) *Handler {
	return &Handler{
		canteenUC: canteenUC,
		authUC:    authUC,
		postUC:    postUC,
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func methodOnly(w http.ResponseWriter, r *http.Request, allowed ...string) bool {
	for _, m := range allowed {
		if r.Method == m {
			return true
		}
	}
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	return false
}

func (h *Handler) GetCanteens(w http.ResponseWriter, r *http.Request) {
	if !methodOnly(w, r, http.MethodGet) {
		return
	}

	data, err := h.canteenUC.GetCanteens(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if data == nil {
		data = make([]model.Canteen, 0)
	}
	writeJSON(w, http.StatusOK, data)
}

func (h *Handler) CanteensSubrouter(w http.ResponseWriter, r *http.Request) {
	tail := strings.TrimPrefix(r.URL.Path, "/api/canteens/")
	tail = strings.Trim(tail, "/")
	if tail == "" {
		http.NotFound(w, r)
		return
	}

	parts := strings.Split(tail, "/")
	if len(parts) != 2 || parts[1] != "news" {
		http.NotFound(w, r)
		return
	}
	canteenID := strings.TrimSpace(parts[0])
	if canteenID == "" {
		http.Error(w, "canteen_id required", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getNewsByCanteen(w, r, canteenID)
	case http.MethodPost:
		h.createNewsForCanteen(w, r, canteenID)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *Handler) getNewsByCanteen(w http.ResponseWriter, r *http.Request, canteenID string) {
	data, err := h.canteenUC.GetNewsByCanteen(r.Context(), canteenID)
	if err != nil {
		if errors.Is(err, pkg.ErrNotFound) {
			http.Error(w, "canteen not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if data == nil {
		data = make([]model.CanteenNews, 0)
	}
	writeJSON(w, http.StatusOK, data)
}

func (h *Handler) createNewsForCanteen(w http.ResponseWriter, r *http.Request, canteenID string) {
	adminID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Title   string  `json:"title"`
		Content string  `json:"content"`
		Price   *string `json:"price"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Content = strings.TrimSpace(req.Content)
	if req.Title == "" || req.Content == "" {
		http.Error(w, "title and content are required", http.StatusBadRequest)
		return
	}

	id, err := h.canteenUC.CreateNews(r.Context(), model.CanteenNews{
		CanteenID: canteenID,
		AdminID:   adminID,
		Title:     req.Title,
		Content:   req.Content,
		Price:     req.Price,
	})
	if err != nil {
		if errors.Is(err, pkg.ErrNotFound) {
			http.Error(w, "canteen not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (h *Handler) NewsByID(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/news/")
	idStr = strings.Trim(idStr, "/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPatch:
		var req struct {
			Title   *string `json:"title"`
			Content *string `json:"content"`
			Price   *string `json:"price"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}

		if req.Title != nil {
			t := strings.TrimSpace(*req.Title)
			req.Title = &t
		}
		if req.Content != nil {
			c := strings.TrimSpace(*req.Content)
			req.Content = &c
		}
		if req.Price != nil {
			p := strings.TrimSpace(*req.Price)
			req.Price = &p
		}

		if err := h.canteenUC.UpdateNews(r.Context(), id, req.Title, req.Content, req.Price); err != nil {
			if errors.Is(err, pkg.ErrNotFound) {
				http.Error(w, "not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	case http.MethodDelete:
		if err := h.canteenUC.DeleteNews(r.Context(), id); err != nil {
			if errors.Is(err, pkg.ErrNotFound) {
				http.Error(w, "not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

type authReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	id, _ := UserIDFromContext(r.Context())
	role, _ := RoleFromContext(r.Context())

	json.NewEncoder(w).Encode(map[string]any{
		"user_id": id,
		"role":    role,
	})
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req authReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	u, token, err := h.authUC.Register(r.Context(), req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"user": u, "token": token})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req authReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	u, token, err := h.authUC.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"user": u, "token": token})
}

func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", 401)
		return
	}

	var req struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}

	id, err := h.postUC.CreatePost(r.Context(), model.Post{
		AuthorID: userID,
		Title:    req.Title,
		Content:  req.Content,
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int64{"id": id})
}

func (h *Handler) GetFeed(w http.ResponseWriter, r *http.Request) {
	posts, err := h.postUC.GetFeed(r.Context())
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
