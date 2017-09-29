'use strict';

const browser = require('app/browser');
const encodeData = require('app/utils/encodeData');

const simpleScreenshot = async (request, reply) => {
    let { url } = request.params;

    if (encodeData(request.query) !== '') {
        url += '?' + encodeData(request.query);
    }

    const image = await browser.screenshot(url);

    return reply(image).header('Content-Type', 'image/png');
};

const advancedScreenshot = async (request, reply) => {
    let { url, options } = request.payload;

    const image = await browser.screenshot(url, options);

    return reply(image).header('Content-Type', 'image/png');
};

module.exports = { simpleScreenshot, advancedScreenshot };
