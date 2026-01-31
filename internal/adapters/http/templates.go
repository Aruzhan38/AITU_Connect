package http

import (
	"html/template"
	"net/http"
	"path/filepath"
)

func render(w http.ResponseWriter, name string, data any) {
	base := filepath.Join("ui", "html", "base.tmpl")
	page := filepath.Join("ui", "html", name)

	t, err := template.ParseFiles(base, page)
	if err != nil {
		http.Error(w, "template error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := t.ExecuteTemplate(w, "base", data); err != nil {
		http.Error(w, "render error: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
