package main

import (
	"github.com/spf13/cobra"
	"github.com/whitekid/goxp/flags"

	"reader"
	"reader/config"
	"reader/db"
)

var rootCmd = &cobra.Command{
	Use:   "reader",
	Short: "readibility viewer",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if _, err := db.Open(); err != nil {
			return err
		}

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		return reader.Run(cmd.Context())
	},
	SilenceUsage: true,
}

func init() {
	cobra.OnInitialize(initConfig)

	fs := rootCmd.PersistentFlags()
	flags.String(fs, config.KeyBindAddr, "bind", "B", "127.0.0.1:8000", "bind address")
	flags.String(fs, config.KeySlugEncoding, "slug-encoding", "s", "", "slug encoding")
	flags.String(fs, config.KeyUserAgent, "user-agent", "A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0", "user agent")
	flags.String(fs, config.KeyDBHost, "db-host", "H", "localhost", "database host")
}

func initConfig() {
	// 	if cfgFile != "" {
	// 		// Use config file from the flag.
	// 		viper.SetConfigFile(cfgFile)
	// 	} else {
	// 		// Find home directory.
	// 		home, err := os.UserHomeDir()
	// 		cobra.CheckErr(err)

	// 		// Search config in home directory with name ".cobra" (without extension).
	// 		viper.AddConfigPath(home)
	// 		viper.SetConfigType("yaml")
	// 		viper.SetConfigName(".cobra")
	// }

	// viper.SetEnvPrefix("rd")
	// viper.AutomaticEnv()

	//	if err := viper.ReadInConfig(); err == nil {
	//		fmt.Println("Using config file:", viper.ConfigFileUsed())
	//	}
}
