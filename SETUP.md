This file contains all necessary steps followed to install/startup additional required software/tools mandetory to **RUN** the Backend on Linux 
** Please note any  issues encountered (if any) during the process. We might run into them again.. We WILL run into them again!!
 ** Follow this steps on a directory OUTSIDE our git workspace . We dont need these files tracked**

REDIS: Source: http://redis.io/topics/quickstart
	INSTALLATION:
		sudo apt-get install redis-server
	RUN:
		redis-server (if path not set,server executable is found in blahblah/redis-stable/src)
		redis-cli to open the client	
		
	WORTH MENTIONING:
		#Redis by default runs without a config file. With out that we cant specify when to backup data
		#To do this. We need to download a template and use it when starting redis
		
		# Download it. (DO we need to track this file on git?) 
		wget http://download.redis.io/redis-stable/redis.conf 

		#Start redis with this config file
		./redis-server blahblah/redis-conf

MYSQL: Source: http://dev.mysql.com/doc/refman/5.1/en/linux-installation-native.html
	INSTALLATION:
		sudo apt-get install mysql-client-5.5 mysql-server-5.5
		# root password set as "comic"

	RUN:
		mysql -u root -p 
		# It will prompt for password, in our case its "comic"

	WORTH MENTIONING:
		# MySQL saves the database files on different locations depending on platform
		# This shit is tricky. I tried and failed. If you need here is how to
		# http://stackoverflow.com/questions/1795176/how-to-change-mysql-data-directory
