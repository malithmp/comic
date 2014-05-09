from http.server import BaseHTTPRequestHandler
import os
from glbl import *

class MyHandler(BaseHTTPRequestHandler):

	def do_GET(self):

		printX()
		incrementX()
		printX()

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
		try:
			print('Do Post')

		except IOError as e :
			print('Do Post Error')
