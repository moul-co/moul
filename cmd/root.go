package cmd

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/blang/semver"
	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/fsnotify/fsnotify"
	"github.com/gobuffalo/helpers/iterators"
	"github.com/gobuffalo/helpers/text"
	"github.com/gobuffalo/plush"
	"github.com/gosimple/slug"
	"github.com/moulco/moul/internal"
	"github.com/rhysd/go-github-selfupdate/selfupdate"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	// Version constant
	Version = "3.0.0-beta.6"
)

var (
	output string
)

func getTemplate(moulConfig *viper.Viper, dir string) string {
	slugName := slug.Make(moulConfig.GetString("profile.name"))
	t := internal.Template()
	ctx := plush.NewContext()

	cover := internal.GetPhotos(filepath.Join(dir, "photos", "cover"))
	coverName := filepath.Base(cover[0])
	avatar := internal.GetPhotos(filepath.Join(dir, "photos", "avatar"))
	avatarName := filepath.Base(avatar[0])

	ctx.Set("md", text.Markdown)
	ctx.Set("between", iterators.Between)
	ctx.Set("toString", func(i int) string {
		return strconv.Itoa(i)
	})
	ctx.Set("joinPath", func(path, i string) string {
		return filepath.Join(path, i)
	})
	ctx.Set("getPhotos", internal.GetPhotoDev)
	ctx.Set("isProd", false)
	ctx.Set("version", Version)
	ctx.Set("base", "/")
	ctx.Set("favicon", moulConfig.Get("favicon"))
	ctx.Set("style", moulConfig.Get("style"))
	ctx.Set("profile", moulConfig.Get("profile"))
	ctx.Set("by", "")
	ctx.Set("avatar", avatarName)

	ctx.Set("cover", map[string]string{
		"name": coverName,
	})
	ctx.Set("content", moulConfig.Get("content"))
	ctx.Set("section", moulConfig.Get("section"))
	ctx.Set("slugName", slugName)

	ctx.Set("social", moulConfig.Get("social"))
	ctx.Set("measurementId", moulConfig.Get("ga_measurement_id"))

	ts, err := plush.Render(t, ctx)
	if err != nil {
		log.Fatal(err)
	}

	return ts
}

func previewFunc(cmd *cobra.Command, args []string) {
	v := semver.MustParse(Version)
	latest, found, _ := selfupdate.DetectLatest("moulco/moul")
	if found && !latest.Version.LTE(v) {
		color.Yellow("Newer version is available for update.")
		fmt.Print("Update to latest version by:")
		color.Green(" moul update\n\n")
	}
	s := spinner.New(spinner.CharSets[21], 100*time.Millisecond)
	s.Prefix = "■ Starting dev server... "
	s.Start()
	time.Sleep(1 * time.Second)
	dir, err := internal.GetDirectory()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	moulConfig := viper.New()
	moulConfig.SetConfigName("moul")
	moulConfig.SetDefault("ga_measurement_id", "")
	moulConfig.SetDefault("favicon", "false")
	moulConfig.SetDefault("content", map[string]string{})
	moulConfig.AddConfigPath(".")
	err = moulConfig.ReadInConfig()
	if err != nil {
		fmt.Printf("Fatal error config file: %s \n", err)
	}

	var ts string
	moulConfig.WatchConfig()
	moulConfig.OnConfigChange(func(e fsnotify.Event) {
		fmt.Print("    ◆ Config file changed:")
		color.HiBlack(" `%s`", filepath.Base(e.Name))
		ts = getTemplate(moulConfig, dir)
		fmt.Print("    ◆ Rebuilt:")
		color.HiBlack(" http://localhost:5000/")
	})
	ts = getTemplate(moulConfig, dir)

	fs := http.FileServer(http.Dir(filepath.Join(".", ".moul", "assets")))
	photoFolder := http.FileServer(http.Dir("photos"))

	http.Handle("/assets/", http.StripPrefix("/assets/", fs))
	http.Handle("/photos/", http.StripPrefix("/photos/", photoFolder))
	if moulConfig.GetBool("favicon") == true {
		favicon := http.FileServer(http.Dir("favicon"))
		http.Handle("/favicon/", http.StripPrefix("/favicon/", favicon))
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Length", strconv.Itoa(len(ts)))
		w.Write([]byte(ts))
	})
	s.Stop()
	fmt.Print("● Preview: ")
	color.Green("http://localhost:5000/")
	color.HiBlack("\n`Ctrl + C` to quit!")
	http.ListenAndServe(":5000", nil)
}

// Execute func
func Execute() {
	var rootCmd = &cobra.Command{
		Use:   "moul",
		Short: "The minimalist publishing tool for photographers",
		Run: func(cmd *cobra.Command, args []string) {
			previewFunc(cmd, args)
		},
	}
	var previewCmd = &cobra.Command{
		Use:   "preview",
		Short: "Preview photo collection",
		Run: func(cmd *cobra.Command, args []string) {
			previewFunc(cmd, args)
		},
	}

	Export.Flags().StringVar(&output, "o", "dist", "output directory")

	rootCmd.AddCommand(Create)
	rootCmd.AddCommand(Export)
	rootCmd.AddCommand(Update)
	rootCmd.AddCommand(VersionCmd)
	rootCmd.AddCommand(previewCmd)

	if err := rootCmd.Execute(); err != nil {
		log.Println(err)
		os.Exit(1)
	}
}
