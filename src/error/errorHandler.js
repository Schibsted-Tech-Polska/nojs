'use strict';

const Boom = require('boom');
const errors = require('app/error/errors');
const logger = require('app/logger');

const errorHandler = controller => {
    return (req, reply) => {
        controller(req, reply).catch(err => {
            if (err instanceof errors.ExternalServiceError) {
                logger.error(err);
                if (err.extra) {
                    logger.error(JSON.stringify(err.extra));
                }
                reply(Boom.serverUnavailable(err.message));
            } else if (err instanceof errors.NotFoundError) {
                reply(Boom.notFound(err.message));
            } else if (err.statusCode === 404) {
                reply(Boom.notFound(err.message ? err.message : 'Not found'));
            } else if (err.code === 'ECONNRESET') {
                logger.error(err);
                reply(Boom.serverUnavailable('Service is unavailable'));
            } else {
                logger.error(err);
                reply(Boom.badImplementation(err));
            }
        });
    };
};

module.exports = errorHandler;
