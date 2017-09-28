'use strict';

const config = require('ez-config').values;
const puppeteer = require('puppeteer');
const logger = require('app/logger');

let browser;

const goTo = async (
    url,
    options = {
        waitUntil: 'networkidle',
        networkIdleInflight: 0,
        networkIdleTimeout: 3000,
    }
) => {
    url = decodeURIComponent(url);
    logger.debug(`Opening URL: ${url}`);
    const page = await browser.newPage();

    if (options.width && options.height) {
        page.setViewport({ width: parseInt(options.width, 10), height: parseInt(options.height, 10) });
    }

    if (options['user-agent']) {
        page.setUserAgent(options['user-agent']);
    }

    await page.goto(url, options);
    await page.waitForFunction('document && document.documentElement && document.doctype');
    await page.evaluate(baseUrl => {
        const base = document.createElement('base');
        base.setAttribute('href', baseUrl);
        document.head.appendChild(base);
    }, url);

    return page;
};

const render = async (url, options) => {
    browser = await puppeteer.launch(config.puppeteer.chromeOptions);
    const page = await goTo(url, options);
    const result = await page.content();
    await page.close();
    await browser.close();

    return result;
};

const screenshot = async (url, options) => {
    browser = await puppeteer.launch(config.puppeteer.chromeOptions);
    const page = await goTo(url, options);
    const result = await page.screenshot({ fullPage: true });
    await page.close();
    await browser.close();

    return result;
};

module.exports = { render, screenshot };
