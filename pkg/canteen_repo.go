package pkg

import (
	"context"
	"database/sql"

	"AITU_Connect/internal/model"
)

type CanteenRepository struct {
	db *sql.DB
}

func NewCanteenRepository(db *sql.DB) *CanteenRepository {
	return &CanteenRepository{db: db}
}

func (r *CanteenRepository) GetAll(ctx context.Context) ([]model.Canteen, error) {
	rows, err := r.db.QueryContext(ctx, "SELECT id, name, location FROM canteens")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []model.Canteen
	for rows.Next() {
		var c model.Canteen
		if err := rows.Scan(&c.ID, &c.Name, &c.Location); err != nil {
			return nil, err
		}
		result = append(result, c)
	}
	return result, nil
}
