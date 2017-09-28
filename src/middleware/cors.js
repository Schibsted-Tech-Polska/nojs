'use strict';

// adds access-control-allow-origin header for 4xx responses
function cors(server, options, next) {
    server.ext('onPreResponse', function(request, reply) {
        if (!request.info.cors || !request.info.cors.isOriginMatch) {
            return reply.continue(request.response);
        }

        if (
            request.response.isBoom &&
            request.response.output.statusCode >= 400 &&
            request.response.output.statusCode < 500
        ) {
            request.response.output.headers['access-control-allow-origin'] = request.headers.origin;
        }

        return reply.continue(request.response);
    });

    next();
}

cors.attributes = {
    name: 'cors',
};

module.exports = cors;
