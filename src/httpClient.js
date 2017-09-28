'use strict';

const config = require('ez-config').values;

const fetch = require('node-fetch');
const logger = require('app/logger');
const ExternalServiceError = require('app/error/errors').ExternalServiceError;

const getCurrentTime = () => {
    return new Date().getTime();
};

const httpClient = (url, options = {}) => {
    const currentTime = getCurrentTime();
    options = Object.assign({}, config.httpClient, options);

    return fetch(url, options)
        .then(response => {
            const elapsedTime = getCurrentTime() - currentTime;
            logger.debug(
                `External request to ${url} got ${response.status} ${response.statusText} took ${elapsedTime}ms (CACHE state: ${response.headers.get(
                    'x-cache'
                )})`
            );
            return response.json();
        })
        .catch(err => {
            const elapsedTime = getCurrentTime() - currentTime;
            logger.error(
                `External request to ${url} got ${err.errno} ${err.code} took ${elapsedTime}ms (CACHE state: ERROR)`
            );
            throw new ExternalServiceError('External service error', err);
        });
};

module.exports = httpClient;
