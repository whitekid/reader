package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestConfig(t *testing.T) {
	envDBHost := os.Getenv("RD_DB_HOST")
	if envDBHost == "" {
		require.Equal(t, "localhost", DBHost(), "should be default value localhost")
	} else {
		require.Equal(t, envDBHost, DBHost())
	}
}
