package config

import (
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/whitekid/goxp/flags"
)

const (
	keyBind         = "bind_addr"
	keySlugEncoding = "slug_encoding"
	keyDBHost       = "db_host"
	keyDBName       = "db_name"
	keyDBUser       = "db_user"
	keyDBPasswd     = "db_passwd"
	keyUserAgent    = "user-agent"
)

var configs = map[string][]flags.Flag{
	"reader": {
		{keyBind, "B", "127.0.0.1:8000", "bind address"},
		{keySlugEncoding, "s", "", "slug encoding"},
	},
}

var persistentConfigs = map[string][]flags.Flag{
	"reader": {
		{keyUserAgent, "", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0", ""},
		{keyDBHost, "H", "localhost", "database host"},
	},
}

var v *viper.Viper

func init() {
	v = viper.GetViper()
	v.SetEnvPrefix("rd")
	v.AutomaticEnv()

	flags.InitDefaults(v, configs)
	flags.InitDefaults(v, persistentConfigs)
}

func InitFlagSet(use string, cmd *cobra.Command) {
	flags.InitFlagSet(v, configs, use, cmd.Flags())
	flags.InitFlagSet(v, persistentConfigs, use, cmd.PersistentFlags())
}

func BindAddr() string { return v.GetString(keyBind) }
func Encoding() string { return v.GetString(keySlugEncoding) }

func DBName() string    { return v.GetString(keyDBName) }
func DBUser() string    { return v.GetString(keyDBUser) }
func DBPasswd() string  { return v.GetString(keyDBPasswd) }
func DBHost() string    { return v.GetString(keyDBHost) }
func UserAgent() string { return v.GetString(keyUserAgent) }
