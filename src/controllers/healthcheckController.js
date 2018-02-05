'use strict';
const browser = require('app/browser');

const healthcheckController = async (request, reply) => {
    await browser.healthcheck();

    reply({
        status: 'OK',
    });
};

module.exports = healthcheckController;
