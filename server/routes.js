// Configures routes.
const c = require("./constants");

const PAGES = {
	'/': {
		name: 'index',
		title: "Home"
	},
	'/404': {
		name: '404',
		title: 'Error'
	},
	'/admin': {
		name: 'admin',
		logged_in: true,
		needs_admin: true,
		title: 'Administrator Panel'
	},
	'/signup': {
		name: 'signup',
		logged_out: true,
		title: 'Sign Up'
	},
	'/login': {
		name: 'login',
		logged_out: true,
		title: 'Log In'
	},
	'/admin-signup': {
		name: 'signup',
		logged_in: true,
		needs_admin: true,
		title: 'Add New User'
	},
	'/profile': {
		name: 'profile',
		title: 'Profile'
	},
	'/search': {
		name: 'search',
		title: 'Search'
	},
	'/post': {
		name: 'post',
		title: 'Post'
	}
}

module.exports = {
	configure: function (app, main) {
		// Standard pages
		for (let r in PAGES) {
			app.get(r, (req, res) => {
				if (!req.body) {
					return res.sendStatus(400); // Error
				} else if (PAGES[r].logged_in && !req.session.user) {
					res.redirect('/login'); // Must be logged in
				} else if (PAGES[r].logged_in && req.session.user &&
					!req.session.user.info.filled) {
					res.redirect('/profile'); // Must fill out info
				} else if (PAGES[r].logged_out && req.session.user) {
					res.redirect('/profile'); // Must be logged out
				} else if (PAGES[r].needs_admin &&
					(!req.session.user || !req.session.user.is_admin)) {
					res.redirect('/profile'); // Must be admin
				} else {
					main.setIP(req);
					this.generateData(req, res, r, main, (data) => {
						if (data != null) {
							res.render(PAGES[r].name, data);
						}
					});
				}
			});
		}

		// Error handler
		app.use((req, res, next) => {
			res.status(404);

			// respond with html page
			if (req.accepts('html')) {
				module.exports.generateData(req, res, null, main, (data) => {
					res.render('404', data);
				});
				return;
			}

			// respond with json
			if (req.accepts('json')) {
				res.send({
					error: 'Not found'
				});
				return;
			}

			// default to plain-text. send()
			res.type('txt').send('Not found');
		});
	},

	// Generates data for use in EJS template. 
	generateData: function (req, res, r, main, cb) {
		// By default, fields are null
		let ret = {
			user: false,
			title: false,
			search: false,
			csrfToken: req.csrfToken()
		};

		// Insert fields if they exist
		if (req.session.user) {
			ret.user = req.session.user;
		}
		if (r) {
			ret.title = PAGES[r].title;

			if (PAGES[r].name == 'signup') {
				// Populate signup page with countries and OAUTH
				main.db.getCountries((data) => {
					ret.countries = data;
					ret.oauth = c.OAUTH_KEYS;
					cb(ret);
				});
				return;
			} else if (PAGES[r].name == 'login') {
				// Populate OAUTH keys
				ret.oauth = c.OAUTH_KEYS;
			} else if (PAGES[r].name == 'search') {
				// By default, parse the search query
				if (req.query && req.query.search) {
					req.sanitize("search");
					ret.search = req.query.search;
					main.db.searchPosts(ret.user, req.query.search, (data) => {
						ret.posts = data;
						cb(ret);
					});
					return;
				}
				ret.posts = []; // empty
			} else if (PAGES[r].name == 'profile') {
				// If viewing another profile
				if (req.query && req.query.id) {
					req.sanitize("id").toInt();
					main.db.getUser(req.query.id, (data) => {
						if (!data || data.banned) { // not found
							res.redirect('/404');
							cb(null);
						} else {
							ret.profile = data;
							main.db.getCountries((c) => {
								ret.countries = c;
								cb(ret);
							});
						}
					});
					return;
				} else if (!req.session.user) {
					res.redirect('/login');
					cb(null);
					return;
				}
				ret.profile = ret.user; // View own profile
				main.db.getCountries((c) => {
					ret.countries = c;
					cb(ret);
				});
				return;
			} else if (PAGES[r].name == 'post') {
				// Viewing a post
				if (req.query && req.query.id) {
					req.sanitize("id").toInt();
					main.db.getPost(req.query.id, (data) => {
						if (!data) { // not found
							res.redirect('/404');
							cb(null);
						} else {
							ret.post = data;
							cb(ret);
						}
					});
				} else {
					res.redirect('/404');
					cb(null);
				}
				return;
			}
		} else {
			// Error 404 
			ret.title = "Error";
		}
		cb(ret);
	}
}