package main

import (
	"github.com/gocql/gocql"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

var session *gocql.Session

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func init() {
	var err error
	if err = godotenv.Load(); err != nil {
		log.Printf(".env file not found, default used: %v\n", err)
	}
	cluster := gocql.NewCluster("127.0.0.1:9042", "127.0.0.1:9043", "127.0.0.1:9044")
	cluster.Keyspace = "pinpoint"
	cluster.Consistency = gocql.Quorum
	cluster.PoolConfig.HostSelectionPolicy = gocql.TokenAwareHostPolicy(gocql.DCAwareRoundRobinPolicy("datacenter1"))
	session, err = cluster.CreateSession()
	if err != nil {
		log.Fatalf("Failed to connect to Cassandra on startup: %v", err)
	}
	log.Println("Successfully connected to Cassandra cluster")
}

func main() {
	log.Println("Starting backend server")
	port := os.Getenv("PORT")
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/pins", createPinHandler)
	mux.HandleFunc("GET /api/pins/nearby", getNearbyPinsHandler)
	mux.HandleFunc("GET /api/pins/{pin_id}/comments", getCommentsHandler)
	mux.HandleFunc("POST /api/pins/{pin_id}/comments", createCommentHandler)
	handlerWithCORS := corsMiddleware(mux)
	log.Fatal(http.ListenAndServe(":"+port, handlerWithCORS))
	defer session.Close()
}
