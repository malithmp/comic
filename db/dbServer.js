var http = require('http');
var qs = require('querystring');
var url = require('url');
var mysql = require('mysql');
var date=new Date();


var conf=parseConfig();
var mysqlconnection = mysql.createConnection({host:conf.servers.dbServer.mysqlHost,user:conf.servers.dbServer.mysqlUsername,password:conf.servers.dbServer.mysqlPassword,database:conf.servers.dbServer.mysqlDatabase});
mysqlconnection.connect();

var server = http.createServer(function (request, response) {
	var querydata = url.parse(request.url, true).query;
	console.log("quertType:"+querydata.queryType);

	if(request.method=='POST'){
		var body='';
		request.on('data',function(data){
			body+=data;
			// prevent from attacks (by terminating long messages)
			if(body.length > 10000){// we will never use more than 10k letters
				request.connections.destroy();
			}
		});
		request.on('end',function(){
			//var postdata = JSON.parse(body);
			//console.log('body-->'+postdata[0]+":"+postdata[1]);
			directRequest(querydata.queryType,body,response);
			//console.log('parsed -->'+postdata.key);
		});
	}
}).listen(conf.servers.dbServer.port,conf.servers.dbServer.host);

// Put a friendly message on the terminal
console.log("Server running at http://"+conf.servers.dbServer.host+":"+conf.servers.dbServer.port);


function directRequest(command, rawdata,res){
	console.log("rawdata:"+rawdata);
	var data = JSON.parse(rawdata);
	
	if(command == "adduser"){
		console.log("TODO, stub add user function invoked");
		adduser(data.username,res);
	}
	else if(command == "adduserpass"){
		console.log("TODO, stub add userpass function invoked");
                adduserpass(data.username,data.hash,data.salt,res);
	}
	else if(command == "adduserinfo"){
		console.log("");
	}
	else if(command == "addusertoken"){
		console.log("TODO, stub add usertoken function invoked");
		addusertoken(data.username,data.token,res);
        }
	else if(command == "removeusertoken"){
                removeusertoken(data.username,res);
        }
	else if(command == "getusertoken"){
		// we need to check if the token is not expired, if not extend expiration time
                console.log("TODO, stub getusertoken function invoked");
                getusertoken(data.username, res);
        }
	else if(command == "getuserinfo"){
                console.log("TODO, stub add getuserinfo function invoked");
                getuserinfo(data.username, res);
        }
	else if(command == "debug"){
		console.log('debug');
		//createalbum("usernameeeee1","albumnameee1e",4,res);
		var listof="[\"acb\",\"def\",\"ghi\"]";
		mapimagenamestoids(listof,res);
	}
	else{
		sendResponse(res,{"status":"false","message":"Invalid Command"});
	}
}

function mapimagenamestoids(filenames,res){
	// filenames as a json array
	// TODO implement a script that periodically clean up images that dont have a entry in this table
	// Once the user is done uploading a photo (or photos) they will be provided with a 'filename' to the image
	// we will map these photo names to ids
	var filenames=JSON.parse(filenames);
	var queryString='insert into images(imageid, filename) values';
	var selectList='';
	for(var i=0;i<filenames.length;i++){
		queryString += "(Null,\""+filenames[i]+"\"),";
		selectList += "filename=\""+filenames[i]+"\" OR ";
	}
	queryString=queryString.slice(0,-1)+";";	
	console.log(queryString);
	
	mysqlconnection.query(queryString,function(err,rows){
		if(err){
			responseSet={"status":"false","message":"Duplicate filename"};
			sendResponse(res,responseSet);
			console.log("sql error!"+err);
		}
		else{
			// get the ids
			queryString ="select imageid,filename from images where "+selectList.slice(0,-3)+";";
			mysqlconnection.query(queryString,function(err,rows){ 
				if(err){
					responseSet={"status":"false","message":"Could not gather image IDs"};
					sendResponse(res,responseSet);
					console.log("sql error!"+err);
				}
				else{
					console.log(rows);
					
					responseSet={"status":"true","message":""};
					sendResponse(res,responseSet);
				}
			});
		}
	});
}
function addphotostoalbum(username,albumid,imageids){
	// imageids as a json array in the exact order
	// we check if the albumid corresponds to an actual album
	// we verify that the user own the album
}

function createalbum(username,albumname,numimages,res){
	// when a user creates a comicstrip, it is uploaded as an album of pre defined number of photos
	// The album names must be unique per user. but different users can have 2 albums with the same name
	// check if the album name is already used by the user
	// if it does, let the user know and also send that album id
	// create the album (get the album id and return to user)

	// add the album name safely. Even though the user checked the album names existance, a user app could accidentally simultaniously try to add the album twice. which is bad. This will take care of it in the SQL level
	//insert into user_album select "u" as username,"a" as albumname, Null as albumid, 2 as numimg from user_album where(username="u" and albumname="a") having COUNT(*)=0;
	var responseSet={};
	var queryString="insert into user_album select \""+
				username+"\" as username, \""+
				albumname+"\" as albumname, Null as albumid, "+
				numimages+" as numimg from user_album where(username=\""+
				username+"\" and albumname=\""+
				albumname+"\") having count(*)=0;"
	mysqlconnection.query(queryString,function(err,rows){
		if(err){
			console.log(err);
			responseSet={"status":"false","message":"Adding album sql failed!"};
			sendResponse(res,responseSet);
		}
		else{
			console.log(rows);
			// now get the id using a second command TODO.SQL can do this in 1 go. but the query string is already too long. so take care of this later
			var queryString="select albumid from user_album where username=\""+username+"\" and albumname=\""+albumname+"\";";
			console.log(queryString);
			mysqlconnection.query(queryString,function(err,rows){
				if(err){
					console.log(err);
					responseSet={"status":"false","message": "getting albumid failed!"};
					sendResponse(res,responseSet);
				}
				else{
					console.log(rows);
					responseSet={"status":"true","message":rows[0].albumid};
					sendResponse(res,responseSet);
				}
			});
		}
	});
}

function getuserinfo(username,res){
        console.log("got:"+username);
        // TODO actual implementatuib
	// retutn salt: defaultsalt
	// and hash for defaultsalt+defaultpassword ==> defaultsaltdefaultpassword
        var responseSet={"status":"true","hash":"42f4ec866fc13f66e67e1ee01798a287c49680e24ebf81662d48559ae6fd9fbbfe2ce45f0f001f41fad2c7d5ca4082cc78543d7cf2da25403d35aba9971312e0","salt":"defaultsalt"};
        sendResponse(res,responseSet);

}


function removeusertoken(username,res){
	// remove the token for that user if it exists. If the token does not exists bofere deletion, err
	var responseSet={"status":"true"};
	var queryString = "delete from user_tokens where username=\""+username+"\";";
	console.log("got:"+username);
	mysqlconnection.query(queryString,function(err,rows){
		if(err){
			responseSet={"status":"false","message":"It just failed!"};
			sendResponse(res,responseSet);
		}
		else{
			sendResponse(res,responseSet);
		}
	});	
}

function addusertoken(username, token, res){
        console.log("got:"+username+" and "+token);
        // mock add user to the database and send the ok resposen
        // TODO actual implementation
	// Add the token and the expiration time to the db
	var querystring = "";
        var responseSet={"status":"true","userid":"9001"};
        sendResponse(res,responseSet);
}

function getusertoken(username,res){
	// we need to check if the token is not expired, if not extend expiration time
	// if it is, return false to the user. delete the entry from the DB
	var responseSet={"status":"true","token":"TOKEN"};
	var queryString = "select username,token,expiry from user_tokens where username=\""+username+"\";";
	console.log(queryString);
	mysqlconnection.query(queryString,function(err,rows){
		if(err){
			responseSet={"status":"false","message":"SQLERR"};
			sendResponse(res,responseSet);
			console.log("sql error!"+err);
		}else{
			console.log(rows);
			if(rows.length==1){
				var time = (date.getTime()/1000).toFixed();	// POSIX time in seconds (unix epoch time in seconds)
				// check if expired
			 	console.log(time +" vs "+rows[0].expiry);			
				if(time<rows[0].expiry){
					// token is not expired yet, we will return it and then update the new time
					console.log(time);
					time= parseInt(time)+parseInt(conf.servers.dbServer.tokenExpiry);
					console.log(time);
					// send the user the reponse, adnt hen ipdate the time
					responseSet={"status":"true","token":rows[0].token};
					sendResponse(res,responseSet);
					queryString = "update user_tokens set expiry="+time+" where username=\""+username+"\";";
					mysqlconnection.query(queryString,function(err,rows){});
				}else{
					console.log("expired");
					// remove the entry from the db
					responseSet={"status":"false","code":-51,"message":"Token expired"};
                                        sendResponse(res,responseSet);
					queryString = "delete from user_tokens where username=\""+username+"\";";
					mysqlconnection.query(queryString,function(err,rows){});
				}	
			}
			else{
				// can NOT have more than 1 entry for a user.. This would be a huge issue
				responseSet={"status":"false","message":"DB server sent more than 1 result"};
				sendResponse(res,responseSet);
			}
		}

	});
}

function adduser(username,res){
	var queryString = "insert into user_hash_salt(username,hash,salt) values(\""+username+"\",\"temp\",\"temp\");";
	console.log(queryString);
        mysqlconnection.query(queryString,function(err,rows){
		if(err){
			responseSet={"status":"false","message":"Duplicate entry"};
                        sendResponse(res,responseSet);
                        console.log("sql error!"+err);
		}
		else{
			responseSet={"status":"true","message":"Username Reserved"};
                        sendResponse(res,responseSet);
		}
	});
}

function adduserpass(username, hash, salt ,res){
	// It is required that a username has been reserved prior to calling this function. If the username does not exis, we let the user knw
	console.log("got:"+username+" and "+hash+" and "+salt);
	var responseSet={"status":"true","token":"TOKEN"};
        var queryString = "update user_hash_salt set hash=\""+hash+"\", salt=\""+salt+"\" where username=\""+username+"\";";
	mysqlconnection.query(queryString,function(err,rows){
                if(err){
                        responseSet={"status":"false","message":"Unknown error"};
                        sendResponse(res,responseSet);
                        console.log("sql error!"+err);
                }
                else{
			console.log(rows);
			if(rows.affectedRows==1){
                        	responseSet={"status":"true","message":"Credentials updated"};
                        	sendResponse(res,responseSet);
			}
			else{
				responseSet={"status":"false","message":"Critical error. Sqp updated hash,slat for 2 rows!! This should never happen"};
                                sendResponse(res,responseSet);
			}
                }
        });
}

function sendResponse(res, responseSet){
	console.log("sending response");
        // end point of all requesti
	// create a json string from the response key value pairs
	var jsonstring = JSON.stringify(responseSet);
	res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(jsonstring);
	console.log("response sent"+jsonstring);
}

function parseConfig(){
	var fs=require('fs');
	var rawdata = fs.readFileSync("../config.json").toString();
	var conf = JSON.parse(rawdata);
	return conf;
}
