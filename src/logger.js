'use strict';

const winston = require('winston');
const config = require('ez-config').values;

const getTransports = () => {
    let transports = [];
    config.logger.transports.forEach(transportConfig => {
        switch (transportConfig.type) {
            case 'console':
                transports.push(new winston.transports.Console(transportConfig));
                break;
            case 'file':
                transports.push(
                    new winston.transports.File({
                        filename: transportConfig.filename,
                        name: transportConfig.name || null,
                        level: transportConfig.level || null,
                    })
                );
                break;
            default:
                break;
        }
    });
    return transports;
};

const logger = new winston.Logger({
    transports: getTransports(),
});

module.exports = logger;
