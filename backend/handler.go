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
				title,
				message,
				latitude,
				longitude,
				creation_time
			  ) VALUES (?, ?, ?, ?, ?, ?, ?) USING TTL ?`
	err := session.Query(
		query,
		geohashPrefix,
		pinID,
		req.Title,
		req.Message,
		req.Latitude,
		req.Longitude,
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
	query := `SELECT pin_id, latitude, longitude, title, message, creation_time FROM geohash_pins WHERE geohash_prefix = ?`
	for _, prefix := range prefixToQuery {
		wg.Add(1)
		go func(p string){
			defer wg.Done()
			iter := session.Query(query, p).Iter()
			var pin Pin
			var creationTime time.Time
			for iter.Scan(&pin.PinID, &pin.Latitude, &pin.Longitude, &pin.Title, &pin.Message, &creationTime){
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

func getCommentsHandler(w http.ResponseWriter, r *http.Request) {

	pinIDStr := r.PathValue("pin_id")
	pinID, err := gocql.ParseUUID(pinIDStr)
	if err != nil {
		http.Error(w, "Invalid pin ID format", http.StatusBadRequest)
		return
	}

	query := `SELECT pin_id, comment_id, user_id, username, comment_text, creation_time FROM comments_by_pin WHERE pin_id = ?`
	iter := session.Query(query, pinID).Iter()

	var comments []Comment
	var comment Comment
	var creationTime time.Time
	for iter.Scan(&comment.PinID, &comment.CommentID, &comment.UserID, &comment.Username, &comment.CommentText, &creationTime) {
		comment.CreationTime = creationTime.Unix()
		comments = append(comments, comment)
	}

	if err := iter.Close(); err != nil {
		log.Printf("Error getting comments for pin %s: %v", pinID, err)
		http.Error(w, "Failed to retrieve comments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(comments)
}


func createCommentHandler(w http.ResponseWriter, r *http.Request) {
	pinIDStr := r.PathValue("pin_id")
	pinID, err := gocql.ParseUUID(pinIDStr)
	if err != nil {
		http.Error(w, "Invalid pin ID format", http.StatusBadRequest)
		return
	}

	var req CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, err := gocql.ParseUUID(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	if req.CommentText == "" || req.Username == "" {
		http.Error(w, "Username and comment text cannot be empty", http.StatusBadRequest)
		return
	}

	commentID := gocql.TimeUUID()
	creationTime := time.Now()

	query := `INSERT INTO comments_by_pin (pin_id, comment_id, user_id, username, comment_text, creation_time) VALUES (?, ?, ?, ?, ?, ?)`
	if err := session.Query(
		query,
		pinID,
		commentID,
		userID,
		req.Username,
		req.CommentText,
		creationTime,
	).Exec(); err != nil {
		log.Printf("Error inserting comment for pin %s: %v", pinID, err)
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "comment created", "comment_id": commentID.String()})
}
