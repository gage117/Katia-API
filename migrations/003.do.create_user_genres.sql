CREATE TYPE genre_type AS enum (
  'Battle Royale',
  'FPS'
);

CREATE TABLE user_genres (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  genre genre_type NOT NULL
);