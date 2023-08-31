import config from 'config';

const HEALTHY_TIMEOUT = config.get('nodes.healthyTimeout');
const SLOW_TIMEOUT = config.get('nodes.slowTimeout');

/**
 * Nodes Service
 * 
 * Stores a cache of comms nodes, and provides utility functions to communicate with nodes.
 */
class NodesService {
    constructor() {
        this.nodeStatusCache = new Map();

        // Create some mocked-up node
        for (var i = 0; i < 10; i++) {
            this.nodeStatusCache['' + i] = {
                'time': Date.now(),
                'voltage': 0.00
            }
        }
    }

    async start() {

    }

    async stop() {

    }

    getNodeStatusJson() {
        var nodes = [];
        for (let [id, status] of Object.entries(this.nodeStatusCache)){
            var node = {'id':id,
                        'voltage': status.voltage}

            var dt = Date.now() - status.time;        
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