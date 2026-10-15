package handlers

import (
	"log/slog"
	"net/http"
	"workshop/internal/domain/sighting"
	"workshop/web/views/pages"
)

func Stats(logger *slog.Logger, sightings SightingsLister) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		items, err := sightings.List(ctx, sighting.ListFilter{})
		if err != nil {
			logger.ErrorContext(ctx, "handlers: listing sightings for stats: "+err.Error())
			renderError(ctx, w, logger, http.StatusInternalServerError, "Unable to load the stats.")
			return
		}

		render(ctx, w, logger, http.StatusOK, pages.Stats(items), "stats")
	}
}
