package model

import "time"

type User struct {
	ID           int64      `json:"id"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	Role         string     `json:"role"`
	Token        *string    `json:"-"`
	TokenExpiry  *time.Time `json:"-"`
	CreatedAt    time.Time  `json:"created_at"`
}
