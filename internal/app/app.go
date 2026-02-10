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
	userRepo := pkg.NewUserRepository(db)
	postRepo := pkg.NewPostRepository(db)

	canteenUC := usecase.NewCanteenUsecase(canteenRepo, newsRepo)
	authUC := usecase.NewAuthUsecase(userRepo, "super_secret_key")
	postUC := usecase.NewPostUsecase(postRepo)
	handler := http.NewHandler(canteenUC, authUC, postUC, userRepo)

	server := http.NewServer(handler)

	log.Println("Server started on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}
