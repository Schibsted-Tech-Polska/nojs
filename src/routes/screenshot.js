'use strict';

const Joi = require('joi');

const screenshotController = require('app/controllers/screenshotController');
const errorHandler = require('app/error/errorHandler');

const simpleScreenshotRoute = (server, options, next) => {
    server.route({
        method: 'GET',
        path: '/screenshot/{url*}',
        handler: errorHandler(screenshotController.simpleScreenshot),
        config: {
            validate: {
                params: {
                    url: Joi.string().description('URL to render'),
                },
            },
            description: 'Makes a basic screenshot of a page at given URL',
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

simpleScreenshotRoute.attributes = {
    name: 'nojs-sucks-screenshot-simple',
};

const advancedScreenshotRoute = (server, options, next) => {
    server.route({
        method: 'POST',
        path: '/screenshot',
        handler: errorHandler(screenshotController.advancedScreenshot),
        config: {
            validate: {
                payload: {
                    url: Joi.string().description('URL to render'),
                    options: Joi.object().description('Options to perform the request with'),
                },
            },
            description: 'Makes an advanced, custimizablesimple screenshot of a page at given URL',
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

advancedScreenshotRoute.attributes = {
    name: 'nojs-sucks-screenshot-advanced',
};

module.exports = { simpleScreenshotRoute, advancedScreenshotRoute };
