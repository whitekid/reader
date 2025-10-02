package config

import (
	"github.com/spf13/viper"
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

var v *viper.Viper

func init() {
	v = viper.GetViper()
	v.SetEnvPrefix("rd")
	v.AutomaticEnv()

	// Set defaults
	v.SetDefault(keyBind, "127.0.0.1:8000")
	v.SetDefault(keySlugEncoding, "")
	v.SetDefault(keyUserAgent, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0")
	v.SetDefault(keyDBHost, "localhost")
}

func BindAddr() string { return v.GetString(keyBind) }
func Encoding() string { return v.GetString(keySlugEncoding) }

func DBName() string    { return v.GetString(keyDBName) }
func DBUser() string    { return v.GetString(keyDBUser) }
func DBPasswd() string  { return v.GetString(keyDBPasswd) }
func DBHost() string    { return v.GetString(keyDBHost) }
func UserAgent() string { return v.GetString(keyUserAgent) }
