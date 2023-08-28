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

logger.info(ascii)
logger.info('Initializing Dino server...');

//=============================================
//             Node Cache
//=============================================

var nodeCache = new Map();
var nodeBattery = new Map();
var healthyTimeout = 6000;
var slowTimeout = 10000;

function nodeStateJSON(){
    var healthy = [];
    var slow = [];
    var expired = [];

    for (let [id, lastHeartbeat] of nodeCache) {
        var dt = Date.now() - lastHeartbeat;        

        if (dt < healthyTimeout){
            healthy.push(id);
        } else if (dt < slowTimeout){
            slow.push(id);
        } else {
            expired.push(id);
        }
    }

    return {'healthy': healthy, 'slow': slow, 'expired': expired};
}

//=============================================
//             MQTT Broker
//=============================================
const aedes = require('aedes')()
const broker = require('net').createServer(aedes.handle)
const port = 1883

broker.listen(port, function () {
  logger.info('[MQTT] Server started and listening on port %s', port);
});

aedes.on('client', function (client) {
    logger.info('[MQTT] Client Connected: %s',client.id);
});

aedes.on('clientDisconnect', function (client) {
    logger.info('[MQTT] Client Disconnected: %s',client.id);
});

aedes.on('subscribe', function (subscriptions, client) {
    logger.info('[MQTT] Client %s subscribed to topics: %s', client.id, subscriptions.map(s => s.topic).join('\n'));
});

aedes.subscribe('nodes/heartbeat',function(packet, cb){    
    var update = JSON.parse(packet.payload.toString())
    logger.debug('[MQTT] Received node heartbeat: %s', update);

    if (Array.isArray(update)){
        for (const n of update) {
            nodeCache.set(n, Date.now());
        }
    } else{
        logger.warn('[MQTT] Received malformed heartbeat payload: "%s"', packet.payload.toString());
    }
    cb();
});

aedes.subscribe('nodes/battery',function(packet, cb){    
    logger.info('[MQTT] Received battery update: %s', packet.payload.toString());
    cb();
});

aedes.on('connectionError', function(client, err){
    logger.error("[MQTT] Client %s: %s", client.id, err.message);
});

aedes.on('clientError', function(client, err){
    logger.error("[MQTT] Client %s: %s", client.id, err.message);
});

logger.info('[MQTT] MQTT broker running');

//=============================================
//           HTTP Server
//=============================================
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', function (req, res) {
    fs.readFile('public/html/index.html',function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

app.get('/api/nodes', function (req, res) {
    logger.info('[HTTP] Nodes API request');
    res.json(nodeStateJSON());
});

app.get('/api/roar', function (req, res) {
    logger.info('[HTTP] Roar API request');
    aedes.publish({topic:'cmd', payload:'{"id":255}'}, null);

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('SUCCESS');
    res.end();
});

server.listen(3000, function () {
    var port = server.address().port;
    logger.info('[HTTP] Server started at http://localhost:%s/', port);
});

logger.info('[HTTP] HTTP server running');

//=============================================
//          WebSocket Server
//=============================================
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});

wss.on('connection', function(ws){
    logger.info('[WS] Client connected');
    ws.send(JSON.stringify(nodeStateJSON()));

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
logger.info('[WS] WebSocket server running');

//=============================================
//          Broadcast Node Connections
//=============================================
function broadcastNodeState(){
    var nodeState = nodeStateJSON();
    var stateStr = JSON.stringify(nodeState);
    logger.info('[WS] Broadcast node state: %s', stateStr);

    wss.clients.forEach(function(ws){
        ws.send(stateStr);
    });
}
setInterval(broadcastNodeState, 5000);