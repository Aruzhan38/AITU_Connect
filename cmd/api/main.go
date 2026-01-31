package main

import (
	"AITU_Connect/internal/app"
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	db, err := sql.Open("postgres", "postgres://aitu:aitu123@localhost:5434/aitu_connect?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	app.Run(db)
}
