# Pinpoint 📍

**Pinpoint** is a real-time, map-based community notice board designed to connect people with their immediate local surroundings. Users can drop "pins" on a map to share messages, alerts, or information with others nearby.

## ✨ Features

-   **Interactive Map:** Explore your neighborhood and see pins dropped by others in real-time using Leaflet.
-   **Nearby Discovery:** Automatically find pins near your current location or any searched area using efficient **Geohashing**.
-   **Temporary Pins:** Set a Time-to-Live (TTL) for your pins (from 1 to 72 hours), after which they automatically expire.
-   **Community Engagement:** Comment on pins to start discussions or provide updates.
-   **Search:** Quickly jump to different locations using the builtin search bar (powered by Nominatim).
-   **Anonymous Identity:** Automatic persistent user identity for seamless interaction.

## 🚀 Tech Stack

-   **Frontend:**
    -   [React 19](https://react.dev/)
    -   [Vite](https://vitejs.dev/)
    -   [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
    -   [Tailwind CSS](https://tailwindcss.com/)
-   **Backend:**
    -   [Go (Golang)](https://go.dev/)
    -   [Gocql](https://github.com/gocql/gocql) (Cassandra driver)
    -   [Geohash](https://github.com/mmcloughlin/geohash) (Geospatial indexing)
-   **Database:**
    -   [Apache Cassandra](https://cassandra.apache.org/) (Highly scalable distributed NoSQL database)
-   **Infrastructure:**
    -   [Docker Compose](https://docs.docker.com/compose/) (3-node Cassandra cluster)

## 🛠️ Architecture

Pinpoint uses a **Geohashing** strategy to efficiently query nearby pins. Earth's surface is divided into a grid, and each pin is assigned a geohash based on its coordinates. When a user requests nearby pins, the system queries the Cassandra database for pins matching the current geohash prefix and its eight neighbors.

The database is a **3-node Cassandra cluster** configured for high availability and low latency, ensuring that even under heavy load, pin discovery remains fast.

## 🏁 Getting Started

### Prerequisites

-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
-   [Go 1.22+](https://go.dev/dl/)
-   [Node.js & npm](https://nodejs.org/)

### Setup Instructions

1.  **Spin up the Cassandra Cluster:**
    ```bash
    docker-compose up -d
    ```
    *Wait a few moments for the nodes to become healthy.*

2.  **Initialize the Database Schema:**
    Run the CQL migrations in `backend/migrations/` against your local Cassandra instance. You can use `cqlsh`:
    ```bash
    cqlsh -f backend/migrations/000001_create_initial_schema.up.cql
    cqlsh -f backend/migrations/000002_add_titles_and_comments.up.cql
    cqlsh -f backend/migrations/000003_create_comments_table.up.cql
    ```

3.  **Start the Backend Server:**
    ```bash
    cd backend
    go run .
    ```
    The server will start on `http://localhost:5000`.

4.  **Start the Frontend Application:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Open your browser at `http://localhost:5173`.

## 📂 Project Structure

```text
Pinpoint/
├── backend/            # Go source code
│   ├── migrations/     # Cassandra CQL migrations
│   ├── main.go         # Entry point & server setup
│   ├── handler.go      # API endpoint logic
│   ├── models.go       # Data structures
│   └── geohash_utils.go # Geospatial utilities
├── frontend/           # React source code
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── utils/      # Helper functions (auth, etc.)
│   │   └── App.jsx     # Main application logic
│   └── index.html      # Entry point
└── docker-compose.yml  # Cassandra cluster configuration
```

## 📝 License

This project is licensed under the MIT License.
