import config from 'config';
import logger from '../config/logger';

const HEALTHY_TIMEOUT = config.get('nodes.healthyTimeout');
const SLOW_TIMEOUT = config.get('nodes.slowTimeout');

/**
 * Nodes Service
 * 
 * Stores a cache of comms nodes, and provides utility functions to communicate with nodes.
 */
class NodesService {
    constructor() {
        this.nodeStatusCache = {};

        // Create some mocked-up node
        //for (var i = 0; i < 10; i++) {
        //    this.nodeStatusCache['' + i] = {
        //        'time': Date.now(),
        //        'voltage': 0.00
        //    }
        //}
    }

    async start() {

    }

    async stop() {

    }

    getNodeStatusJson() {
        var nodes = [];
	logger.info(JSON.stringify(this.nodeStatusCache));
        for (let id of Object.keys(this.nodeStatusCache)){
            var nodeStatus = this.nodeStatusCache[id];
            var node = {'id':id,
                        'voltage': nodeStatus.voltage}

            var dt = Date.now() - nodeStatus.time;
            if (dt < HEALTHY_TIMEOUT){
                node.health = 'HEALTHY';
            } else if (dt < SLOW_TIMEOUT){
                node.health = 'SLOW';
            } else {
                node.health = 'EXPIRED';
            }
            nodes.push(node);
        }
        
        return nodes;
    }
}

export default new NodesService();
