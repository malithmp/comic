#!/usr/bin/python3
from multiprocessing import Process,Pool
from http.server import HTTPServer


import os
from MyHandler import *
xx = "eh"

def f(name):
	print('hello', name)
	print ('child', str(os.getpid()))


def main():
	pool = Pool(processes = 20 )
	result = pool.apply_async(f,['bob'])
	#p = Process(target=f, args=('bob',))
	print ('main guy', str(os.getpid()))	
	#p.start()
	#p.join()

def notMain():
	try:
		server = HTTPServer(('',8080), MyHandler)
		print ('started')
		server.serve_forever()
	except KeyboardInterrupt:
		print ("keyboard interrupted")
		server.socket.close()

if __name__ == '__main__':
	#main()
	notMain()

