const pino = require('pino')
const logger = pino({
  transport: {
    target: 'pino-pretty'
  },
})

const ascii = String.raw`
  _____  _               ____  ____   ____  
 |  __ \(_)             |  _ \|  _ \ / __ \ 
 | |  | |_ _ __   ___   | |_) | |_) | |  | |
 | |  | | | '_ \ / _ \  |  _ <|  _ <| |  | |
 | |__| | | | | | (_) | | |_) | |_) | |__| |
 |_____/|_|_| |_|\___/  |____/|____/ \___\_\                                           

`

var nodes = []
logger.info(ascii)
logger.info('Initializing Dino server...');

//=============================================
//             Start MQTT Broker
//=============================================
const aedes = require('aedes')()
const broker = require('net').createServer(aedes.handle)
const port = 1883

broker.listen(port, function () {
  logger.info('[MQTT] Server started and listening on port %s', port);
})

aedes.on('client', function (client) {
    logger.info('[MQTT] Client Connected: %s',client.id);
})

aedes.on('clientDisconnect', function (client) {
    logger.info('[MQTT] Client Disconnected: %s',client.id);
})

aedes.on('subscribe', function (subscriptions, client) {
    logger.info('[MQTT] Client %s subscribed to topics: %s', client.id, subscriptions.map(s => s.topic).join('\n'));
})

//=============================================
//             MQTT Subscriptions
//=============================================
aedes.subscribe('nodes',function(packet, cb){
    // TODO: maintain nodes
    nodes = JSON.parse(packet.payload.toString())
    logger.info('[MQTT] Received node update: %s', nodes);
})

//=============================================
//           HTTP Endpoint Mappings
//=============================================
const express = require('express')
const app = express()
const fs = require('fs')
var expressWs = require('express-ws')(app);

app.use(express.static('public'))

app.get('/', function (req, res) {
    fs.readFile('public/html/index.html',function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

// roar API endpoint 
app.get('/api/roar', function (req, res) {
    logger.info('[HTTP] Roar API request');
    aedes.publish({topic:'cmd', payload:'{"id":255}'}, null);

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('SUCCESSS');
    res.end();
});

app.ws('/cmd', function(ws, req) {
    logger.info('[WS] Client connected');
    ws.send(JSON.stringify(nodes));

    ws.on('message', function(msg) {
        var cmdJson = '{"id":' + parseInt(msg) + '}';

        logger.info('[WS] Command Received: %s', cmdJson);
        aedes.publish({topic:'cmd', payload:cmdJson}, null);
        ws.send(cmdJson);
    });

    ws.on('close', function(ws, req){
        ws.address
        logger.info('[WS] Client disconnected');
    });
});

//=============================================
//             Start HTTP Server
//=============================================
var server = app.listen(3000, function () {
    var port = server.address().port;
    logger.info('[HTTP] Server started at http://localhost:%s/', port);
});
