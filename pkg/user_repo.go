package pkg

import (
	"AITU_Connect/internal/model"
	"context"
	"database/sql"
	"errors"
	"log"
	"time"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, email, passwordHash, role string) (model.User, error) {
	var u model.User
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO users (email, password_hash, role_id)
		VALUES ($1, $2, (SELECT id FROM roles WHERE name = $3))
		RETURNING id, COALESCE(name, '') as name, COALESCE(surname, '') as surname, email, password_hash, 
				  (SELECT name FROM roles WHERE id = role_id) as role, COALESCE(course, 0) as course, 
				  COALESCE(major, '') as major, COALESCE(github_url, '') as github_url, 
				  COALESCE(lms_url, '') as lms_url, COALESCE(du_url, '') as du_url, 
				  token, token_expiry, created_at
	`, email, passwordHash, role).Scan(&u.ID, &u.Name, &u.Surname, &u.Email, &u.PasswordHash, &u.Role, &u.Course,
		&u.Major, &u.GithubURL, &u.LmsURL, &u.DuURL, &u.Token, &u.TokenExpiry, &u.CreatedAt)

	if err != nil {
		return model.User{}, err
	}

	log.Printf("user created: id=%d email=%s", u.ID, u.Email)

	return u, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (model.User, error) {
	var u model.User
	err := r.db.QueryRowContext(ctx, `
	   SELECT 
		   u.id, u.name, u.surname, u.email, u.password_hash, 
		   r.name as role, u.course, u.major, u.github_url, 
		   u.lms_url, u.du_url, u.token, u.token_expiry, u.created_at
	   FROM users u
	   LEFT JOIN roles r ON u.role_id = r.id
	   WHERE u.email = $1
	`, email).Scan(
		&u.ID,
		&u.Name,
		&u.Surname,
		&u.Email,
		&u.PasswordHash,
		&u.Role,
		&u.Course,
		&u.Major,
		&u.GithubURL,
		&u.LmsURL,
		&u.DuURL,
		&u.Token,
		&u.TokenExpiry,
		&u.CreatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return model.User{}, ErrNotFound
	}
	return u, err
}

func (r *UserRepository) UpdateToken(ctx context.Context, userID int64, token string, expiry time.Time) error {
	tokenPtr := &token
	expiryPtr := &expiry
	_, err := r.db.ExecContext(ctx, `
		UPDATE users
		SET token = $1, token_expiry = $2
		WHERE id = $3
	`, tokenPtr, expiryPtr, userID)
	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (model.User, error) {
	var u model.User
	err := r.db.QueryRowContext(ctx, `
	   SELECT 
		   u.id, u.name, u.surname, u.email, u.password_hash, 
		   r.name as role, u.course, u.major, u.github_url, 
		   u.lms_url, u.du_url, u.token, u.token_expiry, u.created_at
	   FROM users u
	   LEFT JOIN roles r ON u.role_id = r.id
	   WHERE u.id = $1
	`, id).Scan(
		&u.ID,
		&u.Name,
		&u.Surname,
		&u.Email,
		&u.PasswordHash,
		&u.Role,
		&u.Course,
		&u.Major,
		&u.GithubURL,
		&u.LmsURL,
		&u.DuURL,
		&u.Token,
		&u.TokenExpiry,
		&u.CreatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return model.User{}, ErrNotFound
	}
	return u, err
}

func (r *UserRepository) GetAll(ctx context.Context) ([]model.User, error) {
	query := `
	   SELECT 
		   u.id, u.name, u.surname, u.email, u.password_hash, 
		   r.name as role, u.course, u.major, u.github_url, 
		   u.lms_url, u.du_url, u.token, u.token_expiry, u.created_at
	   FROM users u
	   LEFT JOIN roles r ON u.role_id = r.id
	   ORDER BY u.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.User
	for rows.Next() {
		var u model.User
		err := rows.Scan(
			&u.ID,
			&u.Name,
			&u.Surname,
			&u.Email,
			&u.PasswordHash,
			&u.Role,
			&u.Course,
			&u.Major,
			&u.GithubURL,
			&u.LmsURL,
			&u.DuURL,
			&u.Token,
			&u.TokenExpiry,
			&u.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		u.PasswordHash = ""
		users = append(users, u)
	}
	return users, rows.Err()
}

func (r *UserRepository) UpdateUserRole(ctx context.Context, userID int64, roleName string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE users
		SET role_id = (SELECT id FROM roles WHERE name = $1)
		WHERE id = $2
	`, roleName, userID)
	return err
}

func (r *UserRepository) UpdateProfile(ctx context.Context, userID int64, u model.User) error {
	query := `
		UPDATE users 
		SET name = $1, 
			surname = $2, 
			course = $3, 
			major = $4, 
			github_url = $5, 
			lms_url = $6, 
			du_url = $7,
			email = $8
		WHERE id = $9
	`

	_, err := r.db.ExecContext(ctx, query,
		u.Name,
		u.Surname,
		u.Course,
		u.Major,
		u.GithubURL,
		u.LmsURL,
		u.DuURL,
		u.Email,
		userID,
	)
	return err
}
