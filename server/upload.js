// This file handles the file upload system.
// Requires
const formidable = require("formidable");
const fs = require("graceful-fs");
const sharp = require("sharp");
const path = require("path");
const shortid = require('shortid');
const logger = require('./logger');

// Method to handle an image upload, "name" is the field name
// cb is a function that takes in a string (filename)
exports.handleUpload = (req, name, cb, shouldResize = true) => {
	let form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		logger.logError(err);

		// Only images are allowed
		if (!files.file.type.startsWith('image/')) {
			fs.unlinkSync(files.file.path); // Delete it
			cb(null);
			return;
		}

		let old_path = files.file.path,
			file_ext = files.file.name.split('.').pop(),
			index = old_path.lastIndexOf(path.sep) + 1, // Index of last separator
			file_name = old_path.substr(index),
			new_file_name = shortid.generate(), // Generate a new filename
			new_file_full_name = new_file_name + '.' + file_ext,
			new_path = path.join(__dirname, '../static/images/avatar/',
				new_file_full_name);

		let s = sharp(old_path);
		s.metadata((err, meta) => {
			logger.logError(err);

			// Resize to square
			if (shouldResize) {
				let lower = Math.min(512, Math.min(meta.width, meta.height));
				s.resize(lower, lower);
			}
			s.toFile(new_path, (err) => {
				logger.logError(err);
				
				// Delete old file
				fs.unlinkSync(old_path);
				
				// Success
				cb(new_file_full_name);
			});
		});
	});
}