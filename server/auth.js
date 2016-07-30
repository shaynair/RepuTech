// Configures login, signup, oauth.

module.exports = {
    configure: (app, main) => {
        // AJAX call for logging in
        app.post('/login-form', (req, res) => {
            if (!req.body || req.session.user) {
                return res.sendStatus(400); // Error
            }
            
            let ipaddr = req.ip || req.connection.remoteAddress 
                || req.socket.remoteAddress || req.connection.socket.remoteAddress;
            
            main.db.logIn(req.body.email, req.body.password, ipaddr, 
                                req.sessionID, (user) => {
                let ret = {};
                if (!user) {
                    ret.status = "Bad";
                } else if (user == 1) {
                    ret.status = "Banned";
                } else if (user == 2) {
                    ret.status = "Inactivated";
                } else {
                    ret.status = "OK";
                    req.session.user = user;
                }
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(ret));
            });
        });
        
        // Destroy session if exists
        app.get('/logout', (req, res) => {
            main.db.destroySession(req.sessionID, () => {
                req.session.destroy((err) => {
                    module.exports.logError(err);
                    res.redirect('/');
                });
            });
        });
    },
    
    logError: (err) => {
        if (err) {
            console.log(err);
        }
    },
    
    generateData: (req, r) => {
        let ret = {user: false};
        if (req.session.user) {
            ret.user = req.session.user;
        }
        return ret;
    }
}