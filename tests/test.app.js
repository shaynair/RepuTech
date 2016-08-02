var assert = require('assert');

var app = require("../server/app");
var c = require("../server/constants");


describe("Main application", function () {
	describe("Fields", function () {

		it("App returns a function", function (done) {
			assert.equal(typeof app.app, 'function');
			done();
		});

		it("Run returns a function", function (done) {
			assert.equal(typeof app.run, 'function');
			done();
		});

		it("Database is an object", function (done) {
			assert.equal(typeof app.db, 'object');
			done();
		});
	});

	describe("Database", function () {

		before(function (done) {
			app.db.checkAndInitialize();
			done();
		});

		it("Database.initialize is a function", function (done) {
			assert.equal(typeof app.db.initializeDatabase, 'function');
			done();
		});
	});
});