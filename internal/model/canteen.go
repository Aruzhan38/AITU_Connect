package model

import "time"

type Canteen struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Location string `json:"location"`
}

type CanteenNews struct {
	ID        string    `json:"id"`
	CanteenID string    `json:"canteen_id"`
	AdminID   string    `json:"admin_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Price     string    `json:"price"`
	CreatedAt time.Time `json:"created_at"`
}
