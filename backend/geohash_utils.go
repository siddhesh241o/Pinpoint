package main

import (
	"github.com/mmcloughlin/geohash"
)

const (
	geohashPrecision = 5
)

func getGeohashPrefix(lat, lon float64) string {
	return geohash.Encode(lat, lon)[:geohashPrecision]
}

func getNeighbouringGeoHashes(prefix string) []string{
	neighbours := geohash.Neighbors(prefix)
	return append(neighbours, prefix)
}	