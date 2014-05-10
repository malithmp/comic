# Static class that holds a dictionary of all the files to expect (see upload file procedure)
# Since this is a prototype server, we will also hold all the files stored in the server. In the real version let the database handle this

expectingID  = {}
allFilesOnDisk = {}

def popExpectingID(resourceID):
	if(resourceID not in expectingID):
		return False
	else:
		expectingID.pop(resourceID)
		return True

def pushExpectingID(resourceID):
	if(resourceID in expectingID):
		return False
	else:
		expectingID[resourceID]=1
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
