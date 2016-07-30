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