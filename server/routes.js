// Configures routes.


const c = require("./constants");

const PAGES = {
    '/': {name: 'index'},
    '/admin': {name: 'admin', logged_in: true, needs_admin: true, title: 'Administrator Panel'},
    '/signup': {name: 'signup', logged_out: true, title: 'Sign Up'},
    '/login': {name: 'login', logged_out: true, title: 'Log In'},
    '/admin-signup': {name: 'signup', logged_in: true, needs_admin: true, title: 'Add New User'},
    '/profile': {name: 'profile', title: 'Profile'}
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
                } else if (PAGES[r].logged_out && req.session.user) {
                    res.redirect('/profile'); // Must be logged out
                } else if (PAGES[r].needs_admin 
                        && (!req.session.user || !req.session.user.is_admin)) {
                    res.redirect('/profile'); // Must be admin
                } else {
                    main.setIP(req);
                    module.exports.generateData(req, r, main, (data) => {
                        res.render(PAGES[r].name, data);
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
    generateData: (req, r, main, cb) => {
        let ret = {user: false, title: false, csrfToken: req.csrfToken()};
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
            cb(ret);
        } else {
            // Error 404 
            ret.title = "Error";
            cb(ret);
        }
    }
}