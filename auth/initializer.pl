#!/usr/bin/perl
# Initializes an sql databse
# Creates necessary tables
# Adds initial uzers if required

# First check if the tables exist. If they do, warn user
#TODO  If user persists, drop that databse and create a new one

# user_hash_salt table
# Username is at most 32 characters long
# Salt is 256 bits (64 hex chars)
# Hash is 512 bits (128 Hex chars)

# user_tokens table
# userid is the user's id from the user_hash_salt table
# token is the token provided to user during previous login

# user_account_info
# userid is the user's id from the user_hash_salt table
# useremail is the user's email addreess in case of recovert
# secq1 is the security question1
# secq2 is the security question2
# seca1 is the answer to security q1
# seca2 is the answer to security q2

#------------------ MAIN -------------------
my $numArgs=$#ARGV+1;
my $FILE;
if($numArgs<=0){
	print "Too few arguments!\nHint ./initializer.pl config.txt\n";
	exit;
}
open (FILE,$ARGV[0]);
my @configParams =<FILE>;

my $database="default_comic";
my $username="default_root";
my $password="default_comic";

# Default database entry for debug purposes
# hash is whirlpool512(defaultsalt+defaultPass)
my $defaultUser="defaultuser";
#my $defaultPassword="defaultpassword";
#my $defaultHash="31B105EF48902005FCC12CE52622BE88E9647B029B1088EBF885DB778E1C361446BCDE07C2A38F2B7CAD7EDF994FCDE8351E5E320C89DC947CCC2B27A23166F8";
#my $defaultSalt="34A8977C6367B42327AE067BD13E08573557D7CA83374DE3C25DC65ADC6E3636";
my $defaultHash="1a4b558a55a31d3458cadda36b9b87358cd740255f6b7200383b0e1d8a276ac1654dd91058aae659483fa7237c56aac594527df558d6e4f209a1c424341e9335";
my $defaultSalt="34a8977c6367b42327ae067bd13e08573557d7ca83374de3c25dc65adc6e3636";

parseConfig();
initialize();
#----------------- END MAIN ---------------

sub parseConfig(){
	foreach $item (@configParams){
		chomp($item);
		my @kv = split('=',$item);
		if(@kv[0] eq "database"){
			$database=@kv[1];
		}
		elsif(@kv[0] eq "username"){
			$username=@kv[1];
		}
		elsif(@kv[0] eq "password"){
			$password=@kv[1];
		}
			
	}
}
#@result=`mysql -u$username -p$password -e \";\" 2>&1`;

sub initialize(){
	print "Starting Database initialization procedure...\n";
	my @result = `mysql -u $username -p$password -e \"select \@\@datadir;\" 2>&1`;
	print "Data Directory: @result[1]";
	
	print "Checking for existing database: ";
	@result = `mysql -u$username -p$password -e \"use $database;\" 2>&1`;
	my $temp = @result[0];
	chomp($temp);

	if($temp eq "ERROR 1049 (42000) at line 1: Unknown database \'$database\'"){
		print "Database does not exist! Creating a new one\n";
		@result=`mysql -u$username -p$password -e \"create database $database;\" 2>&1`;
	}else{
		print "Database Exists! Drop it and create a fresh one\n";
		@result=`mysql -u$username -p$password -e \"drop database $database;\" 2>&1`;
		@result=`mysql -u$username -p$password -e \"create database $database;\" 2>&1`;
	}

	print "Creating Tables...\n";

	#user_hash_salt	
	@result=`mysql -u$username -p$password -e \"use $database; create table user_hash_salt(id int primary key auto_increment,username varchar(32) unique not null, hash varchar(128) not null, salt varchar(64) not null);\" 2>&1`;
	@result=`mysql -u$username -p$password -e \"use $database; show columns from user_hash_salt;\"
 2>&1`;
        print "@result \n";

	#user_tokens
	@result=`mysql -u$username -p$password -e \"use $database; create table user_tokens(userid int unique, token varchar(256) not null);\" 2>&1`;	
	@result=`mysql -u$username -p$password -e \"use $database; show columns from user_tokens;\" 2>&1`;
	print "@result \n";

	 #user_account_info
        @result=`mysql -u$username -p$password -e \"use $database; create table user_account_info(userid int unique, email unique varchar(64) not null, secq1 varchar(128) not null, secq2 varchar(128) not null, seca1 varchar(64) not null, seca2 varchar(64) not null);\" 2>&1`;
        @result=`mysql -u$username -p$password -e \"use $database; show columns from user_account_info;\" 2>&1`;
        print "@result \n";

	# Add dummy username hash salt combo: defultuser, defaultpass (hashed with salt) 
	@result = `mysql -u$username -p$password -e \"use $database; insert into user_hash_salt values(null,\'defaultUser\',\'$defaultHash\',\'$defaultSalt\');\" 2>&1`;
	print "@result \n";
}
