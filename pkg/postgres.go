package pkg

import (
	"database/sql"
)

func NewPostgres() (*sql.DB, error) {
	dsn := "postgres://aitu:aitu123@localhost:5434/aitu_connect?sslmode=disable"
	return sql.Open("postgres", dsn)
}
