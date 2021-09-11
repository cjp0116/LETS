-- DROP DATABASE workout_buddy;
-- CREATE DATABASE workout_buddy;
-- \connect workout_buddy;

-- DROP TABLE IF EXISTS users_measurements;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS posts_comments_comments;
-- DROP TABLE IF EXISTS posts_comments;
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS users_friends;
-- DROP TABLE IF EXISTS users;

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY UNIQUE,
  email TEXT NOT NULL CHECK (position('@' IN email) > 1),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  posted_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW() 
);

CREATE TABLE posts_comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  posted_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE posts_comments_comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts (id) ON DELETE CASCADE,
  post_comments_id INT REFERENCES posts_comments (id) ON DELETE CASCADE,
  posted_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sent_by VARCHAR(25) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  sent_to VARCHAR(25) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE users_measurements (
  id SERIAL PRIMARY KEY,
  created_by VARCHAR(25) REFERENCES users (username)
    ON DELETE CASCADE,
  height_in_inches FLOAT CHECK (height_in_inches >= 0.0)
    DEFAULT 0.0,
  weight_in_pounds FLOAT CHECK(weight_in_pounds >= 0.0)
    DEFAULT 0.0,
  arms_in_inches FLOAT CHECK(arms_in_inches >= 0.0)
    DEFAULT 0.0,
  legs_in_inches FLOAT CHECK(legs_in_inches >= 0.0)
    DEFAULT 0.0,
  waist_in_inches FLOAT CHECK(waist_in_inches >= 0.0)
    DEFAULT 0.0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE users_friends (
  user_from  VARCHAR(25) REFERENCES users ON DELETE CASCADE,
  user_to VARCHAR(25) REFERENCES users ON DELETE CASCADE,
  request_time TIMESTAMP NOT NULL DEFAULT NOW(),
  confirmed INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_from, user_to)
);

CREATE TABLE image_files (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts (id) ON DELETE CASCADE,
  username VARCHAR(25) REFERENCES users (username) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size BIGINT NOT NULL
);