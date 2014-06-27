from threading import Thread
import json

offset='http://192.168.0.150:1337/?queryType='

def main():
	print("Unit Test Suit V1\n")
	testlist=initialize_test_list()
	print(testlist[0])	
	command_sequence(testlist)

def initialize_test_list():
	testlist=[	['u1','signin',['pass1','email1'],False],
			['u2','signup',['pass2','email2'],True]
		]
	return testlist

def clear_fe_redis():
	# remove all entries from Frontend Redis DB

def clear_auth_redis():
	# remove all entries from Auth server Redis DB 

def clear_bedb_mysql():
	# reset BE DB mysql database

def signup(username,password,email):
	# makes sigunp requesti
	# TODO: WARNING. SIGNUP AND SIGNIN MUST OCCUR IN SEQUENCE BEFORE ANY OTHER REQUEST. SET THE PARALLEL FLAG WISELY
	target=offset+'signup'
	args=json.dumps({'username':username,'password':password,'email':email})
	cmdcommand='curl -X POST -d \''+args+'\' '+target
	print(cmdcommand)
	
def signin(username, password,token):
	# makes signin reuest.
	# TODO: WARNING. SIGNUP AND SIGNIN MUST OCCUR IN SEQUENCE BEFORE ANY OTHER REQUEST. SET THE PARALLEL FLAG WISELY
        target=offset+'signin'
        args=json.dumps({'username':username,'password':password,'signinToken':token})
        cmdcommand='curl -X POST -d \''+args+'\' '+target
	print(cmdcommand)
	
def signout(username, token):
	# makes signout request
        target=offset+'signout'
        args=json.dumps({'username':username,'signinToken':token})
        cmdcommand='curl -X POST -d \''+args+'\' '+target
        print(cmdcommand)
		
def command_sequence(arguments):
	# argumemts is an array of elements the following format
	# username, command, [commandargs], parallel
	# all items are run in sequential order if parallel flag is set to false
	user_token_dict = {}
	for i in range (len(arguments)):
		if(arguments[i][0] not in user_token_dict):
			# add user for future reference
			user_token_dict[arguments[i][0]]='0'

		if(arguments[i][1] is 'signup'):
			if arguments[i][3] is False:
				signup(arguments[i][0],arguments[i][2][0],arguments[i][2][1])
			else:
				try:
					Thread(target=signup,args=(arguments[i][0],arguments[i][2][0],arguments[i][2][1])).start()
				except:
					print('failed to start thread')

		elif(arguments[i][1] is 'signin'):
			# signin and add the token to the dictionary
			if arguments[i][3] is False:
				token = signin(arguments[i][0],arguments[i][2][0],user_token_dict[arguments[i][0]])
				user_token_dict[[i][0]]=token
			else:
				# If parallel, we dont log the token as it may induce a race condition
				try:
					Thread(target=signin,args=(arguments[i][0],arguments[i][2][0],user_token_dict[arguments[i][0]])).start()
				except:
                                        print('failed to start thread')

		elif(arguments[i][1] is 'signout'):
			if arguments[i][3] is False:
				signout(arguments[i][0],user_token_dict[arguments[i][0]])
			else:
				try:
					Thread.start_new_thread(target=signout,args=(arguments[i][0],user_token_dict[arguments[i][0]]))
				except:
                                        print('failed to start thread')

	print(user_token_dict)

if __name__ == '__main__':
  main()

'''
Data required for tests are in testdata.json
All data is cleared from all components before each test

- sequential
= parallel

Test List:
	A1) signup basic
		- signup good 1
		- signup good 2

	A2) signup multiple parallel with correct input
		= signup good 1
		= signup good 2
		= signup good 3
		= signup good 4

	A3) signup multiple parallel same username more than once
		= signup good 1
		= signup good 2
		= signup good 2
		= signup good 2
		= signup good 1

	A4) signup basic incorrect username
		- signup bad-username 1
		- signup bad-username 2
		- signup bad-username 3
		- signup bad-username 4

	A5) signup basic incorrect password
		- signup bad-password 1
		- signup bad-password 2
		- signup bad-password 3
		
	A6) signup basic incorrect email
                - signup bad-email 1
                - signup bad-email 2
                - signup bad-email 3

	A7) signup basic bad token
		- signup good 1

	B1) signin basic
		- signup good 1
		- signin good 1

	B2) signin parallel multiple user
		- signup good 1
                - signup good 2
                - signup good 3
                - signup good 4
                = signin good 1
                = signin good 2
                = signin good 3
                = signin good 4

	B3) singin non-existing user
		- signup good 1
		- signin good 2 (Note: not added yet)

	B4)  signin bad token
		- signup good 1
		- signin good 1 with bad token

	B99) //TODO: signin in while registering

	C1) signout basic
		- signup good 1
		- signin good 1
		- signout good 1

	C2) singout parallel
		- signup good 1
                - signin good 2
                - signin good 3
                - signin good 4
                = singout good 1
                = singout good 2
                = singout good 3
                = singout good 4

	C3) signout bad token
                - signup good 1
                - signin good 2
		- signin good 1
                - signin good 2
                - singout good 1 (bad token)
                - singout good 2

	C4) signout double attempt
                - signup good 1
                - signin good 1
                - signout good 1
                - signout good 1


'''




