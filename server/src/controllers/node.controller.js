import logger from "../config/logger";
import mqttService from "../services/mqtt.service";
import nodeService from '../services/nodes.service';

const getNodeStatus = async (req, res) => {
    logger.info('[HTTP] Node status API request');
    res.json(nodeService.getNodeStatusJson());
};

const handleRoarMessage = async (req, res) => {
    logger.info('[HTTP] Roar API request for node id ' + req.params.id);
    mqttService.publish({topic:'cmd', payload:`{"id":${req.params.id}}`}, null);

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('SUCCESS');
    res.end();
};

export { getNodeStatus, handleRoarMessage };
