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
                    url: Joi.string()
                        .required()
                        .example('https://vg.no')
                        .description('URL to render'),
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
                    url: Joi.string()
                        .uri()
                        .required()
                        .example('https://vg.no')
                        .description('URL to render'),
                    options: Joi.object({
                        'inject-css': Joi.string()
                            .example('body {background-color: pink;}')
                            .description('CSS to inject into DOM'),
                        'user-agent': Joi.string()
                            .example(
                                'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
                            )
                            .description('User-agent to query the URL as'),
                        width: Joi.number()
                            .example('1920')
                            .description('Viewport width'),
                        height: Joi.number()
                            .example('1080')
                            .description('Viewport height'),
                        deviceScaleFactor: Joi.number()
                            .example('1.0')
                            .description('Device scale factory'),
                        fullPage: Joi.boolean()
                            .default(true)
                            .example(true)
                            .description('Save full page screenshot (default: true)'),
                        timeout: Joi.number()
                            .unit('milliseconds')
                            .example('10000')
                            .description('Time to wait for page to render (in ms)'),
                        waitUntil: Joi.string()
                            .allow(['load', 'networkidle2'])
                            .description(
                                'Maximum amount of inflight requests which are considered "idle". Takes effect only with waitUntil: \'networkidle\' parameter. Defaults to 2.'
                            ),
                        networkIdleTimeout: Joi.number()
                            .unit('milliseconds')
                            .example('1000')
                            .description(
                                "A timeout to wait before completing navigation. Takes effect only with waitUntil: 'networkidle' parameter. Defaults to 1000 ms."
                            ),
                    })
                        .options({ allowUnknown: true })
                        .description('Options to perform the request with'),
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
