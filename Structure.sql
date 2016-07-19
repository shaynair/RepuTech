DROP DATABASE IF EXISTS reputech;
CREATE DATABASE reputech;
USE reputech;

DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS auth CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS address CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS user_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS post_images CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS wiki CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS ip_bans CASCADE;

CREATE TABLE login(
  u_id SERIAL NOT NULL,
  email VARCHAR(100) NOT NULL,
  user_type ENUM('Normal', 'Facebook', 'Twitter', 'Google', 'GitHub') NOT NULL,
  creation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  banned BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address VARCHAR(16) NOT NULL,
  
  PRIMARY KEY (u_id),
  UNIQUE KEY (email)
);

CREATE TABLE auth(
  u_id INTEGER,
  password CHAR(64) NOT NULL,
  privilege ENUM('Inactivated', 'Normal', 'Admin') NOT NULL, 
  
  PRIMARY KEY (u_id), 
  FOREIGN KEY (u_id) REFERENCES login(u_id) ON DELETE CASCADE
);


CREATE TABLE address(
  a_id SERIAL NOT NULL,
  country VARCHAR(50) NOT NULL,
  province VARCHAR(50) NOT NULL, 
  city VARCHAR(50) NOT NULL,
  
  PRIMARY KEY (a_id), 
  UNIQUE KEY address_key (country, province, city)
);

CREATE TABLE users(
  u_id INTEGER,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  phone BIGINT UNSIGNED NOT NULL,
  address INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT '',
  
  PRIMARY KEY (u_id), 
  FOREIGN KEY (u_id) REFERENCES login(u_id) ON DELETE CASCADE,
  FOREIGN KEY (address) REFERENCES address(a_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE user_images(
  img_url CHAR(16) NOT NULL,
  user_id INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  
  PRIMARY KEY (img_url), 
  FOREIGN KEY (user_id) REFERENCES users(u_id) ON DELETE CASCADE  
);

CREATE ASSERTION IF NOT EXISTS active_image_check 
	CHECK (NOT EXISTS(SELECT user_id
						FROM user_images 
						WHERE is_active = 1
						GROUP BY user_id 
						HAVING COUNT(img_url) > 1))

CREATE TABLE followers(
  followed INTEGER NOT NULL,
  follower INTEGER NOT NULL,
  
  PRIMARY KEY (followed,follower),
  FOREIGN KEY (followed) REFERENCES users(u_id) ON DELETE CASCADE,
  FOREIGN KEY (follower) REFERENCES users(u_id) ON DELETE CASCADE
);

CREATE TABLE posts(
  p_id SERIAL NOT NULL,
  poster INTEGER NOT NULL,
  content TEXT NOT NULL,
  privacy ENUM('All', 'Registered', 'High', 'Medium') NOT NULL,   
  post_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (p_id),
  FOREIGN KEY (poster) REFERENCES users(u_id) ON DELETE CASCADE
);

CREATE TABLE post_images(
  img_url CHAR(16) NOT NULL,
  p_id INTEGER NOT NULL,
  
  PRIMARY KEY (img_url),
  FOREIGN KEY (p_id) REFERENCES posts(p_id) ON DELETE CASCADE  
);

CREATE TABLE reviews(
  post INTEGER NOT NULL,
  reviewer INTEGER NOT NULL,
  content TEXT NOT NULL,
  rating SMALLINT UNSIGNED NOT NULL,
  review_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (post, reviewer),
  FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
  FOREIGN KEY (reviewer) REFERENCES users(u_id) ON DELETE CASCADE,
  
  CHECK(rating > 0 AND rating < 6)
);

CREATE TABLE comments (
   c_id SERIAL NOT NULL,
   post INTEGER NOT NULL,
   reply_to INTEGER DEFAULT NULL REFERENCES comments(c_id),
   commenter INTEGER NOT NULL,
   content TEXT NOT NULL,
   comment_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   
   PRIMARY KEY (c_id),
   FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
   FOREIGN KEY (commenter) REFERENCES users(u_id) ON DELETE CASCADE  
);

CREATE TABLE likes(
   post INTEGER NOT NULL,
   liker INTEGER NOT NULL,
   
   PRIMARY KEY(post, liker),
   FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
   FOREIGN KEY (liker) REFERENCES users(u_id) ON DELETE CASCADE  
);

CREATE TABLE wiki (
  w_id SERIAL NOT NULL,
  poster INTEGER NOT NULL,
  content TEXT NOT NULL,
  post_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (w_id),
  FOREIGN KEY (poster) REFERENCES users(u_id) ON DELETE CASCADE
);

CREATE TABLE reports (
  reported INTEGER NOT NULL,
  reporter INTEGER NOT NULL,
  post INTEGER NOT NULL,
  report_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (reported, reporter),
  FOREIGN KEY (reported) REFERENCES users(u_id) ON DELETE CASCADE,
  FOREIGN KEY (reporter) REFERENCES users(u_id) ON DELETE CASCADE,
  FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE
);

CREATE TABLE ip_bans (
  ip_address VARCHAR(16) NOT NULL,
  
  PRIMARY KEY (ip_address)
);
