// This file handles the database queries.

const bcrypt = require('bcrypt');
const fs = require('graceful-fs');
const c = require("./constants");

module.exports = function(pool, sessionStore) {
    return {
        // Checks if database is initialized. If it isn't, initialize it.
        checkAndInitialize: function() {
            // Postgres has a neat little function to check if a table exists
            this.query("SELECT to_regclass($1);",
                        ["login"], (info) => {
                            
                if (!info || info.rows.length == 0 || !info.rows[0]) { // No table found, execute SQL
                    this.initializeDatabase();
                }
            });
        },
        
        logError: function(err) {
            if (err) {
                console.log(err);
            }
        },
        
        // Initializes and repopulates a database.
        initializeDatabase: function() {
            this.simpleQuery(fs.readFileSync(c.SQL_INIT_PATH).toString(), []);
            this.register(c.ADMIN_LOGIN, 'Normal', c.ADMIN_PASS, 'Admin');
        },
        
        // Returns an associative array of countries to IDs
        getCountries: function(cb) {
            this.query("SELECT * FROM address_country", [], (countries) => {

                let ret = {};
                for (let row of countries.rows) {
                    ret[row.country] = row.country_id;
                }
                cb(ret);
            });
        },
        
        // Returns an associative array of states to IDs
        getStates: function(country_id, cb) {
            this.query("SELECT region, region_id FROM address_region WHERE country_id = $1", [country_id], (states) => {
                let ret = {};
                for (let row of states.rows) {
                    ret[row.region] = row.region_id;
                }
                cb(ret);
            });
        },
        
        // Helper
        simpleQuery: function(query, params) {
            this.query(query, params);
        },
        
        query: function(query, params, cb) {
            pool.query(query, params, (err, res) => {
                this.logError(err);
                if (cb) {
                    cb(res);
                }
            });
        },
        
        // Destroys a session in session store
        destroySession: function(sID, cb) {
            this.query("UPDATE login SET sessionID = NULL WHERE sessionID = $1", [sID], () => {
                sessionStore.destroy(sID, (err) => {
                    this.logError(err);
                    if (cb) {
                        cb();
                    }
                });
            });
        },
        
        // Return a user object if success, otherwise error code
        register: function(email, user_type, password = null, privilege = 'Normal', cb) {
            // Check if exists
            let hashedPassword = password;
            if (password) {
                hashedPassword = bcrypt.hashSync(password, c.SALT);
            }
            // Get user from database
            this.query("SELECT u_id FROM login WHERE email = $1", [email], (users) => {
                if (users && users.rows.length != 0) { // EXISTS
                    if (cb) {
                        cb(0);
                    }
                    return;
                }
                
                // Add to database
                this.query("INSERT INTO login (email, user_type) VALUES ($1, $2) RETURNING u_id", 
                                [email, user_type], (users) => {
                                    
                    if (!users || users.rows.length != 1 || users.rows[0].u_id <= 0) {
                        if (cb) {
                            cb(-1); // Unknown error.
                        }
                        return;
                    }
                    let u_id = users.rows[0].u_id;
                    
                    if (user_type == 'Normal') {
                        // Add normal user
                        this.simpleQuery("INSERT INTO auth (u_id, password, privilege) VALUES ($1, $2, $3)", 
                                [hashedPassword, privilege]);
                        
                    }
                    if (cb) {
                        cb({
                            "email": email,
                            "id": u_id,
                            "is_admin": privilege == "Admin",
                            "type": user_type,
                            "info": false
                        });
                    }
                });
            });
        },
        
        // Activates a user
        activateUser: function(u_id, cb) {
            this.query("UPDATE auth SET privilege = 'Normal' WHERE "
                    + "u_id = $1 AND privilege = 'Inactivated'", [u_id], cb);
        },
        
        // Activates a user
        updateStatus: function(u_id, status, cb) {
            this.query("UPDATE users SET status  = $1 WHERE u_id = $2", [status, u_id], cb);
        },
        
        editUser: function(u_id, firstname, lastname, phone, region_id, city, cb) {
            // Check if exists
            this.query("SELECT u_id FROM users WHERE u_id = $1", [u_id], (users) => {

                if (users && users.rows.length != 0) { // EXISTS
                    this.simpleQuery("UPDATE users SET firstname = $1, lastname = $2, "
                            + "phone = $3, region_id = $4, city = $5 WHERE u_id = $6", 
                            [firstname, lastname, phone, region_id, city, u_id]);
                } else { // ADD NEW ENTRY
                    this.simpleQuery("INSERT INTO users (u_id, firstname, lastname, "
                                + "phone, region_id, city) VALUES ($1, $2, $3, $4, $5, $6)", 
                                [u_id, firstname, lastname, phone, region_id, city]);
                }
                if (cb) {
                    cb();
                }
            });
        },
        
        // Returns a user object if email and pass are right, otherwise error code
        logIn: function(email, pass, ipaddr, sID, cb) {
            
            // Get user from database
            this.query("SELECT * FROM auth LEFT JOIN login USING (u_id) "
                   + "LEFT JOIN users USING (u_id) "
                   + "LEFT JOIN address_region USING (region_id) "
                   + "LEFT JOIN address_country USING (country_id) WHERE email = $1", [email], (users) => {

                if (!users || users.rows.length == 0) { // NOT FOUND
                    if (cb) {
                        cb(0);
                    }
                    return;
                }
                
                let u = users.rows[0]; // email is UNIQUE KEY
                
                if (u.banned) { // BANNED USER
                    if (cb) {
                        cb(1);
                    }
                    return;
                }
                if (u.privilege == "Inactivated") {
                    if (cb) {
                        cb(2); // NOT ACTIVATED
                    }
                    return;
                }
                
                // Check password
                bcrypt.compare(pass, u.password, (err, res) => {
                    this.logError(err);
                    
                    if (!res) { // WRONG PASSWORD
                        if (cb) {
                            cb(0);
                        }
                        return;
                    }
                    
                    // Destroy the old session
                    this.destroySession(u.sessionID);
                    
                    // Update login time
                    this.simpleQuery("UPDATE login SET login_time = NOW(), "
                        + "ip_address = $1, sessionID = $2 WHERE u_id = $3", [ipaddr, sID, u.u_id]);

                    // Found and succeeded. Return user object
                    cb({
                        "email": email,
                        "id": u.u_id,
                        "is_admin": u.privilege == "Admin",
                        "type": u.user_type,
                        "info": {
                            "firstname": u.firstname,
                            "lastname": u.lastname,
                            "phone": u.phone,
                            "city": u.city,
                            "status": u.status,
                            "region": u.region_id,
                            "country": u.country_id
                        }
                    });
                });
            });
        }
    }
}