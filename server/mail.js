// This file handles the e-mail verification system.
// Requires
const emailer = require('nodemailer');
const c = require('./constants');

// Set up
const trans = emailer.createTransport(c.TRANSPORT);

// Method to send an email, invokes f with a string and boolean (error)
exports.send = (receiver, subjectBody, textBody, f) => {
	const mail = {
		from: c.EMAIL, // sender address 
		to: receiver, // list of receivers 
		subject: subjectBody, // Subject line 
		text: textBody, // plaintext body      
		html: textBody // html body 
	};
	trans.sendMail(mail, (error, info) => {
		if (error) {
			f(error, true);
		} else {
			f(info.response, false);
		}
	});
}