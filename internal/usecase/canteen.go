package usecase

import (
	"context"

	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
)

type CanteenUsecase struct {
	canteenRepo pkg.CanteenRepository
	newsRepo    pkg.CanteenNewsRepository
}

func NewCanteenUsecase(
	canteenRepo pkg.CanteenRepository,
	newsRepo pkg.CanteenNewsRepository,
) *CanteenUsecase {
	return &CanteenUsecase{
		canteenRepo: canteenRepo,
		newsRepo:    newsRepo,
	}
}

func (u *CanteenUsecase) GetCanteens(ctx context.Context) ([]model.Canteen, error) {
	return u.canteenRepo.GetAll(ctx)
}

func (u *CanteenUsecase) CreateNews(ctx context.Context, news model.CanteenNews) (int64, error) {
	return u.newsRepo.Create(ctx, news)
}

func (u *CanteenUsecase) GetNewsByCanteen(
	ctx context.Context,
	canteenID string,
) ([]model.CanteenNews, error) {
	return u.newsRepo.GetByCanteen(ctx, canteenID)
}

func (u *CanteenUsecase) DeleteNews(ctx context.Context, newsID int64) error {
	return u.newsRepo.Delete(ctx, newsID)
}
