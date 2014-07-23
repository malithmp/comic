# Initializes an sql databse
# Creates necessary tables
# Adds initial uzers if required

# First check if the tables exist. If they do, warn user
#TODO  If user persists, drop that databse and create a new one

# user_hash_salt table
# id is the auto increment int key (unique to each user)
# username is at most 32 characters long
# salt is 256 bits (64 hex chars)
# hash is 512 bits (128 Hex chars)

# user_tokens table
# username is at most 32 characters long
# token is 256 characters long
# expiry is the time the token expires (POSIX time)

# user_account_info
# userid is the user's id from the user_hash_salt table
# useremail is the user's email addreess in case of recovert
# secq1 is the security question1
# secq2 is the security question2
# seca1 is the answer to security q1
# seca2 is the answer to security q2

# user_album
# username
# album name -  unique per user, not unique among users [user cannot have the same album name repeated,] but two users can have albums with the same name
# album id - unique id for each albums
# num_img - bnumber of images in this album

# album_image
# order - 1srst image of the album will have a lower value, last will have a higher value, Images must be added in order
# albumid - incremented id from the user_album tablke
# imageid - image if deom the images table

# images
# filename
# imageid

import os
import sys
import json

database=''
username=''
password=''

defaults=''

def main():
	inputs=sys.argv
	config={}
	if len(inputs)==1:
		print('Too few arguments!\nHint ./initializer.pl ../config.json\n')
		return
	
	config=parseConfig(inputs[1])
	global database
	global username
	global password
	database=config['servers']['dbServer']['mysqlDatabase']
	username=config['servers']['dbServer']['mysqlUsername']
	password=config['servers']['dbServer']['mysqlPassword']

	defaults = setDefaults()
	initialize()

def setDefaults():
	# information about default entries in the database
	# Default database entry for debug purposes
	# hash is whirlpool512(defaultsalt+defaultPass)
	global defaults
	defaults={
		'defaultUser':'defaultuser',
		'deafaultPassword':'defaultpassword',
		'defaultHash':'1a4b558a55a31d3458cadda36b9b87358cd740255f6b7200383b0e1d8a276ac1654dd91058aae659483fa7237c56aac594527df558d6e4f209a1c424341e9335',
		'defaultSalt':'34a8977c6367b42327ae067bd13e08573557d7ca83374de3c25dc65adc6e3636'
	}
	return defaults	

def parseConfig(filepath):
	f=open(filepath,'r')
	testdata=json.loads(f.read())
	return testdata

	ofset='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'

def initialize():
	result=''

	print("Starting Database initialization procedure...\n")
	cmd='select @@datadir;'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()	
	print('Data Dir: '+result)

	print('Checking for existing database: ')
	cmd='use '+database+';'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	result=result[:-1]

	if result ==  "ERROR 1049 (42000) at line 1: Unknown database "+'\''+database+'\'':
		print('Database does not exist! Creating a new one')
		cmd='create database '+database+';'
		command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
		result=os.popen(command).read()
	else:
		print('Database Exists! Drop it and create a fresh one')
		cmd='drop database '+database+';'
		command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
		result=os.popen(command).read()
		cmd='create database '+database+';'
		command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
		result=os.popen(command).read()

	print('Creating Tables...')
	# user_hash_salt
	cmd='use '+database+'; create table user_hash_salt(id int primary key auto_increment,username varchar(32) unique not null, hash varchar(128) not null, salt varchar(64) not null);'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()

	cmd='use '+database+'; show columns from user_hash_salt;'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	print(result)

	# user_tokens
	cmd='use '+database+'; create table user_tokens(username varchar(32) unique not null, token varchar(256) not null,expiry int not null);'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()

	cmd='use '+database+'; show columns from user_tokens;'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	print(result)
	
	# user_account_info
	cmd='use '+database+'; create table user_account_info(username varchar(32) unique not null, email varchar(64) unique not null, secq1 varchar(128) not null, secq2 varchar(128) not null, seca1 varchar(64) not null, seca2 varchar(64) not null);' 
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()

	cmd='use '+database+'; show columns from user_account_info;'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	print(result)

        # user_album
	cmd='use '+database+'; create table user_album(username varchar(32) not null, albumname varchar(256) not null,albumid int key auto_increment, numimg int not null);'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
  	result=os.popen(command).read()

	cmd='use '+database+'; show columns from user_album;'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	print(result)

	# album_image
	cmd='use '+database+'; create table album_image(order int primary key auto_increment ,albumid int not null, imageid int not null);'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()

	cmd='use '+database+'; show columns from album_image;'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	print(result)

	# images
	cmd='use '+database+'; create table images(imageid int primary key auto_increment , filename varchar(256) unique not null);'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()

	cmd='use '+database+'; show columns from user_tokens;'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	print(result)
	
	# Add dummy username hash salt combo: defultuser, defaultpass (hashed with salt)
	cmd='use '+database+'; insert into user_hash_salt values(null,\''+defaults['defaultUser']+'\',\''+defaults['defaultHash']+'\',\''+defaults['defaultSalt']+'\');'
	command='mysql -u '+username+' -p'+password+' -e \"'+cmd+'\" 2>&1'
	result=os.popen(command).read()
	print(result)

if __name__ == '__main__':
  main()
