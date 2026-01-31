package http

import (
	"AITU_Connect/internal/model"
	"AITU_Connect/internal/usecase"
	"encoding/json"
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

type Handler struct {
	canteenUC *usecase.CanteenUsecase
	authUC    *usecase.AuthUsecase
}

func NewHandler(canteenUC *usecase.CanteenUsecase, authUC *usecase.AuthUsecase) *Handler {
	return &Handler{canteenUC: canteenUC, authUC: authUC}
}

func (h *Handler) GetCanteens(w http.ResponseWriter, r *http.Request) {
	data, err := h.canteenUC.GetCanteens(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) GetCanteenNews(w http.ResponseWriter, r *http.Request) {
	canteenID := strings.TrimPrefix(r.URL.Path, "/api/canteen-news/")
	if canteenID == "" {
		http.Error(w, "canteen_id required", 400)
		return
	}

	data, err := h.canteenUC.GetNewsByCanteen(r.Context(), canteenID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(data)
}

func (h *Handler) CreateCanteenNews(w http.ResponseWriter, r *http.Request) {
	adminID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", 401)
		return
	}

	var req struct {
		CanteenID string  `json:"canteen_id"`
		Title     string  `json:"title"`
		Content   string  `json:"content"`
		Price     *string `json:"price"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}

	id, err := h.canteenUC.CreateNews(r.Context(), model.CanteenNews{
		CanteenID: req.CanteenID,
		AdminID:   adminID,
		Title:     req.Title,
		Content:   req.Content,
		Price:     req.Price,
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int64{"id": id})
}

func (h *Handler) DeleteCanteenNews(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/canteen-news/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid id", 400)
		return
	}

	if err := h.canteenUC.DeleteNews(r.Context(), id); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
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
