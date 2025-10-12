CREATE TABLE IF NOT EXISTS pinpoint.comments_by_pin (
    pin_id UUID,
    comment_id TIMEUUID,
    user_id UUID,
    username TEXT,
    comment_text TEXT,
    creation_time TIMESTAMP,
    PRIMARY KEY (pin_id, comment_id)
) WITH CLUSTERING ORDER BY (comment_id DESC);