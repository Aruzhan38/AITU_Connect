package usecase

import (
	"context"
	"errors"
	"strings"

	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
)

var (
	ErrPostTitleEmpty = errors.New("post title is empty")
	ErrPostBodyEmpty  = errors.New("post body is empty")
)

type PostUsecase struct {
	postRepo pkg.PostRepository
}

func NewPostUsecase(postRepo pkg.PostRepository) *PostUsecase {
	return &PostUsecase{
		postRepo: postRepo,
	}
}

func (u *PostUsecase) Create(ctx context.Context, post model.Post) (int64, error) {
	post.Title = strings.TrimSpace(post.Title)
	post.Body = strings.TrimSpace(post.Body)

	if post.Title == "" {
		return 0, ErrPostTitleEmpty
	}
	if post.Body == "" {
		return 0, ErrPostBodyEmpty
	}

	return u.postRepo.Create(ctx, post)
}

func (u *PostUsecase) GetAll(ctx context.Context) ([]model.Post, error) {
	return u.postRepo.GetAll(ctx)
}

func (u *PostUsecase) GetByID(ctx context.Context, id int64) (model.Post, error) {
	return u.postRepo.GetByID(ctx, id)
}

func (u *PostUsecase) GetByAuthor(ctx context.Context, authorID int64) ([]model.Post, error) {
	return u.postRepo.GetByAuthor(ctx, authorID)
}

func (u *PostUsecase) Update(ctx context.Context, post model.Post) error {
	post.Title = strings.TrimSpace(post.Title)
	post.Body = strings.TrimSpace(post.Body)

	if post.Title == "" || post.Body == "" {
		return ErrPostBodyEmpty
	}

	return u.postRepo.Update(ctx, post)
}

func (u *PostUsecase) Delete(ctx context.Context, id int64) error {
	return u.postRepo.Delete(ctx, id)
}
