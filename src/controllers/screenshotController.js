'use strict';

const browser = require('app/browser');
const encodeData = require('app/utils/encodeData');

const MAX_RETRY_COUNT = 3;

const simpleScreenshot = async (request, reply) => {
    let { url } = request.params;

    if (encodeData(request.query) !== '') {
        url += '?' + encodeData(request.query);
    }

    const image = await getScreenShot(url);

    return reply(image).header('Content-Type', 'image/png');
};

const advancedScreenshot = async (request, reply) => {
    let { url, options } = request.payload;

    const image = await getScreenShot(url, options);

    return reply(image).header('Content-Type', 'image/png');
};

async function getScreenShot(url, options) {
    let image;
    let err;
    for (let i = 0; !image && i < MAX_RETRY_COUNT; i++) {
        try {
            image = await browser.screenshot(url, options);
        } catch (e) {
            err = e;
            console.error(e); // eslint-disable-line no-console
        }
    }
    if (!image) {
        throw err;
    }
    return image;
}

module.exports = { simpleScreenshot, advancedScreenshot };
