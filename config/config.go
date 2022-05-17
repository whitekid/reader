package config

import (
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/whitekid/goxp/flags"
)

const (
	keyBind         = "bind_addr"
	keySlugEncoding = "slug_encoding"
	keyDatabase     = "database"
)

var configs = map[string][]flags.Flag{
	"reader": {
		{keyBind, "B", "127.0.0.1:8000", "bind address"},
		{keySlugEncoding, "s", "", "slug encoding"},
	},
}

var persistentConfigs = map[string][]flags.Flag{
	"reader": {
		{keyDatabase, "d", "reader.db", "database"},
	},
}

var v *viper.Viper

func init() {
	v = viper.GetViper()
	v.SetEnvPrefix("rd")
	v.AutomaticEnv()

	flags.InitDefaults(nil, configs)
}

func InitFlagSet(use string, cmd *cobra.Command) {
	flags.InitFlagSet(nil, configs, use, cmd.Flags())
	flags.InitFlagSet(nil, persistentConfigs, use, cmd.PersistentFlags())
}

func BindAddr() string { return v.GetString(keyBind) }
func Encoding() string { return v.GetString(keySlugEncoding) }

func Database() string { return v.GetString(keyDatabase) }
