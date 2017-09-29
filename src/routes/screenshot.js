'use strict';

const Joi = require('joi');

const screenshotController = require('app/controllers/screenshotController');
const errorHandler = require('app/error/errorHandler');

const route = (server, options, next) => {
    server.route({
        method: 'POST',
        path: '/screenshot',
        handler: errorHandler(screenshotController),
        config: {
            validate: {
                payload: {
                    url: Joi.string().description('URL to render'),
                    options: Joi.object().description('Options to perform the request with'),
                },
            },
            description: 'Makes a screenshot of a page at given URL',
            notes: [],
            tags: ['api', 'screenshot'],
            plugins: {
                caching: {
                    serverTime: 60,
                    clientTime: 10,
                    keys: ['screenshot'],
                },
            },
        },
    });
    next();
};

route.attributes = {
    name: 'nojs-sucks-screenshot',
};

module.exports = route;
