'use strict';

const reply = require('app/server/reply');

module.exports = () => {
    let routes = [];

    const registerRouteHandler = (method, url, handler, options) => {
        const basePath = (options && options.basePath) || '';
        url = basePath + url;

        let route = routes.find(r => r.url === url);

        if (route) {
            if (route.handlers.find(h => h.method === method)) {
                throw new Error('Trying to register route for ' + url + ' and method ' + method + ' twice');
            }

            route.handlers.push({
                method: method,
                handler: handler,
            });
        } else {
            route = {
                url: url,
                handlers: [
                    {
                        method: method,
                        handler: handler,
                    },
                ],
            };

            routes.push(route);
        }
    };

    const getRoutes = () => {
        return routes;
    };

    const dispatch = (req, res) => {
        let found = false;
        let urlMatches = false;

        getRoutes().forEach(route => {
            const urlPathname = require('url').parse(req.url).pathname;

            if (urlPathname !== route.url) {
                return;
            }

            urlMatches = true;

            route.handlers.forEach(handler => {
                if (handler.method === req.method) {
                    handler.handler(req, res);
                    found = true;
                }
            });
        });

        if (!found) {
            if (urlMatches) {
                reply.methodNotAllowed(res);
            } else {
                reply.notFound(res, 'Route not found');
            }
        }
    };

    return {
        registerRouteHandler: registerRouteHandler,
        getRoutes: getRoutes,
        dispatch: dispatch,
    };
};
