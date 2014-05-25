var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('I am the database server\n');
}).listen(1340, '127.0.0.1');
console.log('db Server running at http://127.0.0.1:1340/');