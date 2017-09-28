'use strict';

const healthcheckController = require('app/controllers/healthcheckController');

const route = (server, options, next) => {
    server.route({
        method: 'GET',
        path: '/healthcheck',
        handler: healthcheckController,
        config: {
            validate: {
                query: {},
            },
            description: 'Application health status',
            notes: [],
            tags: ['healthcheck'],
        },
    });
    next();
};

route.attributes = {
    name: 'healthcheck',
};

module.exports = route;
