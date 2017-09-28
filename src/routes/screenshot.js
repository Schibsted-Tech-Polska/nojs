'use strict';

const Joi = require('joi');

const screenshotController = require('app/controllers/screenshotController');
const errorHandler = require('app/error/errorHandler');

const route = (server, options, next) => {
    server.route({
        method: 'GET',
        path: '/screenshot/{url*}',
        handler: errorHandler(screenshotController),
        config: {
            validate: {
                params: {
                    url: Joi.string().description('URL to render'),
                },
            },
            description: 'Makes a screenshot of a page at given URL',
            notes: [],
            tags: ['screenshot'],
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
