'use strict';

const reply = (response, data, statusCode = 200, headers = {}) => {
    headers = Object.assign(
        {},
        {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
        },
        headers
    );

    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
};

const replyBadRequest = (res, message) => {
    reply(
        res,
        {
            statusCode: 400,
            error: 'Bad request',
            message: message,
        },
        400
    );
};

const replyNotFound = (res, message) => {
    reply(
        res,
        {
            statusCode: 404,
            error: 'Not found',
            message: message,
        },
        404
    );
};

const replyMethodNotAllowed = (res, message) => {
    reply(
        res,
        {
            statusCode: 405,
            error: 'Method not allowed',
            message: message,
        },
        405
    );
};

const replyBadImplementation = (res, message) => {
    reply(
        res,
        {
            statusCode: 500,
            error: 'Internal server error',
            message: message,
        },
        500
    );
};

module.exports = {
    ok: reply,
    badRequest: replyBadRequest,
    notFound: replyNotFound,
    methodNotAllowed: replyMethodNotAllowed,
    badImplementation: replyBadImplementation,
};
