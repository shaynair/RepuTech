// Configures login, signup, oauth.

const c = require("./constants");

module.exports = {
    configure: (app, main) => {

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