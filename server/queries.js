// This file handles the database queries.

const bcrypt = require('bcrypt');
const c = require("./constants");

module.exports = function(pool, sessionStore) {
    return {
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
        
    
        logError: (err) => {
            if (err) {
                console.log(err);
            }
        },
        
        simpleQuery: (query, params) => {
            pool.query(query, params, (err) => {
                module.exports.logError(err);
            });
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
        
        
/*bcrypt.genSalt(c.SALT, (err, salt) => {
    module.exports.logError(err);
    bcrypt.hash(pass, salt, (err, hash) => {
        module.exports.logError(err);
        // Store hash in your password DB. 
    });
});*/
        
        // Returns a user object if email and pass are right, otherwise error code
        logIn: (email, pass, ipaddr, sID, cb) => {
            
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
                        "firstname": u.firstname,
                        "lastname": u.lastname,
                        "phone": u.phone,
                        "city": u.city,
                        "status": u.status,
                        "region": u.region_id,
                        "country": u.country_id
                    });
                });
            });
        }
    }
}