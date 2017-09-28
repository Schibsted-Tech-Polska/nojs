'use strict';

Error.prepareStackTrace = (err, stack) =>
    JSON.stringify({
        message: err.message,
        stack: stack.map(callSite => ({
            file: callSite.getFileName(),
            column: callSite.getColumnNumber(),
            line: callSite.getLineNumber(),
            functionName: callSite.getFunctionName(),
        })),
    });

const config = require('ez-config').values;

if (config.newrelic) {
    require('newrelic');
}

const logger = require('app/logger');
const createServer = require('app/createServer');

createServer()
    .then(server => {
        server.start(err => {
            if (err) {
                throw err;
            }
            logger.info('Server running at:', server.info.uri);
        });
    })
    .catch(err => {
        logger.error(err);
    });
