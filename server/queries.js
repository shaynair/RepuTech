// This file handles the database queries.
const fs = require('graceful-fs');
const async = require("async");

const c = require("./constants");
const logger = require("./logger");
const auth = require("./auth");

module.exports = function (pool, sessionStore) {
	return {
		// Checks if database is initialized. If it isn't, initialize it.
		checkAndInitialize: function () {
			// Postgres has a neat little function to check if a table exists
			this.query("SELECT to_regclass($1);", ["login"], (info) => {

				if (!info || info.rows.length == 0 || !info.rows[0]) { 
					// No table found, execute SQL
					this.initializeDatabase();
				}
			});
		},

		// Initializes and repopulates a database.
		initializeDatabase: function (cb) {
			logger.logInfo("Re-populating database...");

			// Destroy sessions first
			this.query("SELECT sessionID FROM login WHERE sessionID IS NOT NULL", [], 
																		(data) => {

				for (let d of data.rows) {
					sessionStore.destroy(d.sessionID, (err) => {
						logger.logError(err);
					});
				}
				logger.logInfo("Executing queries...");
				this.query(fs.readFileSync(c.SQL_INIT_PATH).toString(), [], () => {
					this.register(c.ADMIN_LOGIN, 'Normal', c.ADMIN_PASS, 'Admin', () => {
						logger.logInfo("Finished executing queries.");
						if (cb) {
							cb();
						}
					});
				});
			});
		},

		// Returns an associative array of countries to IDs
		getCountries: function (cb) {
			this.query("SELECT * FROM address_country", [], (countries) => {
				let ret = {};
				for (let row of countries.rows) {
					ret[row.country] = row.country_id;
				}
				cb(ret);
			});
		},

		// Returns an associative array of states to IDs
		getStates: function (country_id, cb) {
			this.query(
				"SELECT region, region_id FROM address_region WHERE country_id = $1", 
												[country_id], (states) => {
				let ret = {};
				for (let row of states.rows) {
					ret[row.region] = row.region_id;
				}
				cb(ret);
			});
		},

		// Returns a country
		getCountry: function (id, cb) {
			this.query("SELECT country FROM address_country WHERE country_id = $1", 
																[id], (countries) => {
				if (countries && countries.rows.length != 0) {
					cb(countries.rows[0].country);
				} else {
					cb("");
				}
			});
		},

		// Returns a state
		getState: function (country_id, region_id, cb) {
			this.query(
				"SELECT region FROM address_region WHERE country_id = $1 AND region_id = $2", 
													[country_id, region_id], (states) => {
				if (states && states.rows.length != 0) {
					cb(states.rows[0].region);
				} else {
					cb("");
				}
			});
		},

		// Helper: executes a simple query (no callback)
		simpleQuery: function (query, params) {
			this.query(query, params);
		},

		// Executes a query and delivers the result.
		query: function (query, params, cb) {
			pool.query(query, params, (err, res) => {
				logger.logError(err);
				if (cb) {
					cb(res);
				}
			});
		},

		// Destroys a session in session store
		destroySession: function (sID, cb) {
			this.query("UPDATE login SET sessionID = NULL WHERE sessionID = $1", [sID],
				() => {
					sessionStore.destroy(sID, (err) => {
						logger.logError(err);
						if (cb) {
							cb();
						}
					});
				});
		},

		// Return a user object if success, otherwise error code
		register: function (email, user_type, firstname, lastname, password = null, privilege = 'Normal', cb) {
			// Check if exists
			let hashedPassword = password;
			if (password) {
				hashedPassword = auth.hash(password);
			}
			// Get user from database
			this.query("SELECT u_id FROM login WHERE email = $1", [email], (users) => {
				if (users && users.rows.length != 0) { // EXISTS
					if (cb) {
						cb(0);
					}
					return;
				}

				// Add to database
				this.query(
					"INSERT INTO login (email, user_type, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING u_id", 
														[email, user_type, firstname, lastname], (users) => {

					if (!users || users.rows.length != 1 || users.rows[0].u_id <= 0) {
						if (cb) {
							cb(-1); // Unknown error.
						}
						return;
					}
					let u_id = users.rows[0].u_id;

					if (user_type == 'Normal') {
						// Add normal user
						this.simpleQuery(
							"INSERT INTO auth (u_id, password, privilege) VALUES ($1, $2, $3)", 
								[u_id, hashedPassword, privilege]);
					}
					if (cb) {
						cb({
							"firstname": firstname,
							"lastname": lastname,
							"email": email,
							"id": u_id,
							"is_admin": privilege == "Admin",
							"type": user_type,
							"banned": false,
							"info": false
						});
					}
				});
			});
		},

		// Activates a user
		activateUser: function (u_id, cb) {
			this.query("UPDATE auth SET privilege = 'Normal' WHERE " +
				"u_id = $1 AND privilege = 'Inactivated'", [u_id], cb);
		},
		// Bans a user
		banUser: function (u_id, origin, cb) {
			this.query("UPDATE login SET banned = TRUE WHERE " +
				"u_id = $1 AND u_id != $2", [u_id, origin], cb);
			this.destroyUserSession(u_id);
		},

		// Edits user info
		editUser: function (u_id, firstname, lastname, phone, region_id, city, job,
											status, ipaddr, sID, cb) {
			// Check if exists
			this.query("SELECT u_id FROM users WHERE u_id = $1", [u_id], (users) => {

				if (users && users.rows.length != 0) { // EXISTS
					this.simpleQuery("UPDATE users SET " +
						"phone = $1, region_id = $2, city = $3, job = $4, status = $5 WHERE u_id = $6", 
							[phone, region_id, city, job, status, u_id]);
				} else { // ADD NEW ENTRY
					this.simpleQuery("INSERT INTO users (u_id, " +
						"phone, region_id, city, job, status) VALUES ($1, $2, $3, $4, $5, $6)", 
							[u_id, phone, region_id, city, job, status]);
				}

				this.simpleQuery(
					"UPDATE login SET firstname = $1, lastname = $2, "
						+ "ip_address = $3, sessionID = $4 WHERE u_id = $3", 
						[firstname, lastname, ipaddr, sID, u_id]);
				if (cb) {
					cb();
				}
			});
		},

		// Adds image to profile
		addImage: function (u_id, url, cb) {
			this.query(
				"INSERT INTO user_images (u_id, img_url) VALUES ($1, $2) RETURNING is_active", 
														[u_id, url], (images) => {

				if (images && images.rows.length != 0) { // EXISTS
					cb(true);
				} else {
					cb(false);
				}
			});
		},

		// Adds image to post
		addPostImage: function (u_id, p_id, url, cb) {
			// Check if valid
			this.query(
				"SELECT p_id FROM posts WHERE poster = $1 AND p_id = $2", 
												[u_id, p_id], (posts) => {

				if (!posts || posts.rows.length == 0) {
					cb(false);
					return;
				}
				// Exists, now add
				this.query(
					"INSERT INTO post_images (p_id, img_url) VALUES ($1, $2) RETURNING p_id", 
															[p_id, url], (images) => {

					if (images && images.rows.length != 0) { // EXISTS
						cb(true);
					} else {
						cb(false);
					}
				});
			});

		},
		
		// Sets main profile image
		setImage: function (u_id, url, cb) {
			this.query(
				"UPDATE user_images SET is_active = TRUE WHERE u_id = $1 AND img_url = $2", 
																		[u_id, url], () => {

				this.simpleQuery(
					"UPDATE user_images SET is_active = FALSE WHERE u_id = $1 AND img_url != $2", 
						[u_id, url]);

				cb(true);

			});
		},

		// Deletes a profile image
		deleteImage: function (u_id, url, cb) {
			this.query("DELETE FROM user_images WHERE u_id = $1 AND img_url = $2", 
													[u_id, url], (images) => {
				cb(true);
			});
		},

		// Return true on success
		changeSettings: function (u_id, firstname, lastname, phone, city, job,
							status, region_id, ipaddr, sID, pass, oldpass, cb) {
				
			this.editUser(u_id, firstname, lastname, phone, region_id, city, job,
												status, ipaddr, sID, () => {

				if (pass && oldpass) {
					this.query("SELECT * FROM auth WHERE u_id = $1", [u_id], (users) => {

						if (!users || users.rows.length == 0) { // NOT FOUND
							cb(false);
							return;
						}

						let u = users.rows[0]; // email is UNIQUE KEY

						// Check password
						auth.compare(oldpass, u.password, (res) => {
							if (!res) { // WRONG PASSWORD
								cb(false);
								return;
							}

							this.simpleQuery("UPDATE auth SET password = $1 WHERE u_id = $2", 
								[auth.hash(pass), u_id]);
							cb(true);
						});
					});

				} else {
					cb(true);
				}

			});
		},

		// Returns token on success
		resetPassStart: function (email, cb) {
			let token = auth.generatePassword();
			this.query("SELECT u_id, user_type FROM login WHERE email = $1", 
							[email], (users) => {
				if (!users || users.rows.length != 1) {
					cb(null);
					return;
				}
				
				let u = users.rows[0];
				if (u.banned || u.user_type != "Normal") {
					cb(null); // Invalid - no password
					return;
				}
				this.query("UPDATE auth SET reset_token = $1, reset_time = NOW() WHERE u_id = $2", 
								[token, u.u_id], (users) => {

					cb(token);
				});
			});

		},

		resetPassEnd: function (token, cb) {
			this.query("SELECT * FROM auth WHERE reset_token = $1", [token], (users) => {
				if (!users || users.rows.length == 0) { // NOT FOUND
					if (cb) {
						cb(null);
					}
					return;
				}
				let u = users.rows[0];
				if (Math.round(((new Date()) - u.reset_time)) / (24 * 60 * 60 * 1000) <
					1) {
					// Less than one day has passed
					this.simpleQuery(
						"UPDATE auth SET reset_time = NULL, reset_token = NULL, " +
						"password = $1 WHERE u_id = $2", [auth.hash(token), u.u_id]);

					cb(token);
				} else {
					this.simpleQuery(
						"UPDATE auth SET reset_time = NULL, reset_token = NULL " +
						"WHERE reset_token = $1", [token]);
					cb(null);
				}

				destroyUserSession(u.id);
			});
		},
		
		destroyUserSession: function (u_id) {
			// Release session if online
			this.query("SELECT sessionID FROM login WHERE u_id = $1", [u_id], 
																(users) => {
				if (users && users.rows.length != 0) { // EXISTS
					this.destroySession(users.rows[0].sessionID);
				}
			});
		},

		// Returns a user object if email and pass are right, otherwise error code
		logIn: function (email, pass, ipaddr, sID, cb) {

			// Get user from database
			this.query(
				"SELECT * FROM auth LEFT JOIN login USING (u_id) WHERE email = $1", 
													[email], (users) => {
				if (!users || users.rows.length == 0) { // NOT FOUND
					if (cb) {
						cb(0);
					}
					return;
				}
				let u = users.rows[0]; // email is UNIQUE KEY

				if (u.banned) { // BANNED USER
					if (cb) {
						cb(1);
					}
					return;
				}
				if (u.privilege == "Inactivated" || u.user_type != "Normal") {
					if (cb) {
						cb(2); // NOT ACTIVATED
					}
					return;
				}
				// Check password
				auth.compare(pass, u.password, (res) => {
					if (!res) { // WRONG PASSWORD
						if (cb) {
							cb(0);
						}
						return;
					}
					this.innerLogIn(u.u_id, email, u.user_type, u.privilege == "Admin",
						u.firstname, u.lastname, u.sessionID, sID, ipaddr, cb);
				});
			});
		},
		
		updateLogin: function (u_id, ipaddr, newSID) {
			this.simpleQuery("UPDATE login SET login_time = NOW(), " +
				"ip_address = $1, sessionID = $2 WHERE u_id = $3", [ipaddr, newSID, u_id]);
		},

		// Helper function for logging in. Updates IP and session IDs.
		innerLogIn: function (u_id, email, type, admin, firstname, lastname, oldSID, newSID, ipaddr, cb) {
			// Destroy the old session
			if (oldSID) {
				this.destroySession(oldSID);
			}
			// Update login time
			this.updateLogin(u_id, ipaddr, newSID);

			this.getUserData(u_id, (info) => {
				cb({
					"firstname": firstname,
					"lastname": lastname,
					"email": email,
					"id": u_id,
					"is_admin": admin,
					"type": type,
					"banned": false,
					"info": info
				});
			});
		},

		// Resolves detailed information of a user.
		getUserData: function (u_id, cb) {
			// Try to get detailed data

			this.query("SELECT * FROM users " +
				"LEFT JOIN address_region USING (region_id) " +
				"LEFT JOIN address_country USING (country_id) WHERE u_id = $1", [u_id],
																(users) => {

				if (users && users.rows.length > 0) {
					let u = users.rows[0];
					let info = {
						"phone": u.phone,
						"city": u.city,
						"status": u.status,
						"region": u.region,
						"country": u.country,
						"job": u.job,
						"followers": 0,
						"rating": 0,
						"img": "",
						"filled": true,
						"images": []
					};

					this.query(
						"SELECT COUNT(follower) AS c FROM followers WHERE followed = $1", 
																[u_id], (users) => {
						if (users && users.rows.length > 0) {
								// Follower Count
							info.followers = users.rows[0].c;
						}

						this.query(
							"SELECT rating, review_time FROM posts p LEFT JOIN reviews r ON r.post = p.p_id WHERE poster = $1", 
																						[u_id], (users) => {
							if (users && users.rows.length > 0) {
								// Average rating
								info.rating = users.rows.reduce((prev, row) => {
									return prev + row.rating;
								}, 0);
								info.rating /= users.rows.length;
								info.rating = Math.round(info.rating);
							}
							// Get images
							this.query("SELECT img_url, is_active FROM user_images WHERE u_id = $1", 
																		[u_id], (users) => {
								if (users && users.rows.length > 0) {
									for (let row of users.rows) {
										if (row.is_active) {
											info.img = row.img_url;
										}
										info.images.push(row.img_url);
									}
								}
								cb(info);
							});

						});
					});
				} else {
					// No data found
					cb({
						"phone": '',
						"city": 'Unknown City',
						"status": '',
						"region": 'Unknown Region',
						"country": 'Unknown',
						"job": '',
						"followers": 0,
						"rating": 0,
						"img": "",
						"filled": false,
						"images": []
					});
				}
			});
		},

		// Gets wikis by user.
		getWikiData: function (u_id, cb) {
			this.query(
				"SELECT title, content FROM wiki WHERE poster = $1 ORDER BY post_time DESC", 
												[u_id], (wikis) => {

				let info = [];
				if (wikis && wikis.rows.length > 0) {
					info = wikis.rows;
				}
				cb(info);
			});
		},


		// Get messages by user.
		getMessageData: function (u_id, cb) {
			this.query(
				"SELECT * FROM messages WHERE sender = $1 OR receiver = $2 ORDER BY message_time DESC", 
															[u_id, u_id], (msgs) => {
				let tasks = {}; // Build the user names
				if (msgs && msgs.rows.length > 0) {
					for (let row of msgs.rows) {
						let other = row.sender;
						if (other == u_id) {
							other = row.receiver;
						}
						if (!(other in tasks)) {
							tasks[other] = (ret) => {
								this.getUserName(other, (name) => ret(null, name));
							};
						}
					}
				}

				// Execute all tasks then return
				async.parallel(tasks, (err, results) => {
					let ret = {};
					// Build conversation threads
					for (let user in results) {
						ret[user] = {
							name: results[user],
							messages: []
						};
						for (let row of msgs.rows) {
							if (row.sender == user || row.receiver == user) {
								ret[user].messages.push({
									sender: row.sender,
									content: row.content
								});
							}
						}
					}
					cb(ret);
				});
			});
		},

		// Tries to follow another user. Return true on success
		tryFollow: function (u_id, other, cb) {
			this.query("SELECT * FROM followers WHERE follower = $1 AND followed = $2", 
												[u_id, other], (users) => {
				if (users && users.rows.length > 0) {
					cb(false);
				} else {
					this.simpleQuery(
						"INSERT INTO followers (follower, followed) VALUES($1, $2)", 
							[u_id,other]);
					cb(true);
				}
			});
		},
		
		// Tries to like a post. Return true on success
		tryLike: function (p_id, u_id, cb) {
			this.query("SELECT * FROM likes WHERE post = $1 AND liker = $2", 
											[p_id, u_id], (users) => {
				if (users && users.rows.length > 0) {
					cb(false);
				} else {
					this.simpleQuery("INSERT INTO likes (post, liker) VALUES($1, $2)", 
						[p_id, u_id]);
					cb(true);
				}
			});
		},

		// Tries to review a post. Return true on success
		tryReview: function (p_id, u_id, content, rate, cb) {
			if (rate < 1 || rate > 5) {
				cb(false);
				return;
			}
			this.query("SELECT * FROM reviews WHERE post = $1 AND reviewer = $2", 
														[p_id, u_id], (users) => {
				if (users && users.rows.length > 0) {
					cb(false);
				} else {
					this.simpleQuery(
						"INSERT INTO reviews (post, reviewer, content, rating) VALUES($1, $2, $3, $4)", 
							[p_id, u_id, content, rate]);
					cb(true);
				}
			});
		},

		// Tries to comment on a post. Return true on success
		tryComment: function (p_id, u_id, content, to, cb) {
			if (to > 0) {
				// Do not allow nesting
				this.query(
					"SELECT * FROM comments WHERE post = $1 AND c_id = $2 AND reply_to IS NULL", 
														[p_id, to], (users) => {
					if (users && users.rows.length > 0) {
						this.simpleQuery(
							"INSERT INTO comments (post, commenter, content, reply_to) VALUES($1, $2, $3, $4)", [
								p_id, u_id, content, to
							]);
						cb(true);
					} else {
						// Does not exist
						cb(false);
					}
				});
			} else {
				// reply_to is NULL
				this.simpleQuery(
					"INSERT INTO comments (post, commenter, content) VALUES($1, $2, $3)", [
						p_id, u_id, content
					]);
				cb(true);
			}

		},
		
		// Adds a wiki post. Return true on success
		addWiki: function (u_id, title, content, cb) {
			this.query(
				"INSERT INTO wiki (poster, title, content) VALUES ($1, $2, $3) RETURNING w_id", 
					[u_id, title, content], (wikis) => {
				if (wikis && wikis.rows.length > 0) {
					cb(true);
				} else {
					cb(false);
				}
			});
		},

		// Adds a new listing. Return true on success
		addPost: function (u_id, title, content, privacy, urgency, is_offer, cb) {
			if (is_offer) {
				urgency = 0;
			} else if (!urgency) {
				urgency = 1;
			}
			this.query(
				"INSERT INTO posts (poster, title, content, urgency, privacy) VALUES ($1, $2, $3, $4, $5) RETURNING p_id", 
											[u_id, title, content, urgency, privacy], (posts) => {
				if (posts && posts.rows.length > 0) {
					cb(true);
				} else {
					cb(false);
				}
			});
		},


		// Adds a new message. Return true on success
		addMessage: function (u_id, to, content, cb) {
			this.query(
				"INSERT INTO messages (receiver, sender, content) VALUES ($1, $2, $3) RETURNING m_id", 
													[to, u_id, content], (msgs) => {
				if (msgs && msgs.rows.length > 0) {
					cb(true);
				} else {
					cb(false);
				}
			});
		},

		// Returns a user object if email and type are right, otherwise error code
		logInThirdParty: function (email, user_type, cb) {

			// Get user from database
			this.query("SELECT * FROM login WHERE email = $1", [email], (users) => {

				if (!users || users.rows.length == 0) { // NOT FOUND
					if (cb) {
						cb(0);
					}
					return;
				}

				let u = users.rows[0]; // email is UNIQUE KEY

				if (u.banned) { // BANNED USER
					if (cb) {
						cb(1);
					}
					return;
				}
				if (u.user_type != user_type) {
					if (cb) {
						cb(2); // Unknown error
					}
					return;
				}

				this.innerLogIn(u.u_id, email, user_type, false, u.firstname, u.lastname,
					u.sessionID, u.sessionID, u.ip_address, cb);

			});
		},

		// Returns a user object if u_id are right, otherwise null
		getUser: function (u_id, cb) {

			// Get user from database
			this.query("SELECT * FROM login WHERE u_id = $1", [u_id], (users) => {

				if (!users || users.rows.length != 1 || users.rows[0].banned) { // NOT FOUND
					if (cb) {
						cb(null);
					}
					return;
				}

				let u = users.rows[0]; // UNIQUE KEY
				u.id = u_id;
				u.is_admin = false;
				u.activated = true;

				// Check for privilege type
				this.query("SELECT * FROM auth WHERE u_id = $1", [u_id], (users) => {
					if (users && users.rows.length == 1) {
						u.is_admin = users.rows[0].privilege == "Admin";
					}

					// Get as much data as we can
					this.getUserData(u_id, (info) => {
						u.info = info;
						cb(u);
					});
				});
			});
		},

		// Returns a user string if u_id are right, otherwise null
		getUserName: function (u_id, cb) {

			// Get user from database
			this.query("SELECT firstname, lastname FROM login WHERE u_id = $1", [u_id],
				(users) => {

					if (!users || users.rows.length != 1) { // NOT FOUND
						cb("");
						return;
					}

					let u = users.rows[0]; // UNIQUE KEY

					cb(u.firstname + " " + u.lastname);
				});
		},


		// Get posts by a query
		searchPosts: function (user, query, cb) {
			query = query.toLowerCase();
			this.query(
				"SELECT p_id FROM posts WHERE LOWER(content) LIKE $1 OR LOWER(title) LIKE $2 ORDER BY post_time DESC", 
										["%" + query + "%", "%" + query + "%"], (posts) => {

				let ret = [];
				
				if (!posts || posts.rows.length <= 0) { // NOT FOUND
					cb(ret);
					return;
				}

				let tasks = []; // Build the posts
				for (let row of posts.rows) {
					tasks.push((ret) => {
						this.getPost(row.p_id, (post) => ret(null, post));
					});
				}

				// Execute all tasks then return
				async.parallel(tasks, (err, results) => {
					let regex = new RegExp(query, "g");
					cb(results
						.filter(p => p != null) // filter null posts
						.map(p => [p, this.computeScore(user, regex, p)]) 
										// Associate each post with a score
						.filter(p => p[1] > 5) // Filter out any scores too low
						.sort((a, b) => a[1] - b[1]) // Sort by the score
						.map(p => p[0])); // Take out the score
				});
			});
		},

		// Gets similar posts to another post
		getSimilarPosts: function (post, cb) {
			if (post == null) {
				cb([]);
				return;
			}
			this.query(
				"SELECT p_id FROM posts WHERE p_id != $1 ORDER BY post_time DESC", 
												[post.id], (posts) => {

				let ret = [];
				if (!posts || posts.rows.length <= 0) { // NOT FOUND
					cb(ret);
					return;
				}

				let tasks = []; // Build the posts
				for (let row of posts.rows) {
					tasks.push((ret) => {
						this.getPost(row.p_id, (post) => ret(null, post));
					});
				}

				// Execute all tasks then return
				async.parallel(tasks, (err, results) => {
					cb(results
						.filter(p => p != null) // filter null posts
						.map(p => [p, this.relativeScore(post, p)]) // Associate each post with a score
						.filter(p => p[1] > 5) // Filter out any scores too low
						.sort((a, b) => a[1] - b[1]) // Sort by the score
						.map(p => p[0]) // Take out the score
						.slice(0, 5)); // Top 5
				});
			});
		},

		// Returns the relative score based on the query and user
		computeScore: function (user, regex, post) {
			let ret = 0;
			if (user) {
				if (user.id == post.poster) {
					return ret; // Do not show these
				}
				if (user.country == post.country) {
					ret += 5;
				}
				if (user.region == post.region) {
					ret += 10;
				}
				if (user.city == post.city) {
					ret += 20;
				}
				if (post.privacy == "High" && user.rating < 4) {
					return 0;
				}
				if (post.privacy == "Medium" && user.rating < 2) {
					return 0;
				}
			} else if (post.privacy != "All") {
				return ret;
			}
			let match = post.title.toLowerCase().match(regex);
			if (match) {
				ret += match.length * 5;
			}
			match = post.content.toLowerCase().match(regex);
			if (match) {
				ret += match.length;
			}
			ret += post.rating * 2;
			ret += post.likes / 10;
			ret += post.urgency * 2;

			return ret;
		},

		// Returns the relative score based on two posts
		relativeScore: function (a, b) {
			let ret = 0;
			if (a.poster == b.poster) {
				ret += 10; // This will also trigger same location
			}
			if (a.country == b.country) {
				ret += 5;
			}
			if (a.region == b.region) {
				ret += 10;
			}
			if (a.city == b.city) {
				ret += 20;
			}
			// Less difference in rating/urgency means better
			ret += (5 - Math.abs(a.rating - b.rating)) * 2;
			ret += (5 - Math.abs(a.urgency - b.urgency)) * 2;

			return ret;
		},

		// Get all posts by a user
		getPosts: function (u_id, cb) {
			this.query("SELECT p_id FROM posts WHERE poster = $1", [u_id], (posts) => {

				let ret = [];
				if (!posts || posts.rows.length <= 0) { // NOT FOUND
					cb(ret);
					return;
				}

				let tasks = []; // Build the posts
				for (let row of posts.rows) {
					tasks.push((ret) => {
						this.getPost(row.p_id, (post) => ret(null, post));
					});
				}

				// Execute all tasks then return
				async.parallel(tasks, (err, results) => {
					cb(results.filter(p => p != null));
				});
			});
		},

		// Return a post object, or null if non-existent
		getPost: function (p_id, cb) {
			this.query("SELECT * FROM posts WHERE p_id = $1", [p_id], (posts) => {

				if (!posts || posts.rows.length != 1) { // NOT FOUND
					cb(null);
					return;
				}

				let p = posts.rows[0];
				let post = {
					id: p.p_id,
					poster: p.poster,
					title: p.title,
					content: p.content,
					urgency: p.urgency,
					privacy: p.privacy,
					likes: 0,
					rating: 0,
					comments: [],
					reviews: []
				};

				this.getUser(p.poster, (user) => {
					if (!user) {
						cb(null); // Probably banned
						return;
					}

					post.user = user;

					post.country = user.info.country;
					post.city = user.info.city;
					post.region = user.info.region;
					post.firstname = user.firstname;
					post.lastname = user.lastname;
					post.phone = user.info.phone;
					post.email = user.email;
					post.images = [];

					// get rating
					this.query(
						"SELECT reviewer, content, rating FROM reviews WHERE post = $1 ORDER BY review_time ASC", 
																					[p_id], (posts) => {
						let tasks = {}; // Build the user names
						if (posts && posts.rows.length > 0) {
							// Average rating
							post.rating = posts.rows.reduce((prev, row) => {
								return prev + row.rating;
							}, 0);
							post.rating /= posts.rows.length;
							post.rating = Math.round(post.rating);


							for (let row of posts.rows) {
								if (!(row.reviewer in tasks)) {
									tasks[row.reviewer] = (ret) => {
										this.getUserName(row.reviewer, (name) => ret(null, name));
									};
								}
							}

						}
						// Execute all tasks then return
						async.parallel(tasks, (err, results) => {
							if (posts && posts.rows.length > 0) {
								for (let row of posts.rows) {
									post.reviews.push({
										name: results[row.reviewer],
										id: row.reviewer,
										rating: row.rating,
										content: row.content
									});
								}
							}

							this.query("SELECT user FROM likes WHERE post = $1", [p_id], (posts) => {
								if (posts && posts.rows.length > 0) {
									post.likes = posts.rows.length;
								}

								this.query(
									"SELECT c_id, reply_to, commenter, content FROM comments WHERE post = $1 ORDER BY comment_time ASC", 
																			[p_id], (posts) => {
									tasks = {};
									if (posts && posts.rows.length > 0) {
										for (let row of posts.rows) {
											if (!(row.commenter in tasks)) {
												tasks[row.commenter] = (ret) => {
													this.getUserName(row.commenter, (name) => ret(null, name));
												};
											}
										}
									}
									// Execute all tasks then return
									async.parallel(tasks, (err, results) => {
										for (let c of posts.rows) {
											let comment = {
												id: c.c_id,
												user: c.commenter,
												name: results[c.commenter],
												content: c.content,
												comments: []
											};
											if (c.reply_to == null) {
												post.comments.push(comment);
											} else {
												let parent = post.comments.find(p => p.id == c.reply_to);
												if (parent) {
													parent.comments.push(comment);
												} else {
													// Insert empty
													post.comments.push({
														id: c.reply_to,
														user: false,
														name: false,
														content: false,
														comments: [c]
													});
												}
											}
										}
										// Filter out any empty comments
										post.comments = post.comments.filter(c => c.user);

										// Get images
										this.query(
											"SELECT img_url FROM post_images WHERE p_id = $1", 
																[p_id], (posts) => {
											if (posts && posts.rows.length > 0) {
												post.images = posts.rows.map(r => r.img_url);
											}
											cb(post);
										});
									});
								});
							});
						});
					});
				});
			});
		}
	}
}