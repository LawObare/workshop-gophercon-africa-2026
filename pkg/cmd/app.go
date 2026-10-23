package cmd

import (
	"context"
	"database/sql"
	"log/slog"
	"os"
	"workshop/pkg/clients/gbif"
	"workshop/pkg/clients/openmeteo"
	"workshop/pkg/common/logs"
	"workshop/pkg/common/printer"
	"workshop/pkg/domain/sighting"
	"workshop/pkg/domain/sighting/stores/sightingsqlite"
	"workshop/pkg/domain/species"
	"workshop/pkg/domain/species/stores/speciessqlite"
	"workshop/pkg/domain/weather"
	"workshop/pkg/domain/weather/stores/weathersqlite"
	"workshop/pkg/infra/config"
	"workshop/pkg/infra/db/sqlite"
	"workshop/migrations"

	"github.com/pressly/goose/v3"

	db "workshop/pkg/infra/db/sqlc"
)

type app struct {
	Config     config.Config
	Logger     *slog.Logger
	DB         *sql.DB
	Printer    *printer.Console
	Migrations *goose.Provider
	Sightings  *sighting.Service
	Species    *species.Service
	Weather    *weather.Service

	// live is set by --live, when GBIF and Open-Meteo are the real APIs
	// rather than the local mock.
	live bool
}

// ensureAPIs starts the local mock API if the app uses it and it isn't
// running yet. Only commands that call GBIF or Open-Meteo ask, so make web
// and the rest never start a server they don't need.
func (a *app) ensureAPIs(ctx context.Context) error {
	if a.live {
		return nil
	}
	return ensureLocalMock(ctx, a.Printer)
}

func bootstrap(ctx context.Context, cfg config.Config, level slog.Level, live bool) (*app, func(), error) {
	teardown := func() {}

	logger := logs.NewLocal(os.Stderr, level)

	conn, err := sqlite.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return nil, teardown, err
	}
	teardown = func() {
		if err := conn.Close(); err != nil {
			logger.ErrorContext(ctx, "closing database: "+err.Error())
		}
	}

	migrate, err := migrations.New(conn)
	if err != nil {
		return nil, teardown, err
	}

	queries := db.New(conn)
	speciesStore := speciessqlite.New(queries)
	gbifURL, openMeteoURL := localGBIFBaseURL, localOpenMeteoBaseURL
	if live {
		gbifURL, openMeteoURL = gbif.BaseURL, openmeteo.BaseURL
	}
	openm := openmeteo.New(openMeteoURL)

	speciesSvc := species.NewService(logger, speciesStore)
	weatherSvc := weather.NewService(logger, weathersqlite.New(queries))
	sightingSvc := sighting.NewService(logger,
		sightingsqlite.New(queries),
		speciesSvc,
		weatherSvc,
		gbif.New(gbifURL),
		openm,
	)

	return &app{
		Config:     cfg,
		Logger:     logger,
		DB:         conn,
		Migrations: migrate,
		Printer:    printer.New(os.Stdout),
		Sightings:  sightingSvc,
		Species:    speciesSvc,
		Weather:    weatherSvc,
		live:       live,
	}, teardown, nil
}
