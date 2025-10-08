package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gocql/gocql"
)

const (
	maxTTLHours     = 72
	minTTLHours     = 1
	defaultTTLHours = 24
)

func createPinHandler(w http.ResponseWriter, r *http.Request) {
	var req CreatePinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
	}
	userTTL := req.TTLHours
	if userTTL > maxTTLHours || userTTL < minTTLHours {
		log.Printf("Invalid ttl provided of %d hours, falling back to default", req.TTLHours)
		userTTL = defaultTTLHours
	}

	ttlSeconds := userTTL * 3600
	pinID := gocql.TimeUUID()
	creationTime := time.Now()
	geohashPrefix := getGeohashPrefix(req.Latitude, req.Longitude)
	query := `INSERT INTO geohash_pins (
				geohash_prefix,
				pin_id,
				latitude,
				longitude,
				message,
				creation_time
			  ) VALUES (?, ?, ?, ?, ?, ?) USING TTL ?`
	err := session.Query(
		query,
		geohashPrefix,
		pinID,
		req.Latitude,
		req.Longitude,
		req.Message,
		creationTime,
		ttlSeconds,
	).Exec()
	if err != nil {
		log.Printf("Error inserting pin: %v", err)
		http.Error(w, "Failed to create pin", http.StatusInternalServerError)
		return
	}
	log.Printf("Successfully created pin: %s", pinID.String())
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(http.StatusCreated)
	response := map[string]string{
		"status": "pin created",
		"pin_id": pinID.String(),
	}
	json.NewEncoder(w).Encode(response)
}

func getNearbyPinsHandler(w http.ResponseWriter, r *http.Request) {

}
