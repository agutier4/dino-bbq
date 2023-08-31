import pino from 'pino';

logger = pino({
    transport: {
      target: 'pino-pretty'
    },
});

export default logger;