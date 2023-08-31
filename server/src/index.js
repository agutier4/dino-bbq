import config from 'config';
import app from './app';
import logger from './config/logger';
import MQTT from './services/mqtt.service';

const serverPort = config.get('server.port');
const environment = process.env.NODE_ENV || 'development';

// Write some debug text on initialization
const ascii = String.raw`
  _____  _               ____  ____   ____  
 |  __ \(_)             |  _ \|  _ \ / __ \ 
 | |  | |_ _ __   ___   | |_) | |_) | |  | |
 | |  | | | '_ \ / _ \  |  _ <|  _ <| |  | |
 | |__| | | | | | (_) | | |_) | |_) | |__| |
 |_____/|_|_| |_|\___/  |____/|____/ \___\_\                                           

`

logger.info(ascii)
logger.info('Initializing Dino API...');
logger.debug(`Profile: ${environment}`);
logger.debug(`Server Port: ${serverPort}\n`);

// Start server, setting up various error handlers
// Log when we receive a SIGTERM or SIGINT signal
let server;

// Stop the server and shut down all services.
const exitHandler = async () => {
    try {
        if (server) {
            server.close(() => {
                logger.info('Server closed.');
            });
        }
        await MQTT.stop();
        process.exit(0);
    } catch (e) {
        logger.warning('Failed to gracefully shutdown.');
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    exitHandler();
});
process.on('SIGINT', () => {
    logger.info('SIGINT received');
    exitHandler();
});

// Initialize REST API server
// Start all services once the API server is started.
server = app.listen(serverPort, async () => {
    logger.info(`Dino API started on Port ${serverPort}`);
    await MQTT.start();
});
