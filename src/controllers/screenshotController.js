'use strict';

const browser = require('app/browser');
const encodeData = require('app/utils/encodeData');

const screenshotController = async (request, reply) => {
    let { url } = request.params;
    const { width, height } = request.query;

    if (encodeData(request.query) !== '') {
        url += '?' + encodeData(request.query);
    }

    const image = await browser.screenshot(url, {
        width,
        height,
        'user-agent': request.headers['user-agent'],
    });

    return reply(image).header('Content-Type', 'image/png');
};

module.exports = screenshotController;
