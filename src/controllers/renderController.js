'use strict';

const browser = require('app/browser');
const encodeData = require('app/utils/encodeData');
const RenderFailedError = require('app/error/errors').RenderFailedError;

const renderController = async (request, reply) => {
    const { width, height } = request.query;
    let { url } = request.params;
    let response;

    if (encodeData(request.query) !== '') {
        url += '?' + encodeData(request.query);
    }

    try {
        response = await browser.render(url, {
            width,
            height,
        });
    } catch (error) {
        if (error instanceof RenderFailedError) {
            response = await browser.render(url, {
                width,
                height,
            });
        } else {
            throw error;
        }
    }

    return reply(response);
};

module.exports = renderController;
