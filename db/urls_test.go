package db

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/whitekid/goxp/fx"
)

func TestRandomURL(t *testing.T) {
	u := &URLService{db}

	ids := []int{}
	for i := 0; i < 10; i++ {
		u1, err := u.Random()
		require.NoError(t, err)
		ids = append(ids, int(u1.ID))
	}

	uniq := fx.Distinct(ids)
	require.NotEqual(t, uniq, ids)
}
