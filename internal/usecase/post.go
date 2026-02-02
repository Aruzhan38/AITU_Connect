package usecase

import (
	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
	"context"
)

type PostUsecase struct {
	repo *pkg.PostRepository
}

func NewPostUsecase(repo *pkg.PostRepository) *PostUsecase {
	return &PostUsecase{repo: repo}
}

func (u *PostUsecase) CreatePost(ctx context.Context, p model.Post) (int64, error) {
	return u.repo.Create(ctx, p)
}

func (u *PostUsecase) GetFeed(ctx context.Context) ([]model.Post, error) {
	return u.repo.GetAll(ctx)
}
