// This file handles the main running of the server.

// Do all requires
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const redis = require('connect-redis');
const csrf = require('csurf')();
const expressValidator = require('express-validator');
const favicon = require('serve-favicon');
const pg = require('pg');
const Pool = require('pg-pool');

// File requires
const socket = require('./socket');
const c = require('./constants');
const routes = require('./routes');
const auth = require('./auth');
const queries = require('./queries');

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
        scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com",
                    "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: [],
        sandbox: ["allow-forms", "allow-scripts", "allow-same-origin",
                    "allow-top-navigation", "allow-modals"] 
      },
      reportOnly: false,
      setAllHeaders: false,
      disableAndroid: false
    }
}));

// Sessions
const RedisStore = redis(session);
const sessionStore = new RedisStore(c.REDIS);
app.use(session({
    secret: c.COOKIE_SECRET,
    name: 'session',
    resave: false, // Redis implements touch
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: true,
        maxAge: 6*60*60*1000
    } // 6 hour cookie maximum
}));

// CSRF protection for POST
app.use(csrf);

// Static files
app.use(favicon(__dirname + '/../public/favicon.ico'));
app.use(express.static(__dirname + '/../public'));

// Template files
app.set('views', __dirname + '/../views');
app.set('view engine', 'ejs');
//app.set('view cache', 'true');

// Enable body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

// Database connection
const pool = new Pool(c.DATABASE_INFO);
const db = queries(pool, sessionStore);

// Exports for other files
module.exports = {
    // Runs server
    run: () => {
        // Check if SQL is ready
        db.checkAndInitialize();
        
        // Configure routes
        routes.configure(app, module.exports);
        auth.configure(app, module.exports);
        
        // Run the server
        const server = app.listen(app.get('port'), () => {
            console.log('Node is running on port', app.get('port'));
        });
        socket.run(server, module.exports);
    },
    
    // Does a query to database (text, values, cb)
    query: pool.query,
    
    // Formatted queries
    "db": db
}