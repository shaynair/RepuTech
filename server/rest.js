// Configures JSON REST API


const c = require("./constants");

const CALLS = {
    'get-states': {
        post: false, 
        validate: (req) => {
            req.checkBody('country', 'Invalid').len(2, 2);
        },
        perform: (req, main, cb) => {
            main.db.getStates(req.body.country, cb);
        }
    },
    
    'login-form':  {
        post: true,
        logged_out: true,
        validate: (req) => {
            req.checkBody('email', 'Invalid').notEmpty();
            req.checkBody('pass', 'Invalid').notEmpty();
            
            req.checkBody('email', 'Invalid').isEmail();
            req.checkBody('email', 'Invalid').isRegularEmail();
            req.checkBody('pass', 'Invalid').isPassword();
        },
        perform: (req, main, cb) => {
            // If they've used it too much
            if (req.session.attemptTime && req.session.attemptTime >= 
                            (Math.floor(new Date() / 1000) - 30)) {
                // Within 30 seconds
                if (req.session.attempts >= 5) {
                    cb({status: "Attempts"});
                    return;
                }
            } else if (req.session.attempts) {
                delete req.session.attempts;
                delete req.session.attemptTime;
                req.session.save();
            }
            
            main.db.logIn(req.body.email, req.body.pass, req.ip, 
                                req.sessionID, (user) => {
                let ret = {};
                if (!user) {
                    ret.status = "Bad";
                    req.session.attempts = req.session.attempts || 0;
                    req.session.attempts++;
                    req.session.attemptTime = Math.floor(new Date() / 1000);
                    req.session.save();
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
}

module.exports = {
    configure: (app, main) => {
        // Standard CALLS
        let f = (req, res, r) => {
            if (!req.body) {
                return res.sendStatus(400); // Error
            }
            main.setIP(req);
            
            res.setHeader('Content-Type', 'application/json');
            let ret = {};
            if (CALLS[r].logged_in && !req.session.user) {
                ret.error = "Must be logged in";
            } else if (CALLS[r].logged_out && req.session.user) {
                ret.error = "Must be logged out";
            } else if (CALLS[r].needs_admin 
                    && (!req.session.user || !req.session.user.is_admin)) {
                ret.error = "Insufficient privileges";
            } else {
                CALLS[r].validate(req);
                if (req.validationErrors()) {
                    ret.error = "Invalid parameters";
                } else {
                    CALLS[r].perform(req, main, (r) => res.send(JSON.stringify(r)));
                    return;
                }
            }
            res.send(JSON.stringify(ret));
        };
        for (let r in CALLS) {
            if (CALLS[r].post) {
                app.post('/api/' + r, (req, res) => f(req, res, r));
            } else {
                app.get('/api/' + r, (req, res) => f(req, res, r));
            }
        }
    },
    
    logError: (err) => {
        if (err) {
            console.log(err);
        }
    },
}