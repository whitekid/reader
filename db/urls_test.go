package db

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestRandomURL(t *testing.T) {
	u := &URLService{db}

	ids := []int{}
	for i := 0; i < 10; i++ {
		u1, err := u.Random()
		require.NoError(t, err)
		ids = append(ids, int(u1.ID))
	}

	// Check if there are duplicates (random should give different results)
	seen := make(map[int]bool)
	for _, id := range ids {
		seen[id] = true
	}
	require.NotEqual(t, len(seen), len(ids))
}
