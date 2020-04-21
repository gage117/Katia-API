CREATE TYPE platform_type AS ENUM (
  'PlayStation',
  'Xbox',
  'PC',
  'Switch'
);

CREATE TABLE user_platforms (
  user_id INTEGER REFERENCES user(id) ON DELETE CASCADE;
  platform platform_type
);