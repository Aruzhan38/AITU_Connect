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

func (u *PostUsecase) GetFeed(ctx context.Context, userID int64) ([]model.Post, error) {
	return u.repo.GetAll(ctx, userID)
}

func (u *PostUsecase) DeletePost(ctx context.Context, postID int64) error {
	return u.repo.Delete(ctx, postID)
}

func (u *PostUsecase) ToggleLike(ctx context.Context, postID int64, userID int64) (int64, bool, error) {
	return u.repo.ToggleLike(ctx, postID, userID)
}

func (u *PostUsecase) GetByCommunity(ctx context.Context, communityID int64) ([]model.Post, error) {
	return u.repo.GetByCommunity(ctx, communityID)
}
