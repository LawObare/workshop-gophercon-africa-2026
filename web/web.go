package web

import (
	"embed"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"workshop/pkg/domain/sighting"
	"workshop/pkg/infra/config"
	"workshop/web/handlers"
)

//go:generate go tool templ generate ./...

// assets holds the static files served under /assets.
// Note: The embedded paths keep their "assets/" prefix.
//
//go:embed assets
var assets embed.FS

// New returns a ServeMux serving the static assets and handler's patterns.
func New(logger *slog.Logger, config config.Config, sightingsSvc *sighting.Service) *http.ServeMux {
	mux := http.NewServeMux()

	fileServer := http.FileServerFS(assetsFs(config.IsProduction()))
	mux.Handle("GET /assets/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		fileServer.ServeHTTP(w, r)
	}))
	mux.Handle("GET /{$}", handlers.Home(logger, sightingsSvc))
	mux.Handle("GET /sightings/{id}", handlers.Sighting(logger, sightingsSvc))
	mux.Handle("GET /gallery", handlers.Gallery(logger, sightingsSvc))
	mux.Handle("GET /spot", handlers.Spot(logger, sightingsSvc))
	mux.Handle("/", handlers.NotFound(logger))

	return mux
}

func assetsFs(prod bool) fs.FS {
	if prod {
		return assets
	}
	return os.DirFS("web")
}
