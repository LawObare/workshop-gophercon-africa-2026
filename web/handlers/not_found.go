package handlers

import (
	"log/slog"
	"net/http"
	"workshop/web/views/pages"
)

func NotFound(logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		render(r.Context(), w, logger, http.StatusNotFound, pages.NotFound(), "not found")
	}
}
