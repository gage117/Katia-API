CREATE TABLE user (
  id SERIAL,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  date_joined TIMESTAMP NOT NULL DEFAULT now()
);