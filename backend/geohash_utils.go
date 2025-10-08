package main

import (
	"github.com/mmcloughlin/geohash"
)

const (
	geohashPrecision = 6
)

func getGeohashPrefix(lat, lon float64) string {
	return geohash.Encode(lat, lon)[:geohashPrecision]
}
