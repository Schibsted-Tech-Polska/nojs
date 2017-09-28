'use strict';

const config = require('ez-config').values;
const puppeteer = require('puppeteer');
const logger = require('app/logger');

let browser = null;
let openedUrlsCounter = 0;

const init = async () => {
    if (browser !== null && openedUrlsCounter < config.puppeteer.maxUrlsOpened) {
        return;
    }

    if (openedUrlsCounter >= config.puppeteer.maxUrlsOpened) {
        await browser.close();
        browser = null;
        openedUrlsCounter = 0;
    }

    browser = await puppeteer.launch(config.puppeteer.chromeOptions);
};

const goTo = async (
    url,
    options = {
        waitUntil: 'networkidle',
        networkIdleInflight: 0,
        networkIdleTimeout: 3000,
    }
) => {
    openedUrlsCounter++;
    url = decodeURIComponent(url);

    logger.debug(`Handling request ${openedUrlsCounter} of ${config.puppeteer.maxUrlsOpened} allowed`);
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
    await init();
    const page = await goTo(url, options);
    return page.content();
};

const screenshot = async (url, options) => {
    await init();
    const page = await goTo(url, options);
    return page.screenshot({ fullPage: true });
};

module.exports = { render, screenshot };
