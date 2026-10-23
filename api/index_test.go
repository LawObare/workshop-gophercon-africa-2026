package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEmbeddedDB(t *testing.T) {
	assert.NotEmpty(t, embeddedDB)
	assert.Greater(t, len(embeddedDB), 100000)
}

func TestHandler(t *testing.T) {
	tests := []struct {
		name         string
		url          string
		headers      map[string]string
		expectedCode int
	}{
		{
			name:         "Home page direct",
			url:          "/",
			expectedCode: http.StatusOK,
		},
		{
			name:         "Gallery page direct",
			url:          "/gallery",
			expectedCode: http.StatusOK,
		},
		{
			name:         "Spot page direct",
			url:          "/spot",
			expectedCode: http.StatusOK,
		},
		{
			name:         "Static asset css",
			url:          "/assets/css/app.css",
			expectedCode: http.StatusOK,
		},
		{
			name: "Vercel rewritten root with x-matched-path",
			url:  "/api/index.go",
			headers: map[string]string{
				"x-matched-path": "/",
			},
			expectedCode: http.StatusOK,
		},
		{
			name: "Vercel rewritten gallery with x-matched-path",
			url:  "/api/index.go",
			headers: map[string]string{
				"x-matched-path": "/gallery",
			},
			expectedCode: http.StatusOK,
		},
		{
			name: "Vercel rewritten asset with x-matched-path",
			url:  "/api/index.go",
			headers: map[string]string{
				"x-matched-path": "/assets/css/app.css",
			},
			expectedCode: http.StatusOK,
		},
		{
			name: "Vercel rewritten gallery with x-matched-path and query params",
			url:  "/api/index.go?page=2",
			headers: map[string]string{
				"x-matched-path": "/gallery?page=2",
			},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Vercel rewritten root fallback without header",
			url:          "/api/index.go",
			expectedCode: http.StatusOK,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tc.url, nil)
			for k, v := range tc.headers {
				req.Header.Set(k, v)
			}
			rec := httptest.NewRecorder()

			Handler(rec, req)

			assert.Equal(t, tc.expectedCode, rec.Code)
		})
	}
}
