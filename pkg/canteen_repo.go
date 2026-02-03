package pkg

import (
	"AITU_Connect/internal/model"
	"context"
	"database/sql"
	"errors"
)

var ErrCanteenFound = errors.New("not found")

type CanteenRepository struct {
	db *sql.DB
}

func NewCanteenRepository(db *sql.DB) *CanteenRepository {
	return &CanteenRepository{db: db}
}

func (r *CanteenRepository) GetAll(ctx context.Context) ([]model.Canteen, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, name, location
		FROM canteens
		ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]model.Canteen, 0)
	for rows.Next() {
		var c model.Canteen
		if err := rows.Scan(&c.ID, &c.Name, &c.Location); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (r *CanteenRepository) Exists(ctx context.Context, id string) (bool, error) {
	var x string
	err := r.db.QueryRowContext(ctx, `SELECT id FROM canteens WHERE id=$1`, id).Scan(&x)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}
