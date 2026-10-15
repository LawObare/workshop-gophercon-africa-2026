package handlers

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/a-h/templ"
)

// render writes page as HTML with status, falling back to the error page if rendering fails.
func render(ctx context.Context, w http.ResponseWriter, logger *slog.Logger, status int, page templ.Component, what string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	if err := page.Render(ctx, w); err != nil {
		logger.ErrorContext(ctx, "handlers: rendering "+what+": "+err.Error())
	}
}
