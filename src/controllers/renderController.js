'use strict';

const browser = require('app/browser');
const encodeData = require('app/utils/encodeData');

const renderController = async (request, reply) => {
    let { url } = request.params;
    const { width, height } = request.query;

    if (encodeData(request.query) !== '') {
        url += '?' + encodeData(request.query);
    }

    const response = await browser.render(url, {
        width,
        height,
        'user-agent': request.headers['user-agent'],
    });

    return reply(response);
};

module.exports = renderController;
