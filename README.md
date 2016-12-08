# RepuTech

A sharing economy project made for CSC309 at the University of Toronto.

Example deployment can be found [here](https://reputech.herokuapp.com).

## Table of Contents

- [Introduction](#introduction)
- [How to start](#how-to-start)
- [Contributing](#contributing)

## How to start

* This project requires _Node 6_ and _NPM 3.10 or greater_.

1. Clone the project.

2. Point `server/constants.js` to your PostgreSQL, Redis, OAUTH and SMTP keys.

```javascript

// PostgreSQL
exports.DATABASE_INFO = {
	host: ...,
	port: ...,
	database: ...,
	user: ...,
	password: ...,
    ...
};

// SMTP
exports.EMAIL = ...;
exports.EMAIL_PASS = ...;

// Redis
exports.REDIS = {
	host: ...,
	port: ...,
	pass: ...
};

// OAUTH
exports.OAUTH_KEYS = {
	Facebook: {
		KEY: ...,
		SECRET: ...
	},
	LinkedIn: {
		KEY: ...,
		SECRET: ...
	},
	Google: {
		KEY: ...,
		SECRET: ...
	}
};
```

```shell
# In project root
npm i
npm i -g gulp nodemon
npm update
gulp
```

## Contributing

This project is discontinued. However pull requests and issues will still be accepted.

How to contribute? Here are some ideas:

- [ ] Change project from jQuery to entirely React
- [ ] Improve on the social network aspects
- [ ] Write more test cases