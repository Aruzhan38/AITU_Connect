package model

import "time"

type Post struct {
	ID          int64     `json:"id"`
	AuthorID    int64     `json:"author_id"`
	AuthorEmail string    `json:"author_email"`
	AuthorRole  string    `json:"author_role"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
}
