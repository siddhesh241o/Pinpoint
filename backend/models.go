package main

import (
	"github.com/gocql/gocql"
)

type Pin struct {
	PinID         gocql.UUID `json:"pin_id"`
	Message       string     `json:"message"`
	Latitude      float64    `json:"latitude"`
	Longitude     float64    `json:"longitude"`
	GeohashPrefix string     `json:"-"`
	CreationTime  int64      `json:"creation_time"`
}

type CreatePinRequest struct {
	Message   string  `json:"message"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	TTLHours  int     `json:"ttl_hours"`
}
