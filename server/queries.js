// This file handles the database queries.

const bcrypt = require('bcrypt');
const fs = require('graceful-fs');
const c = require("./constants");

module.exports = function(pool, sessionStore) {
    return {
        // Checks if database is initialized. If it isn't, initialize it.
        checkAndInitialize: () => {
            pool.query("SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2",
                        [c.DATABASE_INFO.database, "login"], (err, info) => {
                            
                module.exports.logError(err);
                if (info.rowCount == 0) { // No table found, execute SQL
                    module.exports.initializeDatabase();
                }
            });
        },
        
        // Initializes and repopulates a database.
        initializeDatabase: () => {
            simpleQuery(fs.readFileSync(c.SQL_INIT_PATH).toString(), []);
            register(c.ADMIN_LOGIN, 'Normal', c.ADMIN_PASS, 'Admin');
        },
        
        // Returns an associative array of countries to IDs
        getCountries: (cb) => {
            pool.query("SELECT * FROM address_country", [], (err, countries) => {
                module.exports.logError(err);
                
                let ret = {};
                for (let row of countries.rows) {
                    ret[row.country] = row.country_id;
                }
                cb(ret);
            });
        },
        
        // Returns an associative array of states to IDs
        getStates: (country_id, cb) => {
            pool.query("SELECT region, region_id FROM address_region WHERE country_id = $1", [country_id], (err, states) => {
                module.exports.logError(err);
                
                let ret = {};
                for (let row of states.rows) {
                    ret[row.region] = row.region_id;
                }
                cb(ret);
            });
        },
        
        // Helper
        simpleQuery: (query, params) => {
            pool.query(query, params, err => module.exports.logError(err));
        },
        
        // Helper for this file
        logError: (err) => {
            if (err) {
                console.log(err);
            }
        },
        
        // Destroys a session in session store
        destroySession: (sID, cb) => {
            pool.query("UPDATE login SET sessionID = NULL WHERE sessionID = $1", [sID], (err) => {
                module.exports.logError(err);
                sessionStore.destroy(sID, (err) => {
                    module.exports.logError(err);
                    if (cb) {
                        cb();
                    }
                });
            });
        },
        
        // Return a user object if success, otherwise error code
        register: (email, user_type, password = null, privilege = 'Normal', cb) => {
            // Check if exists
            let hashedPassword = password;
            if (password) {
                hashedPassword = bcrypt.hashSync(password, c.SALT);
            }
            // Get user from database
            pool.query("SELECT u_id FROM login WHERE email = $1", [email], (err, users) => {
                module.exports.logError(err);
                
                if (users.rowCount != 0) { // EXISTS
                    cb(0);
                    return;
                }
                
                // Add to database
                pool.query("INSERT INTO login (email, user_type) VALUES ($1, $2) RETURNING u_id", 
                                [email, user_type], (err, users) => {
                    module.exports.logError(err);
                    
                    if (users.rows.length != 1 || users.rows[0].u_id <= 0) {
                        cb(-1); // Unknown error.
                        return;
                    }
                    let u_id = users.rows[0].u_id;
                    
                    if (user_type == 'Normal') {
                        // Add normal user
                        simpleQuery("INSERT INTO auth (u_id, password, privilege) VALUES ($1, $2, $3)", 
                                [hashedPassword, privilege]);
                        
                    }
                    
                    cb({
                        "email": email,
                        "id": u_id,
                        "is_admin": privilege == "Admin",
                        "type": user_type,
                        "info": false
                    });
                });
            });
        },
        
        activateUser: (u_id) => {
        },
        
        editUser: (u_id, firstname, lastname, phone, region_id, city, cb) => {
            // Check if exists
            pool.query("SELECT u_id FROM users WHERE u_id = $1", [u_id], (err, users) => {
                module.exports.logError(err);
                
                if (users.rows.length != 0) { // EXISTS
                    simpleQuery("UPDATE login SET firstname = $1, lastname = $2, "
                            + "phone = $3, region_id = $4, city = $5 WHERE u_id = $6", 
                            [firstname, lastname, phone, region_id, city, u_id]);
                } else { // ADD NEW ENTRY
                    simpleQuery("INSERT INTO login (u_id, firstname, lastname, "
                                + "phone, region_id, city) VALUES ($1, $2, $3, $4, $5, $6)", 
                                [u_id, firstname, lastname, phone, region_id, city]);
                }
                cb();
            });
        },
        
        // Returns a user object if email and pass are right, otherwise error code
        logIn: (email, pass, ipaddr, sID, cb) => {
            
            // Get user from database
            pool.query("SELECT * FROM auth LEFT JOIN login USING (u_id) "
                   + "LEFT JOIN users USING (u_id) "
                   + "LEFT JOIN address_region USING (region_id) "
                   + "LEFT JOIN address_country USING (country_id) WHERE email = $1", [email], (err, users) => {
                module.exports.logError(err);
                
                if (users.rows.length == 0) { // NOT FOUND
                    cb(0);
                    return;
                }
                
                let u = users.rows[0]; // email is UNIQUE KEY
                
                if (u.banned) { // BANNED USER
                    cb(1);
                    return;
                }
                if (u.privilege == "Inactivated") {
                    cb(2); // NOT ACTIVATED
                    return;
                }
                
                // Check password
                bcrypt.compare(pass, u.password, (err, res) => {
                    module.exports.logError(err);
                    
                    if (!res) { // WRONG PASSWORD
                        cb(0);
                        return;
                    }
                    
                    // Destroy the old session
                    module.exports.destroySession(u.sessionID);
                    
                    // Update login time
                    module.exports.simpleQuery("UPDATE login SET login_time = NOW(), "
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