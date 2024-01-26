package config

import "github.com/spf13/viper"

const (
	KeyBindAddr     = "bind_addr"
	KeySlugEncoding = "slug_encoding"
	KeyDBHost       = "db_host"
	KeyDBName       = "db_name"
	KeyDBUser       = "db_user"
	KeyDBPasswd     = "db_passwd"
	KeyUserAgent    = "user-agent"
)

func BindAddr() string { return viper.GetString(KeyBindAddr) }
func Encoding() string { return viper.GetString(KeySlugEncoding) }

func DBName() string    { return viper.GetString(KeyDBName) }
func DBUser() string    { return viper.GetString(KeyDBUser) }
func DBPasswd() string  { return viper.GetString(KeyDBPasswd) }
func DBHost() string    { return viper.GetString(KeyDBHost) }
func UserAgent() string { return viper.GetString(KeyUserAgent) }
