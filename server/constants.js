// This file defines global constants for our app.

// Postgres information
exports.DATABASE_INFO = {
    host: 'ec2-54-243-42-108.compute-1.amazonaws.com', 
    port: 5432,
    database: 'ddu88fjcr9a852',
    user: 'eprjxyhertbqxx',
    password: 'j-nGiGLZKxuI6h7CBjyeEhi_QO',
    ssl: true,
    max: 20,
    min: 4,
    idleTimeoutMillis: 1000
};
exports.SQL_INIT_PATH = "./Data/Structure.sql"; // File containing SQL struct
exports.SALT = 13; // Salt rounds for Bcrypt
//exports.DATABASE_URL = "postgres://" + pg.user + ":" + pg.password + "@"
//			+ pg.host + ":" + pg.port + "/" + pg.database + "?ssl=true";
			
// SMTP email url
exports.EMAIL = "reputech.team@gmail.com";
exports.EMAIL_PASS = "222aaaAAA";
exports.TRANSPORT = "smtps://" + exports.EMAIL + ":" 
					+ exports.EMAIL_PASS + "@smtp.gmail.com";
                    
// Sessions
exports.COOKIE_SECRET = 'reputech2465503F';
exports.REDIS = {
    host: 'pub-redis-14141.us-east-1-3.4.ec2.garantiadata.com',
    port: 14141,
    pass: 'csc309a4'
};

// Admin Info
exports.ADMIN_LOGIN = "admin@reputech.com";
exports.ADMIN_PASS = "admin";
