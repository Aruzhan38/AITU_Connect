package http

import "net/http"

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("AITU Connect is running"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Login page"))
}

func CanteenHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Canteen news"))
}
