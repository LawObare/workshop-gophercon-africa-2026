package handlers

import (
	"log/slog"
	"net/http"
	"workshop/internal/domain/sighting"
	"workshop/web/views/pages"
)

func Gallery(logger *slog.Logger, sightings SightingsLister) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		items, err := sightings.List(ctx, sighting.ListFilter{Limit: 500})
		if err != nil {
			logger.ErrorContext(ctx, "handlers: listing sightings for the gallery: "+err.Error())
			renderError(ctx, w, logger, http.StatusInternalServerError, "Unable to load the gallery.")
			return
		}

		render(ctx, w, logger, http.StatusOK, pages.Gallery(items), "gallery")
	}
}
