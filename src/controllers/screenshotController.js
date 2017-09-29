'use strict';

const browser = require('app/browser');
const encodeData = require('app/utils/encodeData');

const screenshotController = async (request, reply) => {
    let { url } = request.payload;

    if (encodeData(request.query) !== '') {
        url += '?' + encodeData(request.query);
    }

    const image = await browser.screenshot(url, request.payload.options);

    return reply(image).header('Content-Type', 'image/png');
};

module.exports = screenshotController;
