CREATE TYPE platform_type AS ENUM (
  'PlayStation',
  'Xbox',
  'PC',
  'Nintendo'
);

CREATE TABLE user_platforms (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  platform platform_type NOT NULL
);