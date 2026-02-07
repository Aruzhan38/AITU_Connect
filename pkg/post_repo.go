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
	err := r.db.QueryRowContext(ctx,
		"INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3) RETURNING id",
		p.AuthorID, p.Title, p.Content,
	).Scan(&id)
	return id, err
}

func (r *PostRepository) GetAll(ctx context.Context) ([]model.Post, error) {
	query := `
		SELECT p.id, p.author_id, u.email, COALESCE(r.name, 'student'), p.title, p.content, p.created_at 
		FROM posts p
		JOIN users u ON p.author_id = u.id
		LEFT JOIN roles r ON u.role_id = r.id
		ORDER BY p.created_at DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []model.Post
	for rows.Next() {
		var p model.Post
		err := rows.Scan(&p.ID, &p.AuthorID, &p.AuthorEmail, &p.AuthorRole, &p.Title, &p.Content, &p.CreatedAt)
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
