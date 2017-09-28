'use strict';

const healthcheckController = (request, reply) => {
    reply({
        status: 'OK',
    });
};

module.exports = healthcheckController;
