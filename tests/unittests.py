from threading import Thread
import json
import os

offset='http://192.168.0.150:1337/?queryType='

def main():
	print("Unit Test Suit V1\n")
	testlist=initialize_test_list()
	#execute_steps(testlist)
	for test in testlist:
		execute_steps(testlist[test])

def clear_fe_redis():
	# remove all entries from Frontend Redis DB
	print('TODO')

def clear_auth_redis():
	# remove all entries from Auth server Redis DB 
        print('TODO')


def clear_bedb_mysql():
	# reset BE DB mysql database
        print('TODO')


def signup(inputlist):
	# makes sigunp requesti
	# TODO: WARNING. SIGNUP AND SIGNIN MUST OCCUR IN SEQUENCE BEFORE ANY OTHER REQUEST. SET THE PARALLEL FLAG WISELY
	username=inputlist['username']
	password=inputlist['password']
	email=inputlist['email']

	target=offset+'signup'
	args=json.dumps({'username':username,'password':password,'email':email})
	cmdcommand='curl -X POST -d \''+args+'\' '+target
	#print(cmdcommand)
	os.system(cmdcommand)
		
def signin(inputlist):
	# makes signin reuest.
	# TODO: WARNING. SIGNUP AND SIGNIN MUST OCCUR IN SEQUENCE BEFORE ANY OTHER REQUEST. SET THE PARALLEL FLAG WISELY
        username=inputlist['username']
        password=inputlist['password']
	token=inputlist['token']

        target=offset+'signin'
        args=json.dumps({'username':username,'password':password,'signinToken':token})
        cmdcommand='curl -X POST -d \''+args+'\' '+target
	#print(cmdcommand)
	os.system(cmdcommand)
	
def signout(inputlist):
	# makes signout request
        usernmae=inputlist['username']
        token=inputlist['token']

        target=offset+'signout'
        args=json.dumps({'username':username,'signinToken':token})
        cmdcommand='curl -X POST -d \''+args+'\' '+target
        #print(cmdcommand)
	os.system(cmdcommand)
		
def execute_steps(arguments):
	# argumemts is an array of elements the following format
	# command, {comand args hash}, parallel
	# all items are run in sequential order if parallel flag is set to false
	
	user_token_dict = {}
	for i in range(len(arguments)):
		if(arguments[i][1]['username'] not in user_token_dict):
			# add user for future reference
			user_token_dict[arguments[i][1]['username']]='0'
		if(arguments[i][0] == 'signup'):
			if arguments[i][2] == False:
				signup(arguments[i][1])
			else:
				try:
					Thread(target=signup,args=([arguments[i][1]])).start()
				except:
					print('failed to start thread')

		elif(arguments[i][0] == 'signin'):
			# signin and add the token to the dictionary
			arguments[i][1]['token']=user_token_dict[arguments[i][1]['username']]

			if arguments[i][2] == False:
				token = signin(arguments[i][1])
				user_token_dict[arguments[i][1]['username']]=token
			else:
				# If parallel, we dont log the token as it may induce a race condition
				try:
					Thread(target=signin,args=([arguments[i][1]])).start()
				except:
                                        print('failed to start thread')

		elif(arguments[i][1] == 'signout'):
			arguments[i][1]['token']=user_token_dict[arguments[i][1]['username']]

			if arguments[i][2] == False:
				signout(arguments[i][1])
			else:
				try:
					Thread(target=signout,args=([arguments[i][1]])).start()
				except:
                                        print('failed to start thread')

	print(user_token_dict)

def initialize_test_list():
	f = open('./testdata.json','r')
	testdata=json.loads(f.read())

	f = open('./testlist.json','r')
	testpackage=json.loads(f.read())
	
	#print (testlist)
	testlist = testpackage['list']
	output={}

	for test in testlist:
		test_i=[]
		testinfo=testpackage[test]
		for singlecommand in testinfo:
			com1=[singlecommand[0],testdata[singlecommand[1]][singlecommand[2]],singlecommand[3]]
			test_i.append(com1)
		
		output[test]=test_i

	#print(output)
	#for item in output:
	#	#print(item)
	#	x=output[item]
	#	print(x)

	return output 


if __name__ == '__main__':
  main()

