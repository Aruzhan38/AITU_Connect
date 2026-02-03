package usecase

import (
	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
	"context"
	"errors"
	"strings"
)

var ErrBadInput = errors.New("bad input")

type CanteenUsecase struct {
	canteenRepo *pkg.CanteenRepository
	newsRepo    *pkg.CanteenNewsRepository
	events      chan string
}

func NewCanteenUsecase(canteenRepo *pkg.CanteenRepository, newsRepo *pkg.CanteenNewsRepository) *CanteenUsecase {
	u := &CanteenUsecase{
		canteenRepo: canteenRepo,
		newsRepo:    newsRepo,
		events:      make(chan string, 100),
	}

	go func() {
		for msg := range u.events {
			_ = msg
		}
	}()

	return u
}

func (u *CanteenUsecase) GetCanteens(ctx context.Context) ([]model.Canteen, error) {
	return u.canteenRepo.GetAll(ctx)
}

func (u *CanteenUsecase) GetNewsByCanteen(ctx context.Context, canteenID string) ([]model.CanteenNews, error) {
	canteenID = strings.TrimSpace(canteenID)
	if canteenID == "" {
		return nil, ErrBadInput
	}
	return u.newsRepo.GetByCanteen(ctx, canteenID)
}

func (u *CanteenUsecase) CreateNews(ctx context.Context, news model.CanteenNews) (int64, error) {
	news.CanteenID = strings.TrimSpace(news.CanteenID)
	news.Title = strings.TrimSpace(news.Title)
	news.Content = strings.TrimSpace(news.Content)

	if news.CanteenID == "" || news.Title == "" || news.Content == "" {
		return 0, ErrBadInput
	}

	ok, err := u.canteenRepo.Exists(ctx, news.CanteenID)
	if err != nil {
		return 0, err
	}
	if !ok {
		return 0, pkg.ErrNotFound
	}

	id, err := u.newsRepo.Create(ctx, news)
	if err == nil {
		select {
		case u.events <- "news created for canteen " + news.CanteenID:
		default:
		}
	}
	return id, err
}

func (u *CanteenUsecase) UpdateNews(ctx context.Context, id int64, title, content, price *string) error {
	return u.newsRepo.Update(ctx, id, title, content, price)
}

func (u *CanteenUsecase) DeleteNews(ctx context.Context, id int64) error {
	return u.newsRepo.Delete(ctx, id)
}
