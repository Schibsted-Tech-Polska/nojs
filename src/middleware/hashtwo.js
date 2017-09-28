'use strict';

const config = require('ez-config');
const get = require('lodash.get');

/*
 * Appends X-Hashtwo header for ability to purge objects in Varnish that have
 * specific keys. Keys can be set:
 *  - globally for the whole applicaiton by setting the 'hashtwo' config key
 *  - per route by setting config.plugins.caching.keys array in the route config
 */
function onPreResponse(request, reply) {
    const hashtwo = config.get('hashtwo');

    if (request.response.header !== undefined) {
        const hashTwoKeys = [];
        if (hashtwo !== undefined && hashtwo) {
            hashTwoKeys.push(hashtwo);
        }

        const cacheKeys = get(request, 'route.settings.plugins.caching.keys');
        if (cacheKeys) {
            hashTwoKeys.push(...cacheKeys.map(key => hashtwo + '.' + key));
        }

        request.response.header('X-HashTwo', hashTwoKeys.join(' '));
    }

    return reply.continue();
}

module.exports = onPreResponse;
