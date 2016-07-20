CREATE DATABASE IF NOT EXISTS reputech;
USE reputech;

DROP TABLE IF EXISTS login CASCADE;
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

DROP TABLE IF EXISTS auth CASCADE;
CREATE TABLE auth(
  u_id INTEGER,
  password CHAR(64) NOT NULL,
  privilege ENUM('Inactivated', 'Normal', 'Admin') NOT NULL, 
  
  PRIMARY KEY (u_id), 
  FOREIGN KEY (u_id) REFERENCES login(u_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS address_country CASCADE;
CREATE TABLE address_country (
  country_id SERIAL NOT NULL,
  country VARCHAR(50) NOT NULL,
  
  PRIMARY KEY (country_id), 
  UNIQUE KEY (country)
);

DROP TABLE IF EXISTS address_region CASCADE;
CREATE TABLE address_region (
  region_id SERIAL NOT NULL,
  country_id INTEGER NOT NULL,
  region VARCHAR(50) NOT NULL,
  
  PRIMARY KEY (region_id),  
  UNIQUE KEY (country_id, region),
  FOREIGN KEY (country_id) REFERENCES address_country(country_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS address_city CASCADE;
CREATE TABLE address_city (
  city_id SERIAL NOT NULL,
  region_id INTEGER NOT NULL,
  city VARCHAR(50) NOT NULL,
  
  PRIMARY KEY (city_id),  
  UNIQUE KEY (region_id, city),
  FOREIGN KEY (region_id) REFERENCES address_region(region_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
  u_id INTEGER,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  phone BIGINT UNSIGNED NOT NULL,
  address INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT '',
  
  PRIMARY KEY (u_id), 
  FOREIGN KEY (u_id) REFERENCES login(u_id) ON DELETE CASCADE,
  FOREIGN KEY (address) REFERENCES address_city(city_id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX (firstname, lastname)
);

DROP TABLE IF EXISTS user_images CASCADE;
CREATE TABLE user_images(
  img_url CHAR(16) NOT NULL,
  user_id INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  
  PRIMARY KEY (img_url), 
  FOREIGN KEY (user_id) REFERENCES users(u_id) ON DELETE CASCADE,
  
  INDEX (user_id, is_active)
);

DROP TABLE IF EXISTS followers CASCADE;
CREATE TABLE followers(
  followed INTEGER NOT NULL,
  follower INTEGER NOT NULL,
  
  PRIMARY KEY (followed,follower),
  FOREIGN KEY (followed) REFERENCES users(u_id) ON DELETE CASCADE,
  FOREIGN KEY (follower) REFERENCES users(u_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts(
  p_id SERIAL NOT NULL,
  poster INTEGER NOT NULL,
  content TEXT NOT NULL,
  privacy ENUM('All', 'Registered', 'High', 'Medium') NOT NULL,
  post_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (p_id),
  FOREIGN KEY (poster) REFERENCES users(u_id) ON DELETE CASCADE,
  
  INDEX (privacy)
);

DROP TABLE IF EXISTS post_images CASCADE;
CREATE TABLE post_images(
  img_url CHAR(16) NOT NULL,
  p_id INTEGER NOT NULL,
  
  PRIMARY KEY (img_url),
  FOREIGN KEY (p_id) REFERENCES posts(p_id) ON DELETE CASCADE  
);

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews(
  post INTEGER NOT NULL,
  reviewer INTEGER NOT NULL,
  content TINYTEXT NOT NULL,
  rating SMALLINT UNSIGNED NOT NULL,
  review_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (post, reviewer),
  FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
  FOREIGN KEY (reviewer) REFERENCES users(u_id) ON DELETE CASCADE,
  
  CHECK(rating > 0 AND rating < 6)
);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
   c_id SERIAL NOT NULL,
   post INTEGER NOT NULL,
   reply_to INTEGER DEFAULT NULL REFERENCES comments(c_id),
   commenter INTEGER NOT NULL,
   content TINYTEXT NOT NULL,
   comment_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   
   PRIMARY KEY (c_id),
   FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
   FOREIGN KEY (commenter) REFERENCES users(u_id) ON DELETE CASCADE,
   
   INDEX (reply_to)
);

DROP TABLE IF EXISTS likes CASCADE;
CREATE TABLE likes(
   post INTEGER NOT NULL,
   liker INTEGER NOT NULL,
   
   PRIMARY KEY(post, liker),
   FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
   FOREIGN KEY (liker) REFERENCES users(u_id) ON DELETE CASCADE  
);

DROP TABLE IF EXISTS wiki CASCADE;
CREATE TABLE wiki (
  w_id SERIAL NOT NULL,
  poster INTEGER NOT NULL,
  content TEXT NOT NULL,
  post_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (w_id),
  FOREIGN KEY (poster) REFERENCES users(u_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS reports CASCADE;
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

DROP TABLE IF EXISTS ip_bans CASCADE;
CREATE TABLE ip_bans (
  ip_address VARCHAR(16) NOT NULL,
  
  PRIMARY KEY (ip_address)
);
