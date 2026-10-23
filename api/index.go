package handler

import (
	"context"
	_ "embed"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"workshop/pkg/clients/gbif"
	"workshop/pkg/clients/openmeteo"
	"workshop/pkg/domain/sighting"
	"workshop/pkg/domain/sighting/stores/sightingsqlite"
	"workshop/pkg/domain/species"
	"workshop/pkg/domain/species/stores/speciessqlite"
	"workshop/pkg/domain/weather"
	"workshop/pkg/domain/weather/stores/weathersqlite"
	"workshop/pkg/infra/config"
	db "workshop/pkg/infra/db/sqlc"
	"workshop/pkg/infra/db/sqlite"
	"workshop/web"
)

//go:embed workshop.db
var embeddedDB []byte

var (
	handler http.Handler
	once    sync.Once
	initErr error
)

func initApp() {
	ctx := context.Background()
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	// In serverless environments like Vercel (AWS Lambda), the root filesystem is read-only.
	// We extract our embedded workshop.db to /tmp/workshop.db on cold start so SQLite can
	// operate safely with read-write capabilities.
	tmpDB := "/tmp/workshop.db"
	if _, err := os.Stat(tmpDB); os.IsNotExist(err) {
		if len(embeddedDB) > 0 {
			if err := os.WriteFile(tmpDB, embeddedDB, 0644); err != nil {
				logger.Error("failed to write embedded DB to /tmp: " + err.Error())
			}
		}

		// Fallback to local files if embeddedDB was somehow not present
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
