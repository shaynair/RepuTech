// Configures passwords, oauth.
const logger = require("./logger");
const c = require('./constants');

const gpw = require("node-gpw");
const bcrypt = require('bcrypt-nodejs');

// Passport OAUTH
const strategies = {
	// Untested, won't work on localhost
	/*Facebook: {
		title: "clientID",
		secret: "clientSecret",
		strategy: require('passport-facebook'),
		
		fieldName: "profileFields",
		field: ['id', 'emails', 'name'],
		scope: ['email']
	},*/
	LinkedIn: {
		title: "consumerKey",
		secret: "consumerSecret",
		strategy: require('passport-linkedin'),
		
		fieldName: "profileFields",
		field: ['id', 'first-name', 'last-name', 'email-address'],
		scope: ['r_basicprofile', 'r_emailaddress']
	},
	Google: {
		title: "clientID",
		secret: "clientSecret",
		strategy: require('passport-google-oauth20'),
		
		fieldName: false,
		scope: ['https://www.googleapis.com/auth/plus.login', 
				'https://www.googleapis.com/auth/plus.profile.emails.read']
	}
}
const RedditStrategy = require('passport-reddit').Strategy;

module.exports = {
	configure: (app, main) => {

		for (let strategy in strategies) {
			// First interaction
			app.get("/auth/" + strategy.toLowerCase(), 
					main.passport.authenticate(strategy.toLowerCase(),
					{ scope : strategies[strategy].scope }));
			
			// Authenticated
			app.get("/auth/" + strategy.toLowerCase() + "/call", 
				(req, res, next) => {
					main.passport.authenticate(strategy.toLowerCase(), 
												(err, user, info) => {
						if (err) { 
							return next(err); 
						}
						if (!user) { 
							return res.redirect('/login'); 
						}
						// Set the session. Same as usual login.
						req.session.user = user;
						return res.redirect('/profile');
					})(req, res, next);
				});
		}
		// Destroy session if exists
		app.get('/logout', (req, res) => {
			main.db.destroySession(req.sessionID, () => {
				req.session.destroy((err) => {
					logger.logError(err);
					res.redirect('/');
				});
			});
		});
	},
	
	
	// Configures OAUTH strategies.
	strategies: (passport, db) => {
		for (let strategy in strategies) {
			let s = strategies[strategy];
			let config = {
				callbackURL: c.SITE_URL + "/auth/" + strategy.toLowerCase() + "/call"
			};
			
			config[s.title] = c.OAUTH_KEYS[strategy].KEY;
			config[s.secret] = c.OAUTH_KEYS[strategy].SECRET;
			
			if (s.fieldName) {
				config[s.fieldName] = s.field;
			}
			
			passport.use(new (s.strategy.Strategy)(config,
				function(accessToken, refreshToken, profile, cb) {
					if (!profile.name || !profile.emails || profile.emails.length == 0) {
						cb(null, null);
						return;
					}
					let firstname = profile.name.givenName || '';
					let lastname = profile.name.familyName || '';
					let email = profile.emails[0].value;
					
					db.register(email, strategy, firstname, lastname, null, 'Normal', (val) => {
						if (val == 0) { // User exists
							db.logInThirdParty(email, strategy, (user) => cb(null, user));
						} else if (typeof val == 'object') { //logged in
							db.getUserData(val.id, (info) => {
								val.info = info;
								cb(null, val);
							});
						} else {
							cb('There was an error.', null); // error
						}
					});
				}
			));
		}
	},

	// Generates a random password.
	generatePassword: () => {
		return gpw(6).toUpperCase() + gpw(6).toLowerCase() + 
				Math.floor(Math.random() * 10);
	},

	// Hashes a password or string.
	hash: (pass) => {
		return bcrypt.hashSync(pass);
	},

	// Compares a string with a hash. cb accepts boolean.
	compare: (text, hash, cb) => {
		bcrypt.compare(text, hash, (err, res) => {
			logger.logError(err);

			cb(res);
		});
	}
}