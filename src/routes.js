'use strict';
let routes = [
    require('app/routes/healthcheck'),
    require('app/routes/screenshot').simpleScreenshotRoute,
    require('app/routes/screenshot').advancedScreenshotRoute,
    require('app/routes/render'),
];

routes = routes.map(route => ({
    register: route,
}));

module.exports = routes;
