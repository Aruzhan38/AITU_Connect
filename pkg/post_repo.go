package pkg

import (
	"AITU_Connect/internal/model"
	"context"
	"database/sql"
)

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) Create(ctx context.Context, p model.Post) (int64, error) {
	var id int64
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO posts (author_id, title, content, community_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, p.AuthorID, p.Title, p.Content, p.CommunityID).Scan(&id)
	return id, err
}

func (r *PostRepository) GetAll(ctx context.Context, userID int64) ([]model.Post, error) {
	query := `
		SELECT 
			p.id,
			p.author_id,
			u.email,
			COALESCE(ro.name, 'student'),
			COALESCE(u.club_name, ''),
			p.title,
			p.content,
			p.community_id,
			p.created_at,
			(SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
			(CASE WHEN $1 > 0 AND EXISTS (SELECT 1 FROM likes l2 WHERE l2.post_id = p.id AND l2.user_id = $1) THEN true ELSE false END) AS liked
		FROM posts p
		JOIN users u ON p.author_id = u.id
		LEFT JOIN roles ro ON u.role_id = ro.id
		ORDER BY p.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []model.Post
	for rows.Next() {
		var p model.Post
		err := rows.Scan(
			&p.ID,
			&p.AuthorID,
			&p.AuthorEmail,
			&p.AuthorRole,
			&p.AuthorClubName,
			&p.Title,
			&p.Content,
			&p.CommunityID,
			&p.CreatedAt,
			&p.LikesCount,
			&p.Liked,
		)
		if err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, rows.Err()
}

func (r *PostRepository) Delete(ctx context.Context, postID int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM posts WHERE id = $1", postID)
	return err
}

func (r *PostRepository) GetByCommunity(ctx context.Context, communityID int64) ([]model.Post, error) {
	query := `
		SELECT 
			p.id,
			p.author_id,
			u.email,
			COALESCE(ro.name, 'student'),
			COALESCE(u.club_name, ''),
			p.title,
			p.content,
			p.community_id,
			p.created_at,
			(SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
			false AS liked
		FROM posts p
		JOIN users u ON p.author_id = u.id
		LEFT JOIN roles ro ON u.role_id = ro.id
		WHERE p.community_id = $1
		ORDER BY p.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, communityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []model.Post
	for rows.Next() {
		var p model.Post
		if err := rows.Scan(
			&p.ID,
			&p.AuthorID,
			&p.AuthorEmail,
			&p.AuthorRole,
			&p.AuthorClubName,
			&p.Title,
			&p.Content,
			&p.CommunityID,
			&p.CreatedAt,
			&p.LikesCount,
			&p.Liked,
		); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, rows.Err()
}

func (r *PostRepository) ToggleLike(ctx context.Context, postID int64, userID int64) (int64, bool, error) {
	var count int64
	var liked bool
	err := r.db.QueryRowContext(ctx, `
		WITH deleted AS (
			DELETE FROM likes WHERE post_id = $1 AND user_id = $2
			RETURNING *
		), inserted AS (
			INSERT INTO likes (post_id, user_id)
			SELECT $1, $2
			WHERE NOT EXISTS (SELECT 1 FROM deleted)
			RETURNING *
		)
		SELECT (SELECT COUNT(*) FROM likes WHERE post_id = $1) AS count,
			   (EXISTS (SELECT 1 FROM inserted)) AS liked
	`, postID, userID).Scan(&count, &liked)
	return count, liked, err
}
