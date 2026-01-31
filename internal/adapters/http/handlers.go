package http

import (
	"AITU_Connect/internal/model"
	"AITU_Connect/internal/usecase"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func (h *Handler) HomePage(w http.ResponseWriter, r *http.Request) {
	render(w, "index.tmpl", nil)
}

func (h *Handler) LoginPage(w http.ResponseWriter, r *http.Request) {
	render(w, "login.tmpl", nil)
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
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) CreateCanteenNews(w http.ResponseWriter, r *http.Request) {
	var req model.CanteenNews
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	uid, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	req.AdminID = fmt.Sprint(uid)

	if err := h.canteenUC.CreateNews(r.Context(), req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) GetCanteenNews(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/canteens/")
	data, err := h.canteenUC.GetByCanteen(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(data)
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
