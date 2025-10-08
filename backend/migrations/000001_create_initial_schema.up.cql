
CREATE TABLE IF NOT EXISTS pinpoint.geohash_pins(
    geohash_prefix TEXT,
    pin_id     TIMEUUID,
    latitude   DOUBLE,
    longitude  DOUBLE,
    message    TEXT,
    creation_time TIMESTAMP,
    PRIMARY KEY (geohash_prefix, pin_id)
);