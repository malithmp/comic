var http = require('http');
var sys = require("sys");  
var url = require("url");
var path = require("path");  
var util = require('util');
var querystring = require('querystring');
var crypto = require('crypto');
var redis = require("redis");
var fs = require('fs');
var nodemailer = require("nodemailer");
var serverConfigFile = "../serverConfigFile.json";
var config = {};
// Read the config file SYNCHRONOUSLY to get server configuration info into config object, for use all throughout
config["servers"] = JSON.parse(fs.readFileSync(serverConfigFile, 'utf8'));
var servers = config.servers.Servers;

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "comixtripteam@gmail.com",
        pass: "gravityeyelids"
    }
});

http.createServer(function (req, res) {
	var queryData = url.parse(req.url, true).query;
	var chunk = {};
	var JSONresponse = {
		"statusCode": 0,
		"message": "success"
	};
	req.on('data', function (chunk) {					
		chunk = JSON.parse(chunk);
		if(queryData.queryType && queryData.queryType == "sendEmail")
		{
			if(chunk.email && chunk.secretKey)
			{
				console.log('Email: ' + chunk.email);
				console.log('secretKey: ' + chunk.secretKey);
				// setup e-mail data with unicode symbols
				var mailOptions = {
				    from: "Comixtrip Team", // sender address
				    to: chunk.email, // list of receivers
				    subject: "Welcome to Comixstrip", // Subject line
				    html: 
				    	"<b>Welcome To Comixtrip</b>" +
				    	"<p>Dear User,<br>You just signed up on Comixtrip. To verify your account, click the following URL:<br>" +
				    	"<a href='http://localhost:1337/?queryType=verification&&secretKey=" + chunk.secretKey + "'>Verify</a>" + 
						"<br></p><p>If you did not sign up Comixtrip, please disregard this email.<br></p><p>Regards, <br>Comixtrip Team</p>" // html body
				}
				// send mail with defined transport object
				smtpTransport.sendMail(mailOptions, function(error, response){
					    if(error)
					    {
					        console.log(error);
					        // TODO These hardcoded error code assignments need to be removed
					        // and replaced by config file reads
					        JSONresponse.statusCode = -40;
					        JSONresponse.message = "Failed to send an email in the given email address";
					        smtpTransport.close();
					        writeResponse(res, JSONresponse.statusCode, JSONresponse);
					    }
					    else
					    {
					        console.log("Message sent: " + response.message);				        
						    // if you don't want to use this transport object anymore, uncomment following line
						    smtpTransport.close(); // shut down the connection pool, no more messages
					        writeResponse(res, JSONresponse.statusCode, JSONresponse);
					    }

				});
			}
			else
			{
				errorMessage("Email or secretKey not specified", 400, res);
			}
		}
		else
		{
			errorMessage("queryType is invalid", 400, res);
		}
		//res.writeHead(200, {'Content-Type': 'text/plain'});
		//res.end('Hello World\n');
	});
}).listen(servers.emailSender.port, servers.emailSender.host);
console.log('emailSender Server running at', servers.emailSender.host + ':' + servers.emailSender.port);

function writeResponse(response, statusCode, JSONresponse)
{
	response.writeHead(statusCode, {'Content-Type': 'text/plain'});
	response.write(JSON.stringify(JSONresponse));
	response.end();	
}

function errorMessage(message, statusCode, response)
{
	console.log(message);
	response.writeHead(statusCode, {'Content-Type': 'text/plain'});
	response.end(message + '\n');

}



