import Aedes from 'aedes';
import net from 'net';
import logger from '../config/logger';
import nodesService from './nodes.service';

/**
 * MQTT Broker
 * 
 * Provides a MQTT API interface.
 */
class MQTTBroker {
    constructor() {
    }

    async start() {
        this.aedes = Aedes();
        this.broker = net.createServer(this.aedes.handle);
        this.port = 1883;

        this.broker.listen(this.port, () => {
          logger.info('[MQTT] Server started and listening on port ' + this.port);
        });
        
        this.aedes.on('client', (client) => {
            logger.info('[MQTT] Client Connected: %s',client.id);
        });
        
        this.aedes.on('clientDisconnect', (client) => {
            logger.info('[MQTT] Client Disconnected: %s',client.id);
        });
        
        this.aedes.on('subscribe', (subscriptions, client) => {
            logger.info('[MQTT] Client %s subscribed to topics: %s', client.id, subscriptions.map(s => s.topic).join('\n'));
        });
        
        this.aedes.subscribe('nodes/status', (packet, cb) => {    
            logger.info('[MQTT] Received status update: %s', packet.payload.toString());
        
            var update = JSON.parse(packet.payload.toString())
            if (Array.isArray(update)){
                for (const s of update) {
                    var id = s.id;
                    if (id != undefined){
                        var status = {'time':Date.now()}
                        status.voltage = s.voltage;
                        nodesService.nodeStatusCache.set(id, status);
                    } else{
                        logger.warn('[MQTT] Received status with no ID: "%s"', packet.payload.toString());
                    }
                }
            } else{
                logger.warn('[MQTT] Received malformed status payload: "%s"', packet.payload.toString());
            }
            cb();
        });
        
        this.aedes.on('connectionError', (client, err) => {
            logger.error("[MQTT] Client %s: %s", client.id, err.message);
        });
        
        this.aedes.on('clientError', (client, err) => {
            logger.error("[MQTT] Client %s: %s", client.id, err.message);
        });
        
        logger.info('[MQTT] MQTT broker running');
    }

    publish(msg) {
        this.aedes.publish(msg);
    }

    async stop() {

    }
}

export default new MQTTBroker();