// Configures routes.


const c = require("./constants");

const PAGES = {
    '/': {name: 'index', title: "Home"},
    '/404': {name: '404', title: 'Error'},
    '/admin': {name: 'admin', logged_in: true, needs_admin: true, title: 'Administrator Panel'},
    '/signup': {name: 'signup', logged_out: true, title: 'Sign Up'},
    '/login': {name: 'login', logged_out: true, title: 'Log In'},
    '/admin-signup': {name: 'signup', logged_in: true, needs_admin: true, title: 'Add New User'},
    '/profile': {name: 'profile', title: 'Profile'},
    '/search': {name: 'search', title: 'Search'},
    '/post': {name: 'post', title: 'Post'}
}

module.exports = {
    configure: (app, main) => {
        // Standard pages
        for (let r in PAGES) {
            app.get(r, (req, res) => {
                if (!req.body) {
                    return res.sendStatus(400); // Error
                } else if (PAGES[r].logged_in && !req.session.user) {
                    res.redirect('/login'); // Must be logged in
                } else if (PAGES[r].logged_in && req.session.user && !req.session.user.info) {
                    res.redirect('/profile'); // Must fill out info
                } else if (PAGES[r].logged_out && req.session.user) {
                    res.redirect('/profile'); // Must be logged out
                } else if (PAGES[r].needs_admin 
                        && (!req.session.user || !req.session.user.is_admin)) {
                    res.redirect('/profile'); // Must be admin
                } else {
                    main.setIP(req);
                    module.exports.generateData(req, res, r, main, (data) => {
                        if (data != null) {
                            res.render(PAGES[r].name, data);
                        }
                    });
                }
            });
        }
        
        
        // Error handle
        app.use((req, res, next) => {
          res.status(404);

          // respond with html page
          if (req.accepts('html')) {
            module.exports.generateData(req, null, main, (data) => {
                res.render('404', data);
            });
            return;
          }

          // respond with json
          if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
          }

          // default to plain-text. send()
          res.type('txt').send('Not found');
        });
    },
    
    logError: (err) => {
        if (err) {
            console.log(err);
        }
    },
    
    // Generates data for use in EJS template. 
    generateData: (req, res, r, main, cb) => {
        let ret = {user: false, title: false, search: false,
                    csrfToken: req.csrfToken()};
        if (req.session.user) {
            ret.user = req.session.user;
        }
        if (r) {
            if (PAGES[r].title) {
                ret.title = PAGES[r].title;
            }
            if (PAGES[r].name == 'signup') {
                main.db.getCountries((data) => {
                    ret.countries = data;
                    ret.oauth = c.OAUTH_KEYS;
                    cb(ret);
                });
                return;
            }
            if (PAGES[r].name == 'login') {
                ret.oauth = c.OAUTH_KEYS;
            }
            if (PAGES[r].name == 'search') {
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
            }
            if (PAGES[r].name == 'profile') {
                if (req.query && req.query.id) {
                    req.sanitize("id").toInt();
                    main.db.getUser(req.query.id, (data) => {
                        if (!data || data.banned) { // not found
                            res.redirect('/404');
                            cb(null);
                        } else {
                            ret.profile = data;
                            cb(ret);
                        }
                    });
                    return;
                } else if (!req.session.user) {
                    res.redirect('/login');
                    cb(null);
                    return;
                }
                ret.profile = ret.user; // view own profile
            }
            if (PAGES[r].name == 'post') {
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
            cb(ret);
        } else {
            // Error 404 
            ret.title = "Error";
            cb(ret);
        }
    }
}