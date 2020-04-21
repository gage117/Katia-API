CREATE TABLE user_info (
  display_name TEXT NOT NULL,
  bio TEXT,
  lfm_in TEXT,
  avatar TEXT,
  user_id INTEGER REFERENCES user(id) ON DELETE CASCADE
);