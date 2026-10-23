package handlers_test

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"workshop/pkg/common/logs"
	"workshop/pkg/domain/sighting"
	"workshop/pkg/domain/species"
	"workshop/web/handlers"

	"github.com/stretchr/testify/assert"
)

func TestSpot(t *testing.T) {
	t.Parallel()

	t.Run("Default zebra", func(t *testing.T) {
		t.Parallel()

		got := serveSpot(t, fakeLister{items: []sighting.Sighting{
			{GBIFKey: 1, Species: species.Species{VernacularName: "plains zebra"}},
		}}, "/spot")
		assert.Equal(t, http.StatusOK, got.Code)
		assert.Equal(t, "text/html; charset=utf-8", got.Header().Get("Content-Type"))
	})

	t.Run("With animal parameter", func(t *testing.T) {
		t.Parallel()

		got := serveSpot(t, fakeLister{items: []sighting.Sighting{
			{GBIFKey: 2, Species: species.Species{VernacularName: "cheetah"}},
		}}, "/spot?animal=cheetah")
		assert.Equal(t, http.StatusOK, got.Code)
		assert.Equal(t, "text/html; charset=utf-8", got.Header().Get("Content-Type"))
	})
}

func serveSpot(t *testing.T, lister handlers.SightingsLister, target string) *httptest.ResponseRecorder {
	t.Helper()

	logger := logs.NewProduction(io.Discard, slog.LevelError)
	rec := httptest.NewRecorder()
	handlers.Spot(logger, lister)(rec, httptest.NewRequestWithContext(t.Context(), http.MethodGet, target, nil))

	return rec
}
