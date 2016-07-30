// Configures login, signup, oauth.

module.exports = {
    configure: (app, main) => {
        // TODO
    },
    
    logError: (err) => {
        if (err) {
            console.log(err);
        }
    },
    
    generateData: (req, r) => {
        let ret = {};
        if (req.session.user) {
            ret.user = req.session.user;
        }
        return ret;
    }
}