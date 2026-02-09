package usecase

import (
	"AITU_Connect/internal/model"
	"AITU_Connect/pkg"
	"context"
)

type CommunityUsecase struct {
	repo *pkg.CommunityRepository
}

func NewCommunityUsecase(repo *pkg.CommunityRepository) *CommunityUsecase {
	return &CommunityUsecase{repo: repo}
}

func (u *CommunityUsecase) List(ctx context.Context) ([]model.Community, error) {
	return u.repo.List(ctx)
}
func (u *CommunityUsecase) Join(ctx context.Context, communityID, userID int64) error {
	return u.repo.Join(ctx, communityID, userID)
}
func (u *CommunityUsecase) Leave(ctx context.Context, communityID, userID int64) error {
	return u.repo.Leave(ctx, communityID, userID)
}
func (u *CommunityUsecase) UserMemberships(ctx context.Context, userID int64) (map[int64]bool, error) {
	return u.repo.UserMemberships(ctx, userID)
}
