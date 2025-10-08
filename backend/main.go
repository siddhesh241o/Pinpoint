package main

import(
	"os"
	"log"
	"net/http"
	"github.com/joho/godotenv"
	"github.com/gocql/gocql"
)
var session *gocql.Session

func init(){
	var err error
	if err = godotenv.Load(); err != nil {
		log.Printf(".env file not found, default used: %v\n", err)
	}
	cluster := gocql.NewCluster("127.0.0.1:9042", "127.0.0.1:9043", "127.0.0.1:9044")
	cluster.Keyspace = "pinpoint"
	cluster.Consistency = gocql.Quorum
	session, err = cluster.CreateSession()
	if err != nil {
		log.Fatalf("Failed to connect to Cassandra: %v", err)
	}
	log.Println("Successfully connected to Cassandra cluster")
}

func main(){
	log.Println("Starting backend server")
	port := os.Getenv("PORT")
	mux := http.NewServeMux()
	log.Fatal(http.ListenAndServe(":"+port, mux))
	defer session.Close()
}