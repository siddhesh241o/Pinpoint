package main

import "github.com/gocql/gocql"


type Pin struct {
	PinID         gocql.UUID `json:"pin_id"`
	Title         string     `json:"title"` 
	Message       string     `json:"message"`
	Latitude      float64    `json:"latitude"`
	Longitude     float64    `json:"longitude"`
	GeohashPrefix string     `json:"-"`
	CreationTime  int64      `json:"creation_time"`
}


type CreatePinRequest struct {
	Title     string  `json:"title"` 
	Message   string  `json:"message"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	TTLHours  int     `json:"ttl_hours"`
}

type Comment struct {
	PinID        gocql.UUID `json:"pin_id"`
	CommentID    gocql.UUID `json:"comment_id"`
	UserID       gocql.UUID `json:"user_id"`
	Username     string     `json:"username"`
	CommentText  string     `json:"comment_text"`
	CreationTime int64      `json:"creation_time"`
}

type CreateCommentRequest struct {
	UserID      string `json:"user_id"`      
	Username    string `json:"username"`    
	CommentText string `json:"comment_text"`
}