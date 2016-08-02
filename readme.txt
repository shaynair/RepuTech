Our application uses "gulp" to start itself and start daemons related to files.

First, you should have Node.js 6.x and NPM 3.x installed. 
	I can't guarantee if it will work with lower versions. 
	You can update these at https://nodejs.org/en/download/current/

Next, go to the base directory (where server.js is located)
	Make sure file names are untouched!

Next, type in the following commands:

	npm install -g gulp
	npm install -g nodemon
	npm install

This will read from package.json and install all dependencies, 
and it will also give you the "gulp" and "nodemon" commands.
The "public" folder is also needed for the server to run on (as static files will be stored there)

Finally, just type in the command:

	gulp

This will read from gulpfile.js and will execute the server using nodemon.