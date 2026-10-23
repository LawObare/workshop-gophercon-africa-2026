package handlers

import (
	"log/slog"
	"net/http"
	"strings"
	"workshop/pkg/domain/sighting"
	"workshop/pkg/domain/species"
	"workshop/web/views/pages"
)

// Spot renders the animal photo identifier, silhouette challenge, and sightings match page.
func Spot(logger *slog.Logger, sightings SightingsLister) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		animalParam := strings.TrimSpace(r.URL.Query().Get("animal"))

		var chosen species.Animal
		var items []sighting.Sighting
		var err error

		if animalParam != "" {
			if parsed, parseErr := species.ParseAnimal(animalParam); parseErr == nil {
				chosen = parsed
				items, err = sightings.List(ctx, sighting.ListFilter{
					Animals: []species.Animal{chosen},
					Limit:   60,
				})
				if err != nil {
					logger.ErrorContext(ctx, "handlers: listing sightings for spot: "+err.Error())
				}
			}
		}

		// If no animal requested or none found, provide initial popular sample if available
		if chosen == "" {
			chosen = species.AnimalZebra
			items, _ = sightings.List(ctx, sighting.ListFilter{
				Animals: []species.Animal{chosen},
				Limit:   30,
			})
		}

		// Also load a broad sample of sightings so the Safari Silhouette Challenge has diverse species with photos
		allSample, _ := sightings.List(ctx, sighting.ListFilter{
			Limit: 150,
		})

		render(ctx, w, logger, http.StatusOK, pages.Spot(pages.SpotProps{
			Chosen:        chosen,
			Sightings:     items,
			QuizSightings: allSample,
			All:           species.Animals(),
		}), "spot")
	}
}
