package model

import "time"

type Community struct {
	ID        int64     `json:"id"`
	Slug      string    `json:"slug"`
	Title     string    `json:"title"`
	Kind      string    `json:"kind"`
	CreatedAt time.Time `json:"created_at"`
}
