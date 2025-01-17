package config

import (
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

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

func InitFlags(fs *pflag.FlagSet) {
	// flags.String(fs, KeyBindAddr, "bind", "B", "127.0.0.1:8000", "bind address")
	// flags.String(fs, KeySlugEncoding, "slug-encoding", "s", "", "slug encoding")
	// flags.String(fs, KeyUserAgent, "user-agent", "A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0", "user agent")
	// flags.String(fs, KeyDBHost, "host", "H", "localhost", "database host")
}

func String(flags *pflag.FlagSet, key string, name string, shorthand string, value string, usage string) (r *string) {
	r = flags.StringP(name, shorthand, value, usage)
	viper.BindPFlag(key, flags.Lookup(name))

	return
}


func init() {
	viper.SetEnvPrefix("rd")
	viper.AutomaticEnv()
}
