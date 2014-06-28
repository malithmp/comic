emailSender is a node HTTP server which accepts only one type of request:

queryType{
  sndEmail{
    email: <valid email>
    secretKey: <valid secretKey>
    RESPONSE:
      statusCode: int
      message: string ("Success" or appropriate error message)
      
      ON SUCCESS: statusCode: 0
      ON FAILURE: statusCode: -40
      
  }
}

Example HTTP request:

URL:

ttp://127.0.0.1:1342/?queryType=sendEmail

HTTP Body:
{
  "email": "shirsho@gmail.com",
  "secretKey": "1234abcd"
}

And the response:

{
  "statusCode" : 0,
  "message": "Success"
}

Or, in case of failure:

{
  "statusCode" : -40,
  "message": "Failed to send an email in the given email address"
}

NOTE: The server is listening on port 1342. The serverConfigFile.json has been updated to reflect this.
