package model

import "time"

type User struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	Email        string     `json:"email"`
	Surname      string     `json:"surname"`
	Course       int        `json:"course"`
	Major        string     `json:"major"`
	GithubURL    string     `json:"github_url"`
	LmsURL       string     `json:"lms_url"`
	DuURL        string     `json:"du_url"`
	ClubName     string     `json:"club_name"`
	PasswordHash string     `json:"-"`
	Role         string     `json:"role"`
	Token        *string    `json:"-"`
	TokenExpiry  *time.Time `json:"-"`
	CreatedAt    time.Time  `json:"created_at"`
}
