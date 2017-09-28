FROM node:8

ENV NPM_CONFIG_LOGLEVEL warn
ENV APP_PATH /src
ENV TZ "Europe/Oslo"

WORKDIR $APP_PATH

# Install latest chrome dev package.
# Note: this installs the necessary libs to make the bundled version of Chromium that Pupppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

ADD package.json $APP_PATH/package.json
ADD package-lock.json $APP_PATH/package-lock.json
RUN npm install --production
RUN npm run symlink

ADD . $APP_PATH
RUN npm --version
RUN node --version

CMD npm start
