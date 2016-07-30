// Configures routes.

const PAGES = {
    '/': {name: 'index'},
    '/admin': {name: 'admin', logged_in: true, needs_admin: true, title: 'Administrator Panel'},
    '/signup': {name: 'signup', logged_out: true, title: 'Sign Up'},
    '/admin-signup': {name: 'signup', logged_in: true, needs_admin: true, title: 'Add New User'},
    '/profile': {name: 'profile', logged_in: true, title: 'Profile'}
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
                    res.redirect('/logout'); // Must be admin
                } else {
                    module.exports.generateData(req, r, main, (data) => {
                        res.render(PAGES[r].name, data);
                    });
                }
            });
        }
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
        if (PAGES[r].title) {
            ret.title = PAGES[r].title;
        }
        if (PAGES[r].name == 'signup') {
            main.db.getCountries((data) => {
                ret.countries = data;
                cb(ret);
            });
        } else {
            cb(ret);
        }
    }
}