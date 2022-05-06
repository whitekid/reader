package config

import (
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"github.com/whitekid/goxp/flags"
)

const (
	keyBind = "bind_addr"
)

var configs = map[string][]flags.Flag{
	"reader": {
		{keyBind, "B", "127.0.0.1:8000", "bind address"},
	},
}

func init() {
	viper.SetEnvPrefix("rd")
	viper.AutomaticEnv()

	flags.InitDefaults(nil, configs)
}

func InitFlagSet(use string, fs *pflag.FlagSet) {
	flags.InitFlagSet(nil, configs, use, fs)
}

func BindAddr() string { return viper.GetString(keyBind) }
