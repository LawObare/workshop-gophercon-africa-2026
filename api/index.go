package handler

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"workshop/internal/clients/gbif"
	"workshop/internal/clients/openmeteo"
	"workshop/internal/domain/sighting"
	"workshop/internal/domain/sighting/stores/sightingsqlite"
	"workshop/internal/domain/species"
	"workshop/internal/domain/species/stores/speciessqlite"
	"workshop/internal/domain/weather"
	"workshop/internal/domain/weather/stores/weathersqlite"
	"workshop/internal/infra/config"
	db "workshop/internal/infra/db/sqlc"
	"workshop/internal/infra/db/sqlite"
	"workshop/web"
)

var (
	handler http.Handler
	once    sync.Once
	initErr error
)

func initApp() {
	ctx := context.Background()
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	// In serverless environments like Vercel (AWS Lambda), the root filesystem is read-only.
	// We copy workshop.db to /tmp/workshop.db on cold start so SQLite can operate safely without
	// locking or write-permission errors.
	tmpDB := "/tmp/workshop.db"
	if _, err := os.Stat(tmpDB); os.IsNotExist(err) {
		candidates := []string{
			"workshop.db",
			filepath.Join(os.Getenv("LAMBDA_TASK_ROOT"), "workshop.db"),
			"../workshop.db",
		}

		for _, srcPath := range candidates {
			if srcPath == "" {
				continue
			}
			if src, err := os.Open(srcPath); err == nil {
				if dst, err := os.Create(tmpDB); err == nil {
					_, _ = io.Copy(dst, src)
					_ = dst.Close()
				}
				_ = src.Close()
				break
			}
		}
	}

	dbURI := "file:" + tmpDB
	if _, err := os.Stat(tmpDB); os.IsNotExist(err) {
		// Fallback to direct read-only mode if copying wasn't possible
		dbURI = "file:workshop.db?mode=ro"
	}

	cfg := config.Config{
		Env:         config.Production,
		DatabaseURL: dbURI,
	}

	conn, err := sqlite.New(ctx, cfg.DatabaseURL)
	if err != nil {
		initErr = err
		return
	}

	queries := db.New(conn)
	speciesStore := speciessqlite.New(queries)
	speciesSvc := species.NewService(logger, speciesStore)
	weatherSvc := weather.NewService(logger, weathersqlite.New(queries))
	sightingSvc := sighting.NewService(
		logger,
		sightingsqlite.New(queries),
		speciesSvc,
		weatherSvc,
		gbif.New(gbif.BaseURL),
		openmeteo.New(openmeteo.BaseURL),
	)

	handler = web.New(logger, cfg, sightingSvc)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(initApp)
	if initErr != nil {
		http.Error(w, "Failed to initialize application: "+initErr.Error(), http.StatusInternalServerError)
		return
	}

	// Normalize URL path when Vercel rewrites wildcard routes
	if matched := r.Header.Get("x-matched-path"); matched != "" {
		if idx := strings.IndexByte(matched, '?'); idx != -1 {
			r.URL.Path = matched[:idx]
		} else {
			r.URL.Path = matched
		}
	} else if r.URL.Path == "/api" || r.URL.Path == "/api/index.go" || r.URL.Path == "" {
		r.URL.Path = "/"
	}

	handler.ServeHTTP(w, r)
}
