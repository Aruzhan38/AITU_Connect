package pkg

import (
	"database/sql"
	"os"
)

func NewPostgres() (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://aitu:aitu123@localhost:5434/aitu_connect?sslmode=disable"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	stmts := []string{
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS name text",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS surname text",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS course integer",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS major text",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url text",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS lms_url text",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS du_url text",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS club_name text",
	}

	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return nil, err
		}
	}

	return db, nil
}
