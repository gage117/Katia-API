BEGIN;

TRUNCATE
  user,
  user_info,
  user_genres,
  user_platforms,
  user_matches
  RESTART IDENTITY CASCADE;

INSERT INTO user (email, username, password)
VALUES
  ('gamerdude22@test.com', 'gamerdude22', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('lonelygamer69@test.com', 'lonelygamer69', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('player63@test.com', 'player63', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('iliketrains@test.com', 'iliketrains', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),     
  ('player3@test.com', 'player2', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('yellowbanana@test.com', 'yellowbanana', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('yikes@test.com', 'yikes', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('idkwhatimdoing@test.com', 'idkwhatimdoing', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('gaming4life@test.com', 'gaming4life', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),
  ('gamesrfun@test.com', 'gamesrfun', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K'),    
  ('player1@test.com', 'player1', '$2a$12$Pkxp8JTF90HG6gYbIKJiiuzPjBHSOcpe1oUY6c1ESHcZ0ISUHmm0K');

INSERT INTO user_info (display_name, bio, lfm_in, avatar, user_id)
VALUES
  ('gamerdude22', 'I like games dude', 'Fortnite', '<base64 string here>', 1),
  ('lonelygamer69', 'I need friends', 'Minecraft', '<base64 string here>', 2),
  ('player63', 'I like playing games', 'COD Warzone', '<base64 string here>', 3),
  ('iliketrains', 'I like trains', 'Fortnite', '<base64 string here>', 4),
  ('player3', 'I like playing games', 'CSGO', '<base64 string here>', 5),
  ('yellowbanana', 'I like bananas', 'COD Modern Warfare', '<base64 string here>', 6),
  ('yikes', 'oof', 'Destiny 2', '<base64 string here>', 7),
  ('idkwhatimdoing', 'what is going on', 'COD Warzone', '<base64 string here>', 8),
  ('gaming4life', 'gaming is life', 'CSGO', '<base64 string here>', 9),
  ('gamesrfun', 'games are fun', 'Fortnite', '<base64 string here>', 10),
  ('player1', 'i like playing', 'Minecraft', '<base64 string here>', 11);

INSERT INTO user_genres (user_id, genre)
VALUES
  (1, 'Battle Royale'),
  (1, 'FPS'),
  (1, '')