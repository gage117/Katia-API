BEGIN;

TRUNCATE
  user,
  user_info,
  user_genres,
  user_platforms,
  user_matches
  RESTART IDENTITY CASCADE;