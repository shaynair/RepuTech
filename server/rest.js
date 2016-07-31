// Configures JSON REST API


const c = require("./constants");
const mailer = require("./mail");
const formidable = require("formidable");
const fs = require("graceful-fs");
const sharp = require("sharp");

// Helpers
function setAttempts(req) {
    req.session.attempts = req.session.attempts || 0;
    req.session.attempts++;
    req.session.attemptTime = Math.floor(new Date() / 1000);
    req.session.save();
}

function hasAttempts(req) {
    if (req.session.attemptTime && req.session.attemptTime >= 
             (Math.floor(new Date() / 1000) - 30)) {
                // Within 30 seconds
        if (req.session.attempts >= 5) {
            return true;
        }
    } else if (req.session.attempts) {
        delete req.session.attempts;
        delete req.session.attemptTime;
        req.session.save();
    }
    return false;
}

function logError(err) {
    if (err) {
        console.log(err);
    }
}

const CALLS = {
    'get-states': {
        post: false, 
        api: true,
        validate: (req) => {
            req.checkBody('country', 'Invalid').len(2, 2);
        },
        perform: (req, main, cb) => {
            main.db.getStates(req.body.country, cb);
        }
    },
    
    'reset-pass':  {
        post: true,
        logged_out: true,
        api: true,
        validate: (req) => {
            req.checkBody('email', 'Required field').notEmpty();
            req.checkBody('email', 'Must be an email').isEmail();
            req.checkBody('email', 'Must be an email').isRegularEmail();
        },
        perform: (req, main, cb) => {
            // If they've used it too much
            if (hasAttempts(req)) {
                cb({status: "Attempts"});
                return;
            }
            
            main.db.resetPassStart(req.body.email, (user) => {
                let ret = {};
                if (user) {
                    ret.status = "OK";
                    
                    mail.send(req.body.email, 
                        "RepuTech Password Reset", // subject
                        "You or someone using your e-mail has requested a password reset. "
                        + "Go to this link: " + c.SITE_URL + "/reset?token=" + user 
                        + " to reset it. It is valid for 24 hours. Your new password will be "
                        + token + " after you click on it.", (res, err) => {
                            
                        if (err) {
                            logError(res);
                        }
                    });
                } else {
                    ret.status = "Bad";
                }
                setAttempts(req);
                ret.attempts = req.session.attempts;
                cb(ret);
            });
        }
    },
    
    'reset':  {
        logged_out: true,
        validate: (req) => {
            req.checkQuery('token', 'Invalid').notEmpty();
        },
        perform: (req, main, cb) => {
            main.db.resetPassEnd(req.query.token, (user) => cb(null));
        }
    },
    
    'confirm':  {
        logged_out: true,
        validate: (req) => {
            req.checkQuery('id', 'Invalid').notEmpty();
            req.checkQuery('id', 'Invalid').isNumeric();
            req.sanitize('id').toInt();
        },
        perform: (req, main, cb) => {
            main.db.activateUser(req.query.id, (user) => cb(null));
        }
    },
    
    'login-form':  {
        post: true,
        logged_out: true,
        api: true,
        validate: (req) => {
            req.checkBody('email', 'Required field').notEmpty();
            req.checkBody('pass', 'Required field').notEmpty();
            
            req.checkBody('email', 'Must be an email').isEmail();
            req.checkBody('email', 'Must be an email').isRegularEmail();
            req.checkBody('pass', 'Must match the format').isPassword();
        },
        perform: (req, main, cb) => {
            // If they've used it too much
            if (hasAttempts(req)) {
                cb({status: "Attempts"});
                return;
            }
            
            main.db.logIn(req.body.email, req.body.pass, req.ip, 
                                req.sessionID, (user) => {
                let ret = {};
                if (!user) {
                    ret.status = "Bad";
                    setAttempts(req);
                } else if (user == 1) {
                    ret.status = "Banned";
                } else if (user == 2) {
                    ret.status = "Inactivated";
                } else {
                    ret.status = "OK";
                    req.session.user = user;
                    req.session.save();
                }
                ret.attempts = req.session.attempts;
                cb(ret);
            });
        }
    },
    
    'signup-form':  {
        post: true,
        logged_out: true,
        api: true,
        validate: (req) => {
            req.checkBody('email', 'Required field').notEmpty();
            req.checkBody('pass', 'Required field').notEmpty();
            req.checkBody('firstname', 'Required field').notEmpty();
            req.checkBody('lastname', 'Required field').notEmpty();
            req.checkBody('country', 'Required field').notEmpty();
            req.checkBody('state', 'Required field').notEmpty();
            req.checkBody('city', 'Required field').notEmpty();
            req.checkBody('phone', 'Required field').notEmpty();
            
            req.checkBody('email', 'Must be an email').isEmail();
            req.checkBody('email', 'Must be valid email').isRegularEmail();
            req.checkBody('email', 'Max length of 100').isLength({max: 100});
            req.checkBody('pass', 'Must match format').isPassword();
            req.checkBody('firstname', 'Letters only').isAlpha();
            req.checkBody('lastname', 'Letters only').isAlpha();
            req.checkBody('firstname', 'Max length of 50').isLength({max: 50});
            req.checkBody('lastname', 'Max length of 50').isLength({max: 50});
            req.checkBody('country', 'Letters only').isAlpha();
            req.checkBody('country', 'Invalid').len(2, 2);
            req.checkBody('state', 'Numbers only').isNumeric();
            req.checkBody('city', 'Letters only').isAlpha();
            req.checkBody('city', 'Max length of 50').isLength({max: 50});
            req.checkBody('phone', 'Numbers only').isNumeric();
            req.checkBody('phone', 'Length between 10 and 12').len(10, 12);
            req.checkBody('job', 'Letters only').optional().isText();
            
            req.assert('email2', 'Do not match').equals(req.body.email);
            req.assert('pass2', 'Do not match').equals(req.body.pass);
        },
        perform: (req, main, cb) => {
            main.db.register(req.body.email, 'Normal', req.body.pass, 'Normal', (user) => {
                let ret = {};
                if (!user) {
                    ret.status = "Exists";
                    cb(ret);
                } else if (user == -1) {
                    ret.status = "Bad";
                    cb(ret);
                } else {
                    ret.status = "OK";
                    main.db.editUser(user.id, req.body.firstname, req.body.lastname, 
                            req.body.phone, req.body.state, req.body.city, req.body.job, 
                            req.ip, req.sessionID, (user) => {

                        if (req.session.user && req.session.user.is_admin) {
                            ret.status = "Done"; // No need for verification
                            main.db.activateUser(user.id, (user) => cb(ret));
                        } else {
                            mail.send(req.body.email, 
                                "RepuTech Registration", // subject
                                "You or someone using your e-mail has requested a registration. "
                                + "Go to this link: " + c.SITE_URL + "/confirm?id=" + user.id
                                + " to activate it.", (res, err) => {
                                    
                                if (err) {
                                    logError(res);
                                }
                                
                                cb(ret);
                            });
                        }
                    });
                }
                
            });
        }
    },
    
    'get-wiki':  {
        api: true,
        validate: (req) => {
            req.checkQuery('id', 'Required field').notEmpty();
            req.checkQuery('id', 'Must be a number').isNumeric();
            req.sanitize('id').toInt();
        },
        perform: (req, main, cb) => {
            main.db.getWikiData(req.query.id, cb);
        }
    },
    
    'get-similar':  {
        api: true,
        validate: (req) => {
            req.checkQuery('id', 'Required field').notEmpty();
            req.checkQuery('id', 'Must be a number').isNumeric();
            req.sanitize('id').toInt();
        },
        perform: (req, main, cb) => {
            main.db.getPost(req.query.id, (post) => {
                main.db.getSimilarPosts(post, cb);
            });
        }
    },
    
    
    'get-messages':  {
        logged_in: true,
        api: true,
        validate: (req) => {},
        perform: (req, main, cb) => {
            main.db.getMessageData(req.session.user.id, cb);
        }
    },
    
    'add-message':  {
        logged_in: true,
        api: true,
        post: true,
        validate: (req) => {
            req.checkBody('reply', 'Required field').notEmpty();
            req.checkBody('to', 'Required field').notEmpty();
            req.checkBody('to', 'Must be a number').isNumeric();
            req.sanitize('to').toInt();
            req.sanitize('reply');
            
            if (req.body.to && req.session.user.id == req.body.to) {
                req.assert('id', 'Do not match').equals("");
            }
        },
        perform: (req, main, cb) => {
            main.db.addMessage(req.session.user.id, req.body.to, req.body.reply, (ret) => cb({status: ret}));
        }
    },
    
    'get-images':  {
        logged_in: true,
        api: true,
        validate: (req) => {},
        perform: (req, main, cb) => {
            main.db.getImageData(req.session.user.id, cb);
        }
    },
    
    
    'follow':  {
        logged_in: true,
        api: true,
        validate: (req) => {
            req.checkQuery('id', 'Required field').notEmpty();
            req.checkQuery('id', 'Must be a number').isNumeric();
            req.sanitize('id').toInt();
            if (req.query.id && req.session.user.id == req.query.id) {
                req.assert('id', 'Do not match').equals("");
            }
        },
        perform: (req, main, cb) => {
            main.db.tryFollow(req.session.user.id, req.query.id, (ret) => cb({status: ret}));
        }
    },
    
    'like':  {
        logged_in: true,
        api: true,
        validate: (req) => {
            req.checkQuery('id', 'Required field').notEmpty();
            req.checkQuery('id', 'Must be a number').isNumeric();
            req.sanitize('id').toInt();
            
        },
        perform: (req, main, cb) => {
            main.db.tryLike(req.query.id, req.session.user.id, (ret) => cb({status: ret}));
        }
    },
    
    'search-posts':  {
        api: true,
        validate: (req) => {
            req.checkQuery('query', 'Required field').notEmpty();
           
            req.sanitize('query');
        },
        perform: (req, main, cb) => {
            main.db.searchPosts(req.session.user, req.query.query, cb);
        }
    },
    
    'get-posts':  {
        api: true,
        validate: (req) => {
            req.checkQuery('id', 'Required field').notEmpty();
            req.checkQuery('id', 'Must be a number').isNumeric();
            req.sanitize('id').toInt();
        },
        perform: (req, main, cb) => {
            main.db.getPosts(req.query.id, cb);
        }
    },
    
    'add-wiki':  {
        post: true,
        logged_in: true,
        api: true,
        validate: (req) => {
            req.checkBody('title', 'Required field').notEmpty();
            req.checkBody('content', 'Required field').notEmpty();
           
            req.sanitize('title');
            req.sanitize('content');
        },
        perform: (req, main, cb) => {
            main.db.addWiki(req.session.user.id, req.body.title, req.body.content, (ret) => cb({status: ret}));
        }
    },
    
    'add-post':  {
        post: true,
        logged_in: true,
        api: true,
        validate: (req) => {
            req.checkBody('title', 'Required field').notEmpty();
            req.checkBody('content', 'Required field').notEmpty();
            req.checkBody('privacy', 'Required field').notEmpty();
           
            req.sanitize('title');
            req.sanitize('content');
            req.sanitize('privacy');
            req.sanitize('posttype').toBoolean();
        },
        perform: (req, main, cb) => {
            main.db.addPost(req.session.user.id, req.body.title, req.body.content, req.body.privacy, req.body.urgency, req.body.posttype, (ret) => cb({status: ret}));
        }
    },
    
    // Image upload
    'new-image':  {
        logged_in: true,
        api: true,
        post: true,
        validate: (req) => {},
        perform: (req, main, cb) => {
            let form = new formidable.IncomingForm();
            form.parse(req, (err, fields, files) => {
                logError(err);
                
                // Only images are allowed
                if (files.file.type != 'image/png' && files.file.type != 'image/jpeg'){
                    cb(null);
                    return;
                }
                
                // `file` is the name of the <input> field of type `file`
                let old_path = files.file.path,
                    file_size = files.file.size,
                    file_ext = files.file.name.split('.').pop(),
                    index = old_path.lastIndexOf('/') + 1,
                    file_name = old_path.substr(index),
                    new_path = path.join(process.env.PWD, '/static/assets/images/avatar/', file_name + '.' + file_ext);
                    
                console.log("Got file to " + old_path);
                
                sharp(old_path).resize(100, 100).toFile(new_path, function(err) {
                    logError(err);
                    // Success
                    main.db.addImage(req.session.user.id, file_name + '.' + file_ext, (ret) => cb(null));
                });
            });
        }
    },
    
    'set-image':  {
        logged_in: true,
        api: true,
        validate: (req) => {
            req.checkBody('url', 'Required field').notEmpty();
           
            req.sanitize('url');
        },
        perform: (req, main, cb) => {
            main.db.setImage(req.session.user.id, req.body.url, (ret) => cb({status: ret}));
        }
    },
    
    'delete-image':  {
        logged_in: true,
        api: true,
        validate: (req) => {
            req.checkBody('url', 'Required field').notEmpty();
           
            req.sanitize('url');
        },
        perform: (req, main, cb) => {
            main.db.deleteImage(req.session.user.id, req.body.url, (ret) => cb({status: ret}));
        }
    },
    
    'change-settings': {
        post: true,
        logged_in: true,
        api: true,
        validate: (req) => {
            req.checkBody('id', 'Required field').notEmpty();
            req.checkBody('id', 'Must be a number').isNumeric();
            req.sanitize('id').toInt();
            
            req.checkBody('firstname', 'Required field').notEmpty();
            req.checkBody('lastname', 'Required field').notEmpty();
            req.checkBody('country', 'Required field').notEmpty();
            req.checkBody('phone', 'Required field').notEmpty();
            
            req.checkBody('firstname', 'Letters only').isAlpha();
            req.checkBody('lastname', 'Letters only').isAlpha();
            req.checkBody('firstname', 'Max length of 50').isLength({max: 50});
            req.checkBody('lastname', 'Max length of 50').isLength({max: 50});
            req.checkBody('city', 'Letters only').isAlpha();
            req.checkBody('city', 'Max length of 50').isLength({max: 50});
            req.checkBody('phone', 'Numbers only').isNumeric();
            req.checkBody('phone', 'Length between 10 and 12').len(10, 12);
            req.checkBody('job', 'Letters only').optional().isText();
            req.checkBody('status', 'Letters only').optional().isText();
            
            req.checkBody('currentpass', 'Must be a password').optional().isPassword();
            req.checkBody('newpass', 'Must be a password').optional().isPassword();
            
            req.assert('newpass2', 'Do not match').equals(req.body.newpass2);
            
            if (req.body.id && req.session.user.id != req.body.id && !req.session.user.is_admin) {
                req.assert('id', 'Do not match').equals("");
            }
            // Only non-third party can change passwords
            if (req.body.currentpass && req.session.user.user_type != "Normal") {
                req.assert('id', 'Do not match').equals("");
            }
        },
        perform: (req, main, cb) => {
            main.db.addWiki(req.body.id, req.body.firstname, req.body.lastname,
                            req.body.phone, req.body.city, req.body.job, req.body.status,
                            req.body.newpass, req.body.currentpass, (ret) => cb({status: ret}));
        }
    }
}

module.exports = {
    configure: (app, main) => {
        // Standard CALLS
        let f = (req, res, r) => {
            if (!req.body) {
                return res.sendStatus(400); // Error
            }
            main.setIP(req);
            
            res.setHeader('Content-Type', 'application/json');
            let ret = {};
            if (CALLS[r].logged_in && !req.session.user) {
                ret.error = "Must be logged in";
            } else if (CALLS[r].logged_out && req.session.user) {
                ret.error = "Must be logged out";
            } else if (CALLS[r].needs_admin 
                    && (!req.session.user || !req.session.user.is_admin)) {
                ret.error = "Insufficient privileges";
            } else {
                CALLS[r].validate(req);
                if (req.validationErrors()) {
                    ret.error = "Invalid parameters";
                } else {
                    CALLS[r].perform(req, main, (r) => {
                        if (r) {
                            res.send(JSON.stringify(r));
                        } else {
                            res.redirect("/");
                        }
                    });
                    return;
                }
            }
            res.send(JSON.stringify(ret));
        };
        // Configure routes
        for (let r in CALLS) {
            if (CALLS[r].post) {
                app.post('/' + (CALLS[r].api ? 'api/' : '') + r, (req, res) => f(req, res, r));
            } else {
                app.get('/' + (CALLS[r].api ? 'api/' : '') + r, (req, res) => f(req, res, r));
            }
        }
    }
}