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
	RunE:         func(cmd *cobra.Command, args []string) error { return reader.Run(cmd.Context()) },
	SilenceUsage: true,
}

func init() {
	cobra.OnInitialize(initConfig)

	fs := rootCmd.PersistentFlags()
	flags.String(fs, config.KeyBindAddr, "bind", "B", "127.0.0.1:8000", "bind address")
	flags.String(fs, config.KeySlugEncoding, "", "s", "", "slug encoding")
	flags.String(fs, config.KeyUserAgent, "", "A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0", "user agent")
	flags.String(fs, config.KeyDBHost, "", "H", "localhost", "database host")

	// 	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.cobra.yaml)")
	// 	rootCmd.PersistentFlags().StringP("author", "a", "YOUR NAME", "author name for copyright attribution")
	// 	rootCmd.PersistentFlags().StringVarP(&userLicense, "license", "l", "", "name of license for the project")
	// 	rootCmd.PersistentFlags().Bool("viper", true, "use Viper for configuration")
	// 	viper.BindPFlag("author", rootCmd.PersistentFlags().Lookup("author"))
	// 	viper.BindPFlag("useViper", rootCmd.PersistentFlags().Lookup("viper"))
	// 	viper.SetDefault("author", "NAME HERE <EMAIL ADDRESS>")
	// 	viper.SetDefault("license", "apache")

	// rootCmd.AddCommand(addCmd)
	// rootCmd.AddCommand(initCmd)
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
