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
exports.handleUpload = (req, name, folder, shouldResize, cb) => {
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
			new_dir = path.join(__dirname, '../static/images/' + folder + '/'),
			new_path = path.join(new_dir, new_file_full_name);

		// Makes a directory
		if (!fs.existsSync(new_dir)){
			fs.mkdirSync(new_dir);
		}
			
		let s = sharp(old_path);
		s.metadata((err, meta) => {
			logger.logError(err);

			// Resize to square
			if (shouldResize) {
				s.resize(512, 512);
			}
			s.toFile(new_path, (err) => {
				logger.logError(err);
				
				// Delete old file
				//fs.unlinkSync(old_path);
				
				// Success
				cb(new_file_full_name);
			});
		});
	});
}