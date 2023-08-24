const express = require('express')
const app = express()
const fs = require('fs');

app.use(express.static('public'))

//=============================================
//             Endpoint mappings
//=============================================
app.get('/', function (req, res) {
    fs.readFile('public/html/index.html',function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

// roar API endpoint 
app.get('/api/roar', function (req, res) {
    console.log('ROAR');
});

//=============================================
//                Start Server
//=============================================
var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Initializing SPRUCE server...');
    console.log('Server started at http://localhost:%s/', port);
});