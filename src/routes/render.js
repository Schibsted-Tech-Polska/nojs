'use strict';

const Joi = require('joi');

const renderController = require('app/controllers/renderController');
const errorHandler = require('app/error/errorHandler');

const route = (server, options, next) => {
    server.route({
        method: 'GET',
        path: '/render/{url*}',
        handler: errorHandler(renderController),
        config: {
            validate: {
                params: {
                    url: Joi.string().description('URL to render'),
                },
            },
            description: 'Render a page at given URL',
            notes: [],
            tags: ['render'],
            plugins: {
                caching: {
                    serverTime: 60,
                    clientTime: 10,
                    keys: ['render'],
                },
            },
        },
    });
    next();
};

route.attributes = {
    name: 'nojs-sucks-render',
};

module.exports = route;
