package pkg

import (
	"AITU_Connect/internal/model"
	"context"
	"database/sql"
)

type CanteenNewsRepository struct {
	db *sql.DB
}

func NewCanteenNewsRepository(db *sql.DB) *CanteenNewsRepository {
	return &CanteenNewsRepository{db: db}
}

func (r *CanteenNewsRepository) Create(ctx context.Context, n model.CanteenNews) (int64, error) {
	var id int64
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO canteen_news (canteen_id, admin_id, title, content, price)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id
	`, n.CanteenID, n.AdminID, n.Title, n.Content, n.Price).Scan(&id)
	return id, err
}

func (r *CanteenNewsRepository) GetByCanteen(ctx context.Context, canteenID string) ([]model.CanteenNews, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, canteen_id, admin_id, title, content, price, created_at
		FROM canteen_news
		WHERE canteen_id = $1
		ORDER BY created_at DESC
	`, canteenID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.CanteenNews
	for rows.Next() {
		var n model.CanteenNews
		if err := rows.Scan(
			&n.ID,
			&n.CanteenID,
			&n.AdminID,
			&n.Title,
			&n.Content,
			&n.Price,
			&n.CreatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}

func (r *CanteenNewsRepository) Update(ctx context.Context, id int64, title, content, price *string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE canteen_news
		SET
		  title   = COALESCE($2, title),
		  content = COALESCE($3, content),
		  price   = COALESCE($4, price)
		WHERE id = $1
	`, id, title, content, price)
	return err
}

func (r *CanteenNewsRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx,
		`DELETE FROM canteen_news WHERE id=$1`, id)
	return err
}
