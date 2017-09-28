'use strict';

const ignoreMethods = ['post', 'put', 'patch'];
const cacheHeaders = ['expires', 'cache-control'];

function caching(server, options, next) {
    const defaultDirective = options.directive;
    const defaultClientTime = options.clientTime;
    const defaultServerTime = options.serverTime;

    const cacheHeadersAlreadySet = response => {
        return (
            cacheHeaders.filter(header => {
                return typeof response.headers !== 'undefined' && typeof response.headers[header] !== 'undefined';
            }).length > 0
        );
    };

    // Add pre response hook for varnish headers
    server.ext('onPreResponse', function(req, reply) {
        // We don't want to add caching headers to POST, PUT and PATCH reqs as they modifies
        // the response and should always hit the backend
        if (ignoreMethods.includes(req.method.toLowerCase())) {
            return reply.continue();
        }

        // Manually set cache headers (in the controller) have the highest priority
        if (cacheHeadersAlreadySet(req.response)) {
            return reply.continue();
        }

        // Check if isBoom is false/undefined
        if (!req.response.isBoom) {
            let routeSettings =
                req.route.settings.plugins.caching !== undefined ? req.route.settings.plugins.caching : {};

            if (routeSettings !== false) {
                // First check if we have client and varnish max age defined in the route config
                // If we don't have, see if we have standard maxAge options, if not fallback to server defaults
                const cacheControl = {
                    maxAge: routeSettings.clientTime || defaultClientTime,
                    sMaxAge: routeSettings.serverTime || defaultServerTime,
                    directive: routeSettings.directive || defaultDirective,
                };

                // max-age is how long the client will cache the response
                // s-maxage is how long varnish will cache the response
                if (!req.response.headers['cache-control']) {
                    req.response.header('Cache-Control', `max-age=${cacheControl.maxAge}, ${cacheControl.directive}`);
                }

                if (!req.response.headers['surrogate-control']) {
                    req.response.header('Surrogate-Control', `max-age=${cacheControl.sMaxAge}`);
                }
            } else {
                // If caching is set to false we send no-store and no-cache so both
                // varnish and client ignores caching this object
                req.response.header('Cache-Control', 'no-cache, no-store');
            }
        }

        return reply.continue(req.response);
    });

    next();
}

caching.attributes = {
    name: 'caching',
};

module.exports = caching;
