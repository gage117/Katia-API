CREATE TYPE genre_type AS enum (
  '',
);

CREATE TABLE user_genres (
  user_id INTEGER REFERENCES user(id) ON DELETE CASCADE,
  genre genre_type
)