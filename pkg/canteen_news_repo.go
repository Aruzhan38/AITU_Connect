package pkg

import (
	"context"
	"database/sql"

	"AITU_Connect/internal/model"
)

type CanteenNewsRepository struct {
	db *sql.DB
}

func NewCanteenNewsRepository(db *sql.DB) *CanteenNewsRepository {
	return &CanteenNewsRepository{db: db}
}

func (r *CanteenNewsRepository) CreateNews(ctx context.Context, n model.CanteenNews) error {
	_, err := r.db.Exec("INSERT INTO canteen_news (canteen_id, admin_id, title, content, price) VALUES ($1,$2,$3,$4,$5)", n.CanteenID, n.AdminID, n.Title, n.Content, n.Price)
	return err
}

func (r *CanteenNewsRepository) GetByCanteen(ctx context.Context, id string) ([]model.CanteenNews, error) {
	rows, err := r.db.QueryContext(ctx, "SELECT id, canteen_id, admin_id, title, content, price, created_at FROM canteen_news WHERE canteen_id=$1 ORDER BY created_at DESC", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []model.CanteenNews
	for rows.Next() {
		var n model.CanteenNews
		if err := rows.Scan(&n.ID, &n.CanteenID, &n.AdminID, &n.Title, &n.Content, &n.Price, &n.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, n)
	}
	return list, nil
}
