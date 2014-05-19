from collections import deque
import time
import math

# Static class that holds a dictionary of all the files to expect (see upload file procedure)
# Since this is a prototype server, we will also hold all the files stored in the server. In the real version let the database handle this

# the main process will deal with writing to this class and noone else
# all reads from other processes will be indepedant and thus we dont implement any locks
# If a user tries to access something whilst its being written, They will fail to access it. 
# Which is fine, this is a file server. File not found once in a while is fine (I guess..)

# expireExpectingID
# queue that has access to elements from both ends . Use this to keep track of files to be kiled out upon timeoput
# all new entries go to the bottom of the stack. 
# before each operation in the file, we look at the top of the queue for expi red expecting IDs
# If found pop from the expireExpectingID and from the expectingID dictionary and look for the next item until nothing to be kicked out
# contains tuples (expiry, filename)

# README: For multiprocessing synchronization using locks : https://docs.python.org/dev/library/multiprocessing.html : TOPIC 17.2.1.4. Synchronization between processes

expireExpectingID = deque()	
expectingID  = {}
allFilesOnDisk = {}

# Expiry for an expecting file (time between the user tells the FE a file is on the way to the last moment this File server will hang on to that filename
fileExpiryTime = 10

def expectingIDExpire():
	if(len(expireExpectingID) is not 0):
		# Everything good. Kick some expired files
		current_time = int(time.time())
		first_on_stack = expireExpectingID.popleft()
		hasMoar = True
		#print('what:', first_on_stack[0])
		#print('vs:', current_time)
		
		while (hasMoar and (first_on_stack[0] < current_time)):
			try:
				# The file may already be popped if the user uploaded it before expiry,
				del expectingID[first_on_stack[1]]
				print('deleting expired')
			except: 
				# IF already deleted, proceed
				pass

			if(len(expireExpectingID) is 0):
				# queu is empty
				hasMoar = False
			else:
				first_on_stack = expireExpectingID.popleft()
	
		
		# all expired. If the last one was expired, nothing to put back. Else, put the currently holding item back to queue
		if(hasMoar):
			expireExpectingID.appendleft(first_on_stack)
		return True


def isExpectingID(resourceID):
	return resourceID in expectingID

def popExpectingID(resourceID):
	# remove file from the epecting file list (this is called when a expecting file was received)

	#################################################
	expectingIDExpire()
	#################################################

	if(resourceID not in expectingID):
		return False
	else:
		del expectingID[resourceID]
		return True

def pushExpectingID(resourceID):
	# Add fileID to the expecting files list

	#################################################
	expectingIDExpire()
	#################################################

	if(resourceID in expectingID):
		return False
	else:
		expectingID[resourceID]=1
		# set expiration for the expecting file
		current_time = int(time.time())
		expireExpectingID.appendleft((current_time+fileExpiryTime ,resourceID ))
		return True

def putFile(resourceID):
	if(resourceID in allFilesOnDisk):
		return False
	else:
		allFilesOnDisk[resourceID]=1
		return True
	
def removeFile(resourceID):
	if(resourceID not in allFilesOnDisk):
		return False
	else:
		allFilesOnDisk.pop(resourceID)
		return True
	
def hasFile(resourceID):
	return resourceID in allFilesOnDisk



