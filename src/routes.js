'use strict';

let routes = [require('app/routes/healthcheck'), require('app/routes/screenshot'), require('app/routes/render')];

routes = routes.map(route => ({
    register: route,
}));

module.exports = routes;
