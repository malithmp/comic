from http.server import BaseHTTPRequestHandler
import os, os.path, tempfile
from glbl import *
import cgi
from time import time
#---------------------------- MULTIPART
import multipart as mp
import base64
from multipart import tob
try:
    from io import BytesIO
except ImportError:
    from StringIO import StringIO as BytesIO

# ------------------------------ END MULTIPART

def parsePost(postData):
		# PURPOSE: Parse data String and return needed data
		# INPUT FORMAT: data1=value1&data3=value2...etc
		# OUTPUT: Dictionary of key value pairs
		outputDict = {}
		data =postData.split('&')
		for item in data:
			(key,value)=item.split('=')	
			outputDict[key]=value
		return outputDict

def expectFile(filename):
	pushExpectingID(filename)
	
class MyHandler(BaseHTTPRequestHandler):
	
	def do_GET(self):
		print ('Path', os.getcwd())
		try:
			print('Do Get',self.path)
			tokens = self.path.split('/')
			tokens = parsePost(tokens[1][1:])
			print(tokens)
			if(tokens['command'] == 'get'):
				has = hasFile(tokens['filename'])
				if(has):
					f = open(os.getcwd()+'/uwotm8000.jpg','rb')
					self.send_response(200)
					self.send_header('Content-type','')
					self.end_headers()	
					self.wfile.write(f.read())
					f.close()
				else:
					self.wfile.write('File Not Found\n'.encode('utf-8'))
			else:
				#NOT SUPPORTED
				self.wfile.write('Not Supported\n'.encode('utf-8'))
			
			print('done')
			return 

		except IOError as e :
			print('Do Get Error')

	def do_POST(self):
		data = {'command':'0'}
		try:
			ctype, pdict = cgi.parse_header(self.headers['content-type'])
			content_len = int(self.headers['content-length'])
			print (ctype)
			print (pdict)

			if(ctype == "application/x-www-form-urlencoded"):
				# expecting only text.
				post_body = self.rfile.read(content_len)
				data = parsePost(post_body.decode("utf-8"))

				if(data['command'] == 'expect'):	
					expectFile(data['filename'])

				elif(data['command'] == 'setfile'):
					# this is not supported with this content type
					print('Unsupported')
				self.send_response(200)		

			elif(ctype == "multipart/form-data"):
				# expecting text and binary files, 
				post_body = self.rfile.read(content_len)		
				p = mp.MultipartParser(BytesIO(post_body),pdict['boundary'])

				cmd = p.get('command').file.read()					
				command = cmd.decode('utf-8')

				if(command == 'expect'):
					fname = p.get('filename').file.read()
					filename = fname.decode('utf-8')
					expectFile(filename)

				elif(command == 'setfile'):
					# get file from user.. check if the server is expecting this file. if so save it. else reject
					fname = p.get('filename').file.read()
					filename = fname.decode('utf-8')
					if(isExpectingID(filename)):				
						filedata = p.get('filedata').file.read()
						popExpectingID('uwot.jpg')
						f = open(os.getcwd()+'/'+filename,'wb')
						f.write(filedata)
						putFile(filename)
						
				#try:
				#	open(name,'wb').write(filedata)
				#except:
				#	print('Failed to open File')	
				self.send_response(200)
				print ('Done')

			else:
				print('Unsuported data type')
				self.send_response(200)
	

			
			#print (self.rfile.read(int(self.headers['content-length'])))


			#content_len = int(self.headers['content-length'])
			#post_body = self.rfile.read(content_len)
			#data =  parsePost(post_body.decode("utf-8"))
			#self.send_response(200)
			#if(data['command'] == '0'):
				# illegal request
			#	self.send_header('Content-type','text/html')
			#	self.end_headers()
			#	self.wfile.write("fail\n".encode('utf-8'))
			#elif(data['command'] == 'expect'):
			#	# FE server wants the file server to expect a file
			#	print('asdasdas')
			#	status = pushExpectingID(data['filename'])
			#	if(status):
			#		self.send_header('Content-type','text/html')
			#		self.end_headers()
			#		self.wfile.write("status=true\n".encode('utf-8'))
			#	else:
			#		# FE sent a filename that is already in use. THIS IS A CRITICAL ERROR. Lie to the user. They dont need to know that our back end is shit
			#		self.send_header('Content-type','text/html')
			#		self.end_headers()
			#		self.wfile.write("RESPONSE\n".encode('utf-8'))
				

		except IOError as e :
			print('Do Post Error')

                        
