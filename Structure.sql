DROP DATABASE IF EXISTS reputech;
CREATE DATABASE reputech;
USE reputech;

DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS auth CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS address CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS user_imgs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS post_imgs CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS wiki CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

CREATE TABLE login(
  u_id SERIAL PRIMARY KEY NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  user_type ENUM('Normal', 'Facebook', 'Twitter', 'GitHub') NOT NULL
);

CREATE TABLE auth(
  u_id INTEGER PRIMARY KEY,
  password VARCHAR(128) NOT NULL,
  privilege ENUM('Inactivated', 'Normal', 'Admin') NOT NULL, 
  CONSTRAINT fk_auth_u_id FOREIGN KEY (u_id) REFERENCES login(u_id) ON DELETE CASCADE
);


CREATE TABLE address(
  a_id SERIAL PRIMARY KEY NOT NULL,
  country VARCHAR(50) NOT NULL,
  province VARCHAR(50) NOT NULL, 
  city VARCHAR(50) NOT NULL,
  KEY address_key(country, province, city)
);

CREATE TABLE users(
  u_id INTEGER PRIMARY KEY,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  status TEXT NOT NULL,
  phone BIGINT UNSIGNED NOT NULL,
  address INTEGER,
  active_img TEXT DEFAULT NULL,
  CONSTRAINT fk_users_u_id FOREIGN KEY (u_id) REFERENCES login(u_id) ON DELETE CASCADE,
  CONSTRAINT fk_users_a_id FOREIGN KEY (address) REFERENCES address(a_id) ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE user_imgs(
  u_id INTEGER NOT NULL,
  img_url VARCHAR(128) NOT NULL UNIQUE,
  CONSTRAINT fk_user_imgs_u_id FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE  
);

CREATE TABLE followers(
  followed INTEGER NOT NULL,
  follower INTEGER NOT NULL,
  PRIMARY KEY (followed,follower),
  CONSTRAINT fk_followers_followed FOREIGN KEY (followed) REFERENCES users(u_id) ON DELETE CASCADE,
  CONSTRAINT fk_followers_follower FOREIGN KEY (follower) REFERENCES users(u_id) ON DELETE CASCADE
);

CREATE TABLE posts(
  p_id SERIAL NOT NULL PRIMARY KEY,
  poster INTEGER NOT NULL,
  content TEXT NOT NULL,
  privacy ENUM('All', 'Registered', 'High', 'Medium') NOT NULL,   
  CONSTRAINT fk_posts_poster FOREIGN KEY (poster) REFERENCES users(u_id) ON DELETE CASCADE
);

CREATE TABLE post_imgs(
  p_id INTEGER NOT NULL,
  img_url VARCHAR(128) NOT NULL UNIQUE,
  CONSTRAINT fk_post_imgs_p_id FOREIGN KEY (p_id) REFERENCES posts(p_id) ON DELETE CASCADE  
);

CREATE TABLE reviews(
  post INTEGER NOT NULL,
  reviewer INTEGER NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER UNSIGNED NOT NULL CHECK(rating < 6),
  review_time TIMESTAMP NOT NULL,
  PRIMARY KEY(post, reviewer),
  CONSTRAINT fk_reviews_post FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
  CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer) REFERENCES users(u_id) ON DELETE CASCADE  
);

CREATE TABLE comments(
   post INTEGER NOT NULL,
   commenter INTEGER NOT NULL,
   content TEXT NOT NULL,
   comment_time TIMESTAMP NOT NULL,
   CONSTRAINT fk_comments_post FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
   CONSTRAINT fk_comments_commenter FOREIGN KEY (commenter) REFERENCES users(u_id) ON DELETE CASCADE  
);

CREATE TABLE likes(
   post INTEGER NOT NULL,
   liker INTEGER NOT NULL,
   PRIMARY KEY(post, liker),
   CONSTRAINT fk_likes_post FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE,  
   CONSTRAINT fk_likes_liker FOREIGN KEY (liker) REFERENCES users(u_id) ON DELETE CASCADE  
);

CREATE TABLE wiki (
  poster INTEGER NOT NULL,
  content TEXT NOT NULL,
  post_time TIMESTAMP NOT NULL,
  CONSTRAINT fk_wiki_poster FOREIGN KEY (poster) REFERENCES users(u_id) ON DELETE CASCADE
);

CREATE TABLE reports (
  reported INTEGER NOT NULL,
  reporter INTEGER NOT NULL,
  post INTEGER NOT NULL,
  report_time TIMESTAMP NOT NULL,
  PRIMARY KEY (reported, reporter),
  CONSTRAINT fk_reports_reported FOREIGN KEY (reported) REFERENCES users(u_id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter) REFERENCES users(u_id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_post FOREIGN KEY (post) REFERENCES posts(p_id) ON DELETE CASCADE
);
