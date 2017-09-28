/* eslint-disable no-shadow,no-unused-vars */
'use strict';

const config = require('ez-config').values;
const co = require('co');
const logger = require('app/logger');
const Hapi = require('hapi');

/**
 * Create Hapi server instance with all the plugins registered ready to run
 * @return {Object} server instance
 */
function createServer() {
    return co(function*() {
        const server = new Hapi.Server();

        server.connection({
            port: config.server.port,
            routes: {
                cors: config.server.cors,
                log: true,
                state: {
                    parse: true,
                    failAction: 'log',
                },
            },
        });

        // HapiSwagger
        server.register(
            [
                require('inert'),
                require('vision'),
                {
                    register: require('hapi-swagger'),
                    options: config.swagger,
                },
            ],
            err => {
                if (err) {
                    logger.error(err);
                }
            }
        );

        server.register({
            register: require('hapi-plugin-header'),
            options: {
                'X-Request-Id': (server, request, reply) => request.id,
            },
        });

        if (config.good.enabled) {
            // Register good into Hapi
            server.register(
                {
                    register: require('good'),
                    options: config.good.options,
                },
                err => {
                    if (err) {
                        logger.error(err);
                    }
                }
            );
        }

        // Register hapi-etags
        server.register(
            {
                register: require('hapi-etags'),
            },
            err => {
                if (err) {
                    logger.error(err);
                }
            }
        );

        server.ext('onPreResponse', require('app/middleware/hashtwo'));

        yield server.register([
            {
                register: require('app/middleware/caching'),
                options: config.cache.headers,
            },
        ]);

        yield server.register([
            {
                register: require('app/middleware/cors'),
                options: config.server.cors,
            },
        ]);

        yield server.register(require('app/routes'), {
            routes: {
                prefix: config.server.routesPrefix,
            },
        });

        return server;
    }).catch(err => {
        logger.error(err);
    });
}

module.exports = createServer;
