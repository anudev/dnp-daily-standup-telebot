var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Hello :)");
}).listen(process.env.PORT || 3000);

const bot = require('./bot');