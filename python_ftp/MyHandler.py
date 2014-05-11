from http.server import BaseHTTPRequestHandler
import os
from glbl import *
import cgi

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
	
class MyHandler(BaseHTTPRequestHandler):
		
	def do_GET(self):
		print ('Path', os.getcwd())
		try:
			print('Do Get',self.path)
			tokens = self.path.split('/')
			print (tokens)
			f = open(os.getcwd()+'/sendthis.txt')
			f = open(os.getcwd()+'/test.db','rb')
			self.send_response(200)
			self.send_header('Content-type','')
			self.end_headers()	
			self.wfile.write(f.read())
			f.close()
			return 

		except IOError as e :
			print('Do Get Error')

	def do_POST(self):
		postvars={}
		try:
			print('Do Post')
			content_len = int(self.headers['content-length'])
			post_body = self.rfile.read(content_len)
			print ('POST VAR:' ,post_body)
			data =  parsePost(post_body)
			print (data)
			self.send_response(200)
			self.send_header('Content-type','text/html')
			self.end_headers()	
			self.wfile.write("RESPONSE\n".encode('utf-8'))

		except IOError as e :
			print('Do Post Error')

                        
