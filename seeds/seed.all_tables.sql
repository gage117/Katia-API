BEGIN;

TRUNCATE
  users,
  user_info,
  user_genres,
  user_platforms,
  user_matches
  RESTART IDENTITY CASCADE;

INSERT INTO users (email, username, password)
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
  (2, 'Battle Royale'),
  (2, 'MMO'),
  (2, 'RPG'),
  (3, 'MOBA'),
  (3, 'FPS'),
  (3, 'MMO'),
  (4, 'Battle Royale'),
  (5, 'Racint'),
  (5, 'Simiulation'),
  (6, 'Action'),
  (6, 'Adventure'),
  (6, 'Horror'),
  (7, 'Sports'),
  (7, 'Racing'),
  (7, 'Platformer'),
  (8, 'RPG'),
  (8, 'FPS'),
  (9, 'Horror'),
  (9, 'MMO'),
  (9, 'MOBA'),
  (10, 'FPS'),
  (10, 'VR'),
  (10, 'Puzzle'),
  (11, 'Action'),
  (11, 'Adventure'),
  (11, 'Battle Royale');

INSERT INTO user_platforms (user_id, platform)
VALUES
  (1, 'PlayStation'),
  (1, 'PC')
  (2, 'PC'),
  (2, 'Xbox'),
  (3, 'Nintendo'),
  (3, 'PC'),
  (4, 'Xbox'),
  (4, 'PlayStation'),
  (5, 'PC'),
  (5, 'PlayStation'),
  (6, 'PC'),
  (6, 'Xbox'),
  (6, 'PlayStation'),
  (7, 'PC'),
  (7, 'PlayStation'),
  (8, 'Xbox'),
  (8, 'PlayStation'),
  (8, 'Nintendo'),
  (9, 'PC'),
  (9, 'Xbox'),
  (10, 'PC'),
  (11, 'PlayStation'),
  (11, 'Xbox');

INSERT INTO user_matches (user_id, match_user_id)
VALUES
  (1, 2),
  (1, 5),
  (1, 3),
  (1, 7),
  (2, 1),
  (2, 5),
  (2, 9),
  (3, 1),
  (3, 10),
  (4, 6), 
  (4, 10),
  (4, 11),
  (4, 2),
  (5, 10),
  (5, 1),
  (5, 3),
  (5, 9),
  (6, 11),
  (6, 5),
  (6, 8),
  (6, 2),
  (6, 4),
  (7, 11),
  (7, 2),
  (7, 12),
  (7, 9),
  (7, 5),
  (8, 10),
  (8, 5),
  (8, 3),
  (9, 10),
  (9, 4),
  (9, 2),
  (9, 4),
  (10, 9),
  (10, 11),
  (10, 5),
  (10, 3),
  (10, 7),
  (11, 10),
  (11, 9),
  (11, 5),
  (11, 2),
  (11, 7),
  (11, 8);
  
COMMIT;