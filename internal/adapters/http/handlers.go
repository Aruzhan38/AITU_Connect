package http

import (
	"encoding/json"
	"net/http"
	"strings"

	"AITU_Connect/internal/model"
	"AITU_Connect/internal/usecase"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("AITU Connect is running"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Login page"))
}

type Handler struct {
	canteenUC *usecase.CanteenUsecase
}

func NewHandler(uc *usecase.CanteenUsecase) *Handler {
	return &Handler{canteenUC: uc}
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
