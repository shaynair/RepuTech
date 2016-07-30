// Configures routes.

const PAGES = {
    '/': {name: 'index'},
    '/admin': {name: 'admin', logged_in: true, needs_admin: true, title: 'Administrator Panel'},
    '/signup': {name: 'signup', logged_in: false, title: 'Sign Up'},
    '/admin-signup': {name: 'signup', logged_in: true, needs_admin: true, title: 'Add New User'},
    '/profile': {name: 'profile', logged_in: true, title: 'Profile'}
}

module.exports = {
    configure: (app, main) => {
        // Index page
        
        for (let r in PAGES) {
            app.get(r, (req, res) => {
                if (!req.body) {
                    return res.sendStatus(400); // Error
                } else if (PAGES[r].logged_in && !req.session.user) {
                    res.redirect('/login');
                } else if (PAGES[r].needs_admin 
                        && (!req.session.user || !req.session.user.is_admin)) {
                    res.redirect('/logout');
                } else {
                    res.render(PAGES[r].name, 
                        module.exports.generateData(req, r));
                }
            });
        }
        
        
        app.get('/logout', (req, res) => {
            req.session.destroy((err) => {
                logError(err);
                res.redirect('/');
            });
        });
    },
    
    logError: (err) => {
        if (err) {
            console.log(err);
        }
    },
    
    generateData: (req, r) => {
        let ret = {user: false, title: false};
        if (req.session.user) {
            ret.user = req.session.user;
        }
        if (r) {
            ret.title = PAGES[r].title;
        }
        return ret;
    }
}