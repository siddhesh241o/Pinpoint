package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
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
	latStr := r.URL.Query().Get("lat")
	lonStr := r.URL.Query().Get("lon")
	if(latStr == "" || lonStr == ""){
		http.Error(w, "Missing lat, lon parameters", http.StatusBadRequest)
		return
	}
	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		http.Error(w, "Invalid lat paramter", http.StatusBadRequest)
		return
	}
	lon, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		http.Error(w, "Invalid lon parameter", http.StatusBadRequest)
		return
	}
	currentPrefix := getGeohashPrefix(lat, lon)
	prefixToQuery := getNeighbouringGeoHashes(currentPrefix)
	log.Printf("Querying for geohash prefixes: %v", prefixToQuery)
	var wg sync.WaitGroup
	pinChan := make(chan Pin, 100)
	query := `SELECT pin_id, latitude, longitude, message, creation_time FROM geohash_pins WHERE geohash_prefix = ?`
	for _, prefix := range prefixToQuery {
		wg.Add(1)
		go func(p string){
			defer wg.Done()
			iter := session.Query(query, p).Iter()
			var pin Pin
			var creationTime time.Time
			for iter.Scan(&pin.PinID, &pin.Latitude, &pin.Longitude, &pin.Message, &creationTime){
				pin.CreationTime = creationTime.Unix()
				pinChan <- pin
			}
			if err := iter.Close(); err != nil {
				log.Printf("Error querying prefix %s: %v",p, err)
			}
		}(prefix)
	}
	wg.Wait()
	close(pinChan)
	allPins := []Pin{}
	for pin := range pinChan {
		allPins = append(allPins, pin)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(allPins)
}
