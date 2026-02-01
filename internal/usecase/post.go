package usecase

import (
	"context"

	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
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
	return u.postRepo.Create(ctx, post)
}

func (u *PostUsecase) GetAll(ctx context.Context) ([]model.Post, error) {
	return u.postRepo.GetAll(ctx)
}

func (u *PostUsecase) GetByID(ctx context.Context, id int64) (model.Post, error) {
	return u.postRepo.GetByID(ctx, id)
}

func (u *PostUsecase) Delete(ctx context.Context, id int64) error {
	return u.postRepo.Delete(ctx, id)
}
