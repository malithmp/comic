Purpose: This component is responsible for authenticating users
	On a very high level, the auth server provide controlled access to the user login data in the BE Databse. It does not have any persistant data
	It is just there for the sake of having the code base organized and to leave space for future expansions

	- Contains functionality needed for user authentication
		- Password matching using hash and salt method
		- Token creation for sessions
		- Hash, salt caching (using redis)
		- token caching (FE does this too, this acts as a secondary layer)
		- TODO: token expiration`
	- Handle initial user signup 
		- Relay request to BE Database to acquire a (available) username
		- generate salt and a hash for the password
		- send store that info back to BE Dabtabase
	- Username to UserID lookup (cached)

Prerequisites:
        - redis-server setup and running
	- redis client for nodejs (npm install redis) (also read https://github.com/mranney/node_redis)

How to start:
        - make sure redis is started
	- Run the auth.js

Specs:
	- Hash is 512 bits (Whirlpool)
	- Salt is 256 bits
	- Username is at most 32 chars
	- Userid is an int

Worth Mentionining:
	- For node redis module is used 'npm install redis'

Guide:
	This component does not keep any persistant data. Once a user requests to login, it will check its redis datastore to see if the hash,salt pair exists for that user. If not it will ask for that from the DB. When a user signups, it will relay the request to the DB to acquire a username. If that succeeds, it will compute the hash and salt and put it back to the database (the it will cache it in redis).


Redis Store Structure:
	username -> (hash,salt)
