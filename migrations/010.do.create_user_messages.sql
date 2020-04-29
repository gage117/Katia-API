CREATE TABLE user_messages (
  id SERIAL NOT NULL PRIMARY KEY,
  sender INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT now()
);