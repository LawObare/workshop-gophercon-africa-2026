package handlers

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"uuid"
	"workshop/pkg/domain/sighting"
	"workshop/web/views/pages"
)

type SightingFinder interface {
	Find(ctx context.Context, id uuid.UUID) (sighting.Sighting, error)
}

func Sighting(logger *slog.Logger, sightings SightingFinder) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		id, err := uuid.Parse(r.PathValue("id"))
		if err != nil {
			render(ctx, w, logger, http.StatusNotFound, pages.NotFound(), "not found")
			return
		}

		s, err := sightings.Find(ctx, id)
		if errors.Is(err, sighting.ErrNotFound) {
			render(ctx, w, logger, http.StatusNotFound, pages.NotFound(), "not found")
			return
		} else if err != nil {
			logger.ErrorContext(ctx, "handlers: finding sighting: "+err.Error())
			renderError(ctx, w, logger, http.StatusInternalServerError, "Unable to load this sighting.")
			return
		}

		render(ctx, w, logger, http.StatusOK, pages.Sighting(s), "sighting")
	}
}
