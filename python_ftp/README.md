


# ------------------------- PROTOCOL -----------------------#

[] <= server response



GET: 	Inter server communication
	user uploading image
	
	command{
		=get{# G1
			filename=<imageID>
			[status=true and IMAGE DATA if success, status=false if failure] 
		}

================================================================================
POST: 	When user requesting for image
	
	command{
		
		=setfile{#P1 
			filename=<imageID>
			filedata=<imageBinaryData>
			[status=true/false]
		}
		=expect{#P2	#SERVER INTERNAL
			[status=true/false, message=filenam]
		}	
	}



#G1:curl "http://localhost:8080/?command=get&filename=uwotm8000.jpg"
	  <= use a web browser to see the image
#P1:curl -X POST -F "command=setfile" -F "filename=uwotm8000.jpg" -F "filedata=@uwotm8000.jpg" http://localhost:8080
#P2:curl -X POST -F "command=expect" -F "filename=uwotm8000.jpg" http://localhost:8080
