package usecase

import (
	"context"

	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
)

type CanteenUsecase struct {
	canteenRepo *pkg.CanteenRepository
	newsRepo    *pkg.CanteenNewsRepository
}

func NewCanteenUsecase(c *pkg.CanteenRepository, n *pkg.CanteenNewsRepository,
) *CanteenUsecase {
	return &CanteenUsecase{
		canteenRepo: c,
		newsRepo:    n,
	}
}

func (u *CanteenUsecase) GetCanteens(
	ctx context.Context,
) ([]model.Canteen, error) {
	return u.canteenRepo.GetAll(ctx)
}

func (u *CanteenUsecase) CreateNews(
	ctx context.Context,
	n model.CanteenNews,
) error {
	return u.newsRepo.CreateNews(ctx, n)
}

func (u *CanteenUsecase) GetByCanteen(
	ctx context.Context,
	canteenID string,
) ([]model.CanteenNews, error) {
	return u.newsRepo.GetByCanteen(ctx, canteenID)
}
