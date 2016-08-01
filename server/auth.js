// Configures passwords, oauth.
const logger = require("./logger");
const gpw = require("node-gpw");
const bcrypt = require('bcrypt-nodejs');

module.exports = {
	configure: (app, main) => {

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