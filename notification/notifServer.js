var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('I am the notification server\n');
}).listen(1339, '127.0.0.1');
console.log('notification Server running at http://127.0.0.1:1339/');