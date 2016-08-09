// This file defines global constants for our app.
// General info
exports.SITE_URL = 'https://reputech.herokuapp.com';

// Postgres information
exports.DATABASE_INFO = {
	host: 'ec2-54-243-42-108.compute-1.amazonaws.com',
	port: 5432,
	database: 'ddu88fjcr9a852',
	user: 'eprjxyhertbqxx',
	password: 'j-nGiGLZKxuI6h7CBjyeEhi_QO',
	ssl: true,
	max: 10,
	min: 2,
	idleTimeoutMillis: 1000
};
exports.SQL_INIT_PATH = "./server/Data/Structure.sql"; // File containing SQL struct

// SMTP email url
exports.EMAIL = "reputech.team@gmail.com";
exports.EMAIL_PASS = "222aaaAAA";
exports.TRANSPORT = "smtps://" + exports.EMAIL + ":" +
	exports.EMAIL_PASS + "@smtp.gmail.com";

// Sessions
exports.COOKIE_SECRET = 'reputech2465503F';
exports.REDIS = {
	host: 'pub-redis-14141.us-east-1-3.4.ec2.garantiadata.com',
	port: 14141,
	pass: 'csc309a4'
};

// Admin Info
exports.ADMIN_LOGIN = "admin@reputech.com";
exports.ADMIN_PASS = "RepuTech1";
exports.ADMIN_FIRST_NAME = "RepuTech";
exports.ADMIN_LAST_NAME = "Admin";

// OAUTH
exports.OAUTH_KEYS = {
	/*Facebook: {
		KEY: "427043824132968",
		SECRET: "cbe10b7e7f08235fe6a82a23d911cc4a"
	},*/
	LinkedIn: {
		KEY: "77dy87e08dm9y4",
		SECRET: "70Jlv1wbz2KfkSYN"
	},
	Google: {
		KEY: "705593332793-f56r0fkv52sa3qo67mqf70okpus5024e.apps.googleusercontent.com",
		SECRET: "tqHYQ0wElJTb3eCzzVv9Toav"
	}
};