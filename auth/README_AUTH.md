Purpose: This component is responsible for authenticating users
        - Keeps user credentials in a table which contains (username,password hash,salt) triplets
        - Stores username/passwords upon request
        - retrieves (username,hash,salt) upon request
        - Verifies username,salt pairs

Prerequisites:
        - MySQL server setup and running
        - Databse with (Empty or non-empty tables) must be present before startup

How to start:
        - Run the databse initializer scipt
        - Run the auth.js

Specs:
	- Hash is 512 bits (Whirlpool)
	- Salt is 256 bits
	- Username is at most 32 chars

Worth Mentionining:
	- We can get the databse path by issuing "mysql @@datadir;"
	- For node mysql module is used 'npm install mysql'
