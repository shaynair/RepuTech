// This file handles the main running of the server.

// Do all requires
const express = require('express')();
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const redis = require('connect-redis');
const csrf = require('csurf')();
const expressValidator = require('express-validator');
const favicon = require('serve-favicon');

// File requires
const socket = require('./socket');
const c = require('./constants');

// Server config
const app = express();
app.set('port', process.env.PORT || 80);

// Enable GZIP compression
app.use(compression());

// Enable prevention of clickjacking and other headers
// Also set Content-Security-Policy
app.use(helmet({
    contentSecurityPolicy: {
      // Specify directives as normal. 
      directives: {
        defaultSrc: ["'self'"],
        childSrc: ["'self'"],
        frameAncestors: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        sandbox: ['allow-forms', 'allow-scripts'],
        objectSrc: [] 
      },
      reportOnly: false,
      setAllHeaders: false,
      disableAndroid: false
    }
}));

// Sessions
const RedisStore = redis(session);
app.use( session({
    secret: c.COOKIE_SECRET,
    name: 'session',
    resave: false, // Redis implements touch
    saveUninitialized: false,
    store: new RedisStore(c.REDIS),
    cookie: {
        secure: true,
        maxAge: 6*60*60*1000
    } // 6 hour cookie maximum
});

// CSRF protection for POST
app.use(csrf);

// Static files
app.use(favicon(__dirname + '/../public/favicon.ico'));
app.use(express.static(__dirname + '/../public'));

// Template files
app.set('views', __dirname + '/../views');
app.set('view engine', 'ejs');
app.set('view cache', 'true');

// Enable body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());


// Info to pass to any other modules
const serverInfo = {
}

// Runs the server
exports.run = () => {
	const server = app.listen(app.get('port'), () => {
		console.log('Node is running on port ', app.get('port'));
	});
    
    socket.run(server, serverInfo);
}