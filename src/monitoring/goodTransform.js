'use strict';

const moment = require('moment');
const Stream = require('stream');
const roundWithPrecision = require('app/utils/roundWithPrecision');

const internals = {
    // empty string in format means ISO 8601
    defaults: {
        format: '',
    },
};

internals.utility = {
    formatOutput(event, settings) {
        let timestamp = moment(parseInt(event.timestamp, 10));
        timestamp = timestamp.utc();
        timestamp = timestamp.format(settings.format);

        const tags = ` [${event.tags.toString()}] `;

        // add event id information if available, typically for 'request' events
        const id = event.id ? ` (${event.id})` : '';

        const output = `${timestamp},${id}${tags}${event.data}`;

        return output + '\n';
    },

    formatResponse(event, tags, settings) {
        const query = event.query ? JSON.stringify(event.query) : '';
        const method = event.method.toUpperCase();
        const statusCode = event.statusCode || '';
        const remoteAddr = event.source.remoteAddress ? event.source.remoteAddress : '-';
        const userAgent = event.source.userAgent ? event.source.userAgent : '-';
        const referer = event.source.referer ? event.source.referer : '-';
        const uniqueId = event.id;
        const output =
            `${remoteAddr} ${method} ${event.path} ${query}` +
            ` ${statusCode} (${event.responseTime}ms) "${referer}" "${userAgent}" "${uniqueId}"`;

        const response = {
            timestamp: event.timestamp,
            tags,
            data: output,
        };

        return internals.utility.formatOutput(response, settings);
    },

    formatOps(event, tags, settings) {
        const memory = roundWithPrecision(event.proc.mem.rss / (1024 * 1024), 2);
        const output = `memory: ${memory}Mb, uptime (seconds): ${event.proc.uptime}, load: [${event.os.load}]`;

        const ops = {
            timestamp: event.timestamp,
            tags,
            data: output,
        };

        return internals.utility.formatOutput(ops, settings);
    },

    formatError(event, tags, settings) {
        const output = `message: ${event.error.message} stack: ${event.error.stack}`;

        const error = {
            timestamp: event.timestamp,
            tags,
            data: output,
        };

        return internals.utility.formatOutput(error, settings);
    },

    formatDefault(event, tags, settings) {
        const data = typeof event.data === 'object' ? JSON.stringify(event.data) : event.data;
        const output = `data: ${data}`;

        const defaults = {
            timestamp: event.timestamp,
            id: event.id,
            tags,
            data: output,
        };

        return internals.utility.formatOutput(defaults, settings);
    },
};

class GoodTransform extends Stream.Transform {
    constructor(config) {
        super({ objectMode: true });

        config = config || {};
        this.settings = Object.assign({}, internals.defaults, config);
    }

    _transform(data, enc, next) {
        const eventName = data.event;
        let tags = [];

        if (Array.isArray(data.tags)) {
            tags = data.tags.concat([]);
        } else if (data.tags) {
            tags = [data.tags];
        }

        tags.unshift(eventName);

        if (eventName === 'error') {
            return next(null, internals.utility.formatError(data, tags, this.settings));
        }

        if (eventName === 'ops') {
            return next(null, internals.utility.formatOps(data, tags, this.settings));
        }

        if (eventName === 'response') {
            return next(null, internals.utility.formatResponse(data, tags, this.settings));
        }

        if (!data.data) {
            data.data = '(none)';
        }

        return next(null, internals.utility.formatDefault(data, tags, this.settings));
    }
}

module.exports = GoodTransform;
