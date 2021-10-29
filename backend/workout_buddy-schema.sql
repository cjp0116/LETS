CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY UNIQUE,
  email TEXT NOT NULL CHECK (position('@' IN email) > 1),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_image TEXT DEFAULT NULL,
  cover_picture TEXT DEFAULT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(34) NOT NULL,
  created_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE participants (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  room_id INT REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sent_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  text TEXT NOT NULL,
  room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  created_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  color TEXT NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE calendar_event (
  id SERIAL PRIMARY KEY,
  posted_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  radios TEXT NOT NULL
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  posted_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  image TEXT DEFAULT NULL 
);

CREATE TABLE posts_comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  posted_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE DEFAULT NULL,
  comment_id INT REFERENCES posts_comments(id) ON DELETE CASCADE DEFAULT NULL,
  username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE posts_comments_comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts (id) ON DELETE CASCADE,
  post_comments_id INT REFERENCES posts_comments (id) ON DELETE CASCADE,
  posted_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
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

CREATE TYPE noti_type AS ENUM ('friend_request', 'message', 'comment', 'like');

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY, 
    is_seen BOOLEAN NOT NULL DEFAULT FALSE,
    sent_by VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE NOT NULL,
    sent_to VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE NOT NULL,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    comment_id INT REFERENCES posts_comments(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notification_type noti_type,
    sender_profile_image TEXT DEFAULT NULL,
    seen_date TIMESTAMP DEFAULT NULL
);

CREATE OR REPLACE FUNCTION Del() 
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS $$
  BEGIN
    DELETE FROM notifications WHERE seen_date IS NOT NULL AND seen_date < NOW() - INTERVAL '30 days';
    RETURN NULL;
  END;
$$;


CREATE TRIGGER del_old_notifications 
  AFTER UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE Del();

