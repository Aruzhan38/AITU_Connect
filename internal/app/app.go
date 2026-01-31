package app

import (
	"AITU_Connect/internal/adapters/http"
	"AITU_Connect/internal/usecase"
	"AITU_Connect/pkg"
	"database/sql"
	"log"
)

func Run(db *sql.DB) {
	canteenRepo := pkg.NewCanteenRepository(db)
	newsRepo := pkg.NewCanteenNewsRepository(db)

	canteenUC := usecase.NewCanteenUsecase(canteenRepo, newsRepo)
	handler := http.NewHandler(canteenUC)

	server := http.NewServer(handler)

	log.Println("Server started on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}
