package config

import (
	"os"
	"testing"

	"github.com/spf13/pflag"
	"github.com/stretchr/testify/require"
)

func TestMain(m *testing.M) {
	fs := pflag.NewFlagSet("", pflag.ContinueOnError)
	InitFlags(fs)

	os.Exit(m.Run())
}

func TestConfig(t *testing.T) {
	envDBHost := os.Getenv("RD_DB_HOST")
	if envDBHost == "" {
		require.Equal(t, "localhost", DBHost(), "should be default value localhost")
	} else {
		require.Equal(t, envDBHost, DBHost())
	}
}
