// Configures JSON REST API
const c = require("./constants");
const mail = require("./mail");
const upload = require("./upload");
const logger = require("./logger");


// Sets the login attempts and increments it by 1.
function setAttempts(req) {
	req.session.attempts = req.session.attempts || 0;
	req.session.attempts++;
	req.session.attemptTime = Math.floor(new Date() / 1000);
	req.session.save();
}

// Return true if the user still has attempts remaining to login.
function hasAttempts(req) {
	if (req.session.attemptTime && req.session.attemptTime >=
		(Math.floor(new Date() / 1000) - 30)) {
		// Within 30 seconds
		if (req.session.attempts >= 5) {
			return true;
		}
	} else if (req.session.attempts) {
		delete req.session.attempts;
		delete req.session.attemptTime;
		req.session.save();
	}
	return false;
}

const CALLS = {
	// Gets all states for a country.
	'get-states': {
		api: true,
		validate: (req) => {
			req.checkQuery('country', 'Invalid').isLength({
				min: 2,
				max: 2
			});

			req.sanitize('country').trim();
		},
		perform: (req, main, cb) => {
			main.db.getStates(req.query.country, cb);
		}
	},

	// Uses the reset password form.
	'reset-pass': {
		post: true,
		logged_out: true,
		api: true,
		validate: (req) => {
			req.checkBody('email', 'Required field').notEmpty();
			req.checkBody('email', 'Must be an email').isEmail();
			req.checkBody('email', 'Must be an email').isRegularEmail();

			req.sanitize('email').trim();
		},
		perform: (req, main, cb) => {
			// If they've used it too much
			if (hasAttempts(req)) {
				cb({
					status: "Attempts"
				});
				return;
			}

			main.db.resetPassStart(req.body.email, (token) => {
				let ret = {};
				if (token) {
					ret.status = "OK";

					mail.send(req.body.email,
						"RepuTech Password Reset", // subject
						"You or someone using your e-mail has requested a password reset. " +
						"Go to this link: " + c.SITE_URL + "/reset?token=" + token +
						" to reset it. It is valid for 24 hours. Your new password will be " +
						token + " after you click on it.", (res, err) => {

							if (err) {
								logger.logError(res);
							}
						});
				} else {
					ret.status = "Bad";
				}
				setAttempts(req);
				ret.attempts = req.session.attempts;
				cb(ret);
			});
		}
	},

	// Resets password.
	'reset': {
		logged_out: true,
		validate: (req) => {
			req.checkQuery('token', 'Invalid').notEmpty();
			req.sanitize('token').trim();
		},
		perform: (req, main, cb) => {
			main.db.resetPassEnd(req.query.token, () => cb(null));
		}
	},

	
	// Confirms the registration.
	'confirm': {
		logged_out: true,
		validate: (req) => {
			req.checkQuery('id', 'Invalid').notEmpty();
			req.checkQuery('id', 'Invalid').isNumeric();
			req.sanitize('id').toInt();
		},
		perform: (req, main, cb) => {
			main.db.activateUser(req.query.id, () => cb(null));
		}
	},

	// Logs in.
	'login-form': {
		post: true,
		logged_out: true,
		api: true,
		validate: (req) => {
			req.checkBody('email', 'Required field').notEmpty();
			req.checkBody('pass', 'Required field').notEmpty();

			req.checkBody('email', 'Must be an email').isEmail();
			req.checkBody('email', 'Must be an email').isRegularEmail();
			req.checkBody('pass', 'Must match the format').isPassword();

			req.sanitize('email').trim();
			req.sanitize('pass').trim();
		},
		perform: (req, main, cb) => {
			// If they've used it too much
			if (hasAttempts(req)) {
				cb({
					status: "Attempts"
				});
				return;
			}

			main.db.logIn(req.body.email, req.body.pass, req.ip,
				req.sessionID, (user) => {
					let ret = {};
					if (!user) {
						ret.status = "Bad";
						setAttempts(req);
					} else if (user == 1) {
						ret.status = "Banned";
					} else if (user == 2) {
						ret.status = "Inactivated";
					} else {
						ret.status = "OK";
						req.session.user = user;
						req.session.save();
					}
					ret.attempts = req.session.attempts;
					cb(ret);
				});
		}
	},

	// Registers a new user.
	'signup-form': {
		post: true,
		api: true,
		validate: (req) => {
			req.checkBody('email', 'Required field').notEmpty();
			req.checkBody('pass', 'Required field').notEmpty();
			req.checkBody('firstname', 'Required field').notEmpty();
			req.checkBody('lastname', 'Required field').notEmpty();
			req.checkBody('country', 'Required field').notEmpty();
			req.checkBody('state', 'Required field').notEmpty();
			req.checkBody('city', 'Required field').notEmpty();
			req.checkBody('phone', 'Required field').notEmpty();

			req.checkBody('email', 'Must be an email').isEmail();
			req.checkBody('email', 'Must be valid email').isRegularEmail();
			req.checkBody('email', 'Max length of 100').isLength({
				max: 100
			});
			req.checkBody('pass', 'Must match format').isPassword();
			req.checkBody('firstname', 'Letters only').isAlpha();
			req.checkBody('lastname', 'Letters only').isAlpha();
			req.checkBody('firstname', 'Max length of 50').isLength({
				max: 50
			});
			req.checkBody('lastname', 'Max length of 50').isLength({
				max: 50
			});
			req.checkBody('country', 'Letters only').isAlpha();
			req.checkBody('country', 'Invalid').isLength({
				min: 2,
				max: 2
			});
			req.checkBody('state', 'Numbers only').isNumeric();
			req.checkBody('city', 'Letters only').isAlpha();
			req.checkBody('city', 'Max length of 50').isLength({
				max: 50
			});
			req.checkBody('phone', 'Numbers only').isNumeric();
			req.checkBody('phone', 'Length between 10 and 12').isLength({
				min: 10,
				max: 12
			});
			req.checkBody('job', 'Letters only').optional({
				checkFalsy: true
			}).isText();

			req.sanitize('state').toInt();
			req.sanitize('firstname').trim();
			req.sanitize('lastname').trim();
			req.sanitize('city').trim();
			req.sanitize('phone').toInt();
			req.sanitize('job').trim();
			req.sanitize('email').trim();
			req.sanitize('pass').trim();

			req.assert('email2', 'Do not match').equals(req.body.email);
			req.assert('pass2', 'Do not match').equals(req.body.pass);
		},
		perform: (req, main, cb) => {
			main.db.register(req.body.email, 'Normal', req.body.firstname, req.body.lastname,
									req.body.pass, 'Normal', (user) => {
				let ret = {};
				if (!user) {
					ret.status = "Exists";
					cb(ret);
				} else if (user == -1) {
					ret.status = "Bad"; // Error
					cb(ret);
				} else {
					ret.status = "OK";
					main.db.editUser(user.id, req.body.firstname, req.body.lastname,
						req.body.phone, req.body.state, req.body.city, req.body.job, '', // empty status
						req.ip, req.sessionID, (u) => {

							if (req.session.user && req.session.user.is_admin) {
								ret.status = "Done"; // No need for verification
								main.db.activateUser(user.id, () => cb(ret));
							} else {
								mail.send(req.body.email,
									"RepuTech Registration", // subject
									"You or someone using your e-mail has requested a registration. " +
									"Go to this link: " + c.SITE_URL + "/confirm?id=" + user.id +
									" to activate it.", (res, err) => {

										if (err) {
											logger.logError(res);
										}

										cb(ret);
									});
							}
						});
				}

			});
		}
	},

	// Gets wiki posts of a user
	'get-wiki': {
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();
		},
		perform: (req, main, cb) => {
			main.db.getWikiData(req.query.id, cb);
		}
	},

	// Gets similar posts to a listing
	'get-similar': {
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();
		},
		perform: (req, main, cb) => {
			main.db.getPost(req.query.id, (post) => {
				main.db.getSimilarPosts(post, cb);
			});
		}
	},

	// Gets messages of a user
	'get-messages': {
		logged_in: true,
		api: true,
		validate: (req) => {},
		perform: (req, main, cb) => {
			main.db.getMessageData(req.session.user.id, cb);
		}
	},

	// Adds a message
	'add-message': {
		logged_in: true,
		api: true,
		post: true,
		validate: (req) => {
			req.checkBody('reply', 'Required field').notEmpty();
			req.checkBody('to', 'Required field').notEmpty();
			req.checkBody('to', 'Must be a number').isNumeric();
			req.sanitize('to').toInt();
			req.sanitize('reply').trim();

			if (req.body.to && req.session.user.id == req.body.to) {
				req.assert('id', 'Do not match').equals("");
			}
		},
		perform: (req, main, cb) => {
			main.db.addMessage(req.session.user.id, req.body.to, req.body.reply, (ret) =>
				cb({
					status: ret
				}));
		}
	},

	// Follows a user.
	'follow': {
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();
			if (req.query.id && req.session.user.id == req.query.id) {
				req.assert('id', 'Do not match').equals("");
			}
		},
		perform: (req, main, cb) => {
			main.db.tryFollow(req.session.user.id, req.query.id, (ret) => cb({
				status: ret
			}));
		}
	},

	// Admin function: bans a user. User is effectively deleted.
	'ban': {
		logged_in: true,
		needs_admin: true,
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();
		},
		perform: (req, main, cb) => {
			main.db.banUser(req.query.id, req.session.user.id, () => cb(null));
		}
	},

	// Admin function: re-initializes the database
	'repopulate': {
		logged_in: true,
		needs_admin: true,
		api: true,
		validate: (req) => {},
		perform: (req, main, cb) => {
			main.db.initializeDatabase(() => cb({
				status: true
			}));
		}
	},

	// "Likes" a listing
	'like': {
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();

		},
		perform: (req, main, cb) => {
			main.db.tryLike(req.query.id, req.session.user.id, (ret) => cb({
				status: ret
			}));
		}
	},

	// Reviews a listing
	'review': {
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();

			req.checkQuery('content', 'Required field').notEmpty();

			req.checkQuery('rating', 'Required field').notEmpty();
			req.checkQuery('rating', 'Must be a number').isNumeric();
			req.sanitize('rating').toInt();

			req.sanitize('content').trim();
			if (req.query.rating && (req.query.rating < 1 || req.query.rating > 5)) {
				req.assert('rating', 'Do not match').equals("");
			}
		},
		perform: (req, main, cb) => {
			main.db.tryReview(req.query.id, req.session.user.id, req.query.content,
				req.query.rating, (ret) => cb({
					status: ret
				}));
		}
	},

	// Comments on a listing
	'comment': {
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();

			req.checkQuery('content', 'Required field').notEmpty();

			req.checkQuery('to', 'Required field').notEmpty();
			req.checkQuery('to', 'Must be a number').isNumeric();
			req.sanitize('to').toInt();

			req.sanitize('content').trim();
		},
		perform: (req, main, cb) => {
			main.db.tryComment(req.query.id, req.session.user.id, req.query.content,
				req.query.to, (ret) => cb({
					status: ret
				}));
		}
	},
	
	// Searches all posts by a query string
	'search-posts': {
		api: true,
		validate: (req) => {
			req.checkQuery('query', 'Required field').notEmpty();

			req.sanitize('query').trim();
		},
		perform: (req, main, cb) => {
			main.db.searchPosts(req.session.user, req.query.query, cb);
		}
	},

	// Gets the listings of a user
	'get-posts': {
		api: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();
		},
		perform: (req, main, cb) => {
			main.db.getPosts(req.query.id, cb);
		}
	},

	// Adds a new wiki post
	'add-wiki': {
		post: true,
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkBody('title', 'Required field').notEmpty();
			req.checkBody('content', 'Required field').notEmpty();

			req.sanitize('title').trim();
			req.sanitize('content').trim();
		},
		perform: (req, main, cb) => {
			main.db.addWiki(req.session.user.id, req.body.title, req.body.content, 
				(ret) => cb({
					status: ret
				})
			);
		}
	},

	// Adds a new listing
	'add-post': {
		post: true,
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkBody('title', 'Required field').notEmpty();
			req.checkBody('content', 'Required field').notEmpty();
			req.checkBody('privacy', 'Required field').notEmpty();

			req.sanitize('title').trim();
			req.sanitize('content').trim();
			req.sanitize('privacy').trim();
			req.sanitize('posttype').toBoolean();
		},
		perform: (req, main, cb) => {
			main.db.addPost(req.session.user.id, req.body.title, req.body.content, 
				req.body.privacy, req.body.urgency, req.body.posttype, (ret) => cb({
					status: ret
				}));
		}
	},

	// Image upload
	'new-image': {
		logged_in: true,
		api: true,
		redirect_url: '/profile',
		post: true,
		validate: (req) => {},
		perform: (req, main, cb) => {
			upload.handleUpload(req, "file", "avatar", true, (res) => {
				if (!res) { // failed
					cb(null);
					return;
				}

				req.session.user.info.images.push(res);
				req.session.save();
				main.db.addImage(req.session.user.id, res, (ret) => cb(null));
			});
		}
	},
	
	// Image upload
	'new-post-image': {
		logged_in: true,
		api: true,
		redirect_url: '/post?id=',
		post: true,
		validate: (req) => {
			req.checkQuery('id', 'Required field').notEmpty();
			req.checkQuery('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();
		},
		perform: (req, main, cb) => {
			upload.handleUpload(req, "file", "post", false, (res) => {
				if (!res) { // failed
					cb(null);
					return;
				}
				main.db.addPostImage(req.session.user.id, req.query.id, res, (ret) => cb(req.query.id));
			});
		}
	},

	// Sets a user image to active
	'set-image': {
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkQuery('url', 'Required field').notEmpty();

			req.sanitize('url').trim();
		},
		perform: (req, main, cb) => {
			let ind = req.session.user.info.images.indexOf(req.query.url);
			if (ind < 0) { // does not exist
				cb({
					status: false
				});
				return;
			}
			main.db.setImage(req.session.user.id, req.query.url, () => {
				req.session.user.info.img = req.query.url;
				req.session.save();
				cb({
					status: true
				});
			});
		}
	},

	// Deletes a user image
	'delete-image': {
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkQuery('url', 'Required field').notEmpty();

			req.sanitize('url').trim();
		},
		perform: (req, main, cb) => {
			let ind = req.session.user.info.images.indexOf(req.query.url);
			if (ind < 0) { // does not exist
				cb({
					status: false
				});
				return;
			}
			main.db.deleteImage(req.session.user.id, req.query.url, () => {
				// remove it from session
				req.session.user.info.images.splice(ind, 1);
				req.session.save();
				cb({
					status: true
				});
			});
		}
	},

	// Changes user settings
	'change-settings': {
		post: true,
		logged_in: true,
		api: true,
		validate: (req) => {
			req.checkBody('id', 'Required field').notEmpty();
			req.checkBody('id', 'Must be a number').isNumeric();
			req.sanitize('id').toInt();

			req.checkBody('firstname', 'Required field').notEmpty();
			req.checkBody('lastname', 'Required field').notEmpty();
			req.checkBody('phone', 'Required field').notEmpty();

			req.checkBody('country', 'Required field').notEmpty();
			req.checkBody('country', 'Letters only').isAlpha();
			req.checkBody('country', 'Invalid').isLength({
				min: 2,
				max: 2
			});

			req.checkBody('state', 'Required field').notEmpty();
			req.checkBody('state', 'Must be a number').isNumeric();
			req.sanitize('state').toInt();

			req.checkBody('firstname', 'Letters only').isAlpha();
			req.checkBody('lastname', 'Letters only').isAlpha();
			req.checkBody('firstname', 'Max length of 50').isLength({
				max: 50
			});
			req.checkBody('lastname', 'Max length of 50').isLength({
				max: 50
			});
			req.checkBody('city', 'Letters only').isAlpha();
			req.checkBody('city', 'Max length of 50').isLength({
				max: 50
			});
			req.checkBody('phone', 'Numbers only').isNumeric();
			req.checkBody('phone', 'Length between 10 and 12').isLength({
				min: 10,
				max: 12
			});

			req.checkBody('job', 'Letters only').optional({
				checkFalsy: true
			}).isText();
			req.checkBody('status', 'Letters only').optional({
				checkFalsy: true
			}).isText();

			req.checkBody('currentpass', 'Must be a password').optional({
				checkFalsy: true
			}).isPassword();
			req.checkBody('newpass', 'Must be a password').optional({
				checkFalsy: true
			}).isPassword();

			req.sanitize('firstname').trim();
			req.sanitize('lastname').trim();
			req.sanitize('city').trim();
			req.sanitize('phone').toInt();
			req.sanitize('job').trim();
			req.sanitize('status').trim();
			req.sanitize('currentpass').trim();
			req.sanitize('newpass').trim();

			req.assert('newpass2', 'Do not match').equals(req.body.newpass2);

			// Can't change another user, unless we are admin
			if (req.body.id && req.session.user.id != req.body.id 
						&& !req.session.user.is_admin) {
				req.assert('id', 'Do not match').equals("");
			}
			// Only non-third party can change passwords
			if (req.body.currentpass && req.session.user.type != "Normal") {
				req.assert('id', 'Do not match').equals("");
			}
		},
		perform: (req, main, cb) => {
			main.db.changeSettings(req.body.id, req.body.firstname, req.body.lastname,
				req.body.phone, req.body.city, req.body.job, req.body.status,
				req.body.state, req.ip, req.sessionID,
				req.body.newpass, req.body.currentpass, (ret) => {

					// update the user info session
					req.session.user.firstname = req.body.firstname;
					req.session.user.lastname = req.body.lastname;
					req.session.user.info.phone = req.body.phone;
					req.session.user.info.city = req.body.city;
					req.session.user.info.job = req.body.job;
					req.session.user.info.status = req.body.status;
					req.session.user.info.filled = true;

					main.db.getCountry(req.body.country, (c) => {
						req.session.user.info.country = c;

						main.db.getState(req.body.country, req.body.state, (s) => {
							req.session.user.info.state = s;
							req.session.save();
							cb({
								status: ret
							});
						});
					});
				});
		}
	}
}

module.exports = {
	// Configures routes of the main app.
	configure: (app, main) => {
		// Standard CALLS
		let f = (req, res, r) => {
			if (!req.body) {
				return res.sendStatus(400); // Error
			}
			main.setIP(req);

			// All return values are JSON
			res.setHeader('Content-Type', 'application/json');
			
			let ret = {};
			if (CALLS[r].logged_in && !req.session.user) {
				ret.error = "Must be logged in";
			} else if (CALLS[r].logged_out && req.session.user) {
				ret.error = "Must be logged out";
			} else if (CALLS[r].needs_admin &&
						(!req.session.user || !req.session.user.is_admin)) {
				ret.error = "Insufficient privileges";
			} else {
				CALLS[r].validate(req);
				let errors = req.validationErrors();
				if (errors) {
					if (req.session.user && req.session.user.is_admin) {
						logger.logInfo("There were validation errors: " + JSON.stringify(errors));
					}
					ret.error = "Invalid parameters";
				} else {
					CALLS[r].perform(req, main, (ret) => {
						if (CALLS[r].redirect_url) {
							res.redirect(CALLS[r].redirect_url + (ret != null ? ret : ""));
						} else if (ret) {
							res.send(JSON.stringify(ret));
						} else {
							res.redirect("/");
						}
					});
					return;
				}
			}
			res.send(JSON.stringify(ret));
		};
		// Configure routes
		for (let r in CALLS) {
			let route = '/' + (CALLS[r].api ? 'api/' : '') + r;
			if (CALLS[r].post) {
				app.post(route, (req, res) => f(req, res, r));
			} else {
				app.get(route, (req, res) => f(req, res, r));
			}
		}
	}
}