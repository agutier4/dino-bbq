import logger from './logger';

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

var nodeStatusCache = new Map();
var healthyTimeout = 6000;
var slowTimeout = 10000;

nodeStatusCache['1'] = {
    'time': Date.now(),
    'voltage': 0.00
}
nodeStatusCache['2'] = {
    'time': Date.now(),
    'voltage': 0.00
}
nodeStatusCache['3'] = {
    'time': Date.now(),
    'voltage': 0.00
}
nodeStatusCache['4'] = {
    'time': Date.now(),
    'voltage': 0.00
}
nodeStatusCache['5'] = {
    'time': Date.now(),
    'voltage': 0.00
}
nodeStatusCache['6'] = {
    'time': Date.now(),
    'voltage': 0.00
}

function nodeStatusJSON(){
    var nodes = [];
    for (let [id, status] of Object.entries(nodeStatusCache)){
        var node = {'id':id,
                    'voltage': status.voltage}

        var dt = Date.now() - status.time;        
        if (dt < healthyTimeout){
            node.health = 'HEALTHY';
        } else if (dt < slowTimeout){
            node.health = 'SLOW';
        } else {
            node.health = 'EXPIRED';
        }
        nodes.push(node);
    }
     
    return nodes;
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

aedes.subscribe('nodes/status',function(packet, cb){    
    logger.info('[MQTT] Received status update: %s', packet.payload.toString());

    var update = JSON.parse(packet.payload.toString())
    if (Array.isArray(update)){
        for (const s of update) {
            var id = s.id;
            if (id != undefined){
                var status = {'time':Date.now()}
                status.voltage = s.voltage;
                nodeStatusCache.set(id, status);
            } else{
                logger.warn('[MQTT] Received status with no ID: "%s"', packet.payload.toString());
            }
        }
    } else{
        logger.warn('[MQTT] Received malformed status payload: "%s"', packet.payload.toString());
    }
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
const cors = require('cors')


const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(
    cors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
);

app.get('/api/nodes/status', function (req, res) {
    logger.info('[HTTP] Node status API request');
    res.json(nodeStatusJSON());
});

app.post('/api/roar/:id', function (req, res) {
    logger.info('[HTTP] Roar API request for node id ' + req.params.id);
    aedes.publish({topic:'cmd', payload:`{"id":${req.params.id}}`}, null);

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
    ws.send(JSON.stringify(nodeStatusJSON()));

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
function broadcastNodeStatus(){
    var nodeState = nodeStatusJSON();
    var stateStr = JSON.stringify(nodeState);
    var nodeList = JSON.stringify(Array.from(nodeStatusCache.keys()))

    logger.info('[WS] Broadcast state for nodes: %s', nodeList);
    logger.debug('[WS] State: %s', stateStr);

    wss.clients.forEach(function(ws){
        ws.send(stateStr);
    });
}
setInterval(broadcastNodeStatus, 5000);