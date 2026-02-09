package pkg

import (
	"AITU_Connect/internal/model"
	"context"
	"database/sql"
)

type CommunityRepository struct{ db *sql.DB }

func NewCommunityRepository(db *sql.DB) *CommunityRepository { return &CommunityRepository{db: db} }

func (r *CommunityRepository) List(ctx context.Context) ([]model.Community, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, slug, title, kind, created_at
		FROM communities
		ORDER BY kind, title
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.Community
	for rows.Next() {
		var c model.Community
		if err := rows.Scan(&c.ID, &c.Slug, &c.Title, &c.Kind, &c.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (r *CommunityRepository) Join(ctx context.Context, communityID, userID int64) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO community_members (community_id, user_id)
		VALUES ($1,$2)
		ON CONFLICT DO NOTHING
	`, communityID, userID)
	return err
}

func (r *CommunityRepository) Leave(ctx context.Context, communityID, userID int64) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM community_members
		WHERE community_id=$1 AND user_id=$2
	`, communityID, userID)
	return err
}

func (r *CommunityRepository) UserMemberships(ctx context.Context, userID int64) (map[int64]bool, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT community_id FROM community_members WHERE user_id=$1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	m := map[int64]bool{}
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		m[id] = true
	}
	return m, rows.Err()
}
