package usecase

import (
	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
	"context"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailInvalid       = errors.New("email invalid")
	ErrEmailDomain        = errors.New("only @aitu.kz emails allowed")
	ErrPasswordWeak       = errors.New("password too short")
	ErrEmailTaken         = errors.New("email already taken")
	ErrTokenInvalid       = errors.New("token invalid")
	ErrInvalidRole        = errors.New("invalid role")
)

type AuthUsecase struct {
	users     *pkg.UserRepository
	jwtSecret []byte
	tokenTTL  time.Duration
}

func NewAuthUsecase(users *pkg.UserRepository, jwtSecret string) *AuthUsecase {
	return &AuthUsecase{
		users:     users,
		jwtSecret: []byte(jwtSecret),
		tokenTTL:  60 * time.Minute,
	}
}

func (a *AuthUsecase) Register(ctx context.Context, email, password string) (model.User, string, time.Time, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if !strings.Contains(email, "@") {
		return model.User{}, "", time.Time{}, ErrEmailInvalid
	}
	if !strings.HasSuffix(email, "@aitu.kz") {
		return model.User{}, "", time.Time{}, ErrEmailDomain
	}
	if len(password) < 6 {
		return model.User{}, "", time.Time{}, ErrPasswordWeak
	}

	if _, err := a.users.GetByEmail(ctx, email); err == nil {
		return model.User{}, "", time.Time{}, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return model.User{}, "", time.Time{}, err
	}

	role := "student"
	u, err := a.users.Create(ctx, email, string(hash), role)
	if !model.AllowedRoles[role] {
		return model.User{}, "", time.Time{}, ErrInvalidRole
	}

	token, err := a.issueToken(u.ID, u.Role)
	expiry := time.Now().Add(a.tokenTTL)
	if err := a.users.UpdateToken(ctx, u.ID, token, expiry); err != nil {
		return model.User{}, "", time.Time{}, err
	}

	if err != nil {
		return model.User{}, "", time.Time{}, err
	}

	u.PasswordHash = ""
	return u, token, expiry, nil
}

func (a *AuthUsecase) Login(ctx context.Context, email, password string) (model.User, string, time.Time, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if !strings.HasSuffix(email, "@aitu.kz") {
		return model.User{}, "", time.Time{}, ErrEmailDomain
	}

	u, err := a.users.GetByEmail(ctx, email)
	if err != nil {
		return model.User{}, "", time.Time{}, ErrInvalidCredentials
	}

	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) != nil {
		return model.User{}, "", time.Time{}, ErrInvalidCredentials
	}

	token, err := a.issueToken(u.ID, u.Role)
	if err != nil {
		return model.User{}, "", time.Time{}, err
	}

	expiry := time.Now().Add(a.tokenTTL)
	if err := a.users.UpdateToken(ctx, u.ID, token, expiry); err != nil {
		return model.User{}, "", time.Time{}, err
	}

	u.PasswordHash = ""
	return u, token, expiry, nil
}

func (a *AuthUsecase) VerifyToken(tokenStr string) (int64, string, error) {
	t, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrTokenInvalid
		}
		return a.jwtSecret, nil
	})
	if err != nil || !t.Valid {
		return 0, "", ErrTokenInvalid
	}

	claims, ok := t.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", ErrTokenInvalid
	}

	idF, ok := claims["sub"].(float64)
	if !ok {
		return 0, "", ErrTokenInvalid
	}
	role, _ := claims["role"].(string)

	return int64(idF), role, nil
}

func (a *AuthUsecase) issueToken(userID int64, role string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"iat":  now.Unix(),
		"exp":  now.Add(a.tokenTTL).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(a.jwtSecret)
}

func (a *AuthUsecase) Me(ctx context.Context, userID int64) (model.User, error) {
	u, err := a.users.GetByID(ctx, userID)
	if err != nil {
		return model.User{}, err
	}
	u.PasswordHash = ""
	return u, nil
}
