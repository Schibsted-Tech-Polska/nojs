FROM node:8

ENV NPM_CONFIG_LOGLEVEL warn
ENV APP_PATH /app/
ENV TZ "Europe/Oslo"

# Install latest chrome dev package and missing shared libs for Chromium.
# Note: this also installs the necessary libs so we don't need the previous RUN command.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

WORKDIR $APP_PATH

ADD package.json $APP_PATH/package.json
ADD package-lock.json $APP_PATH/package-lock.json
RUN npm install --production
RUN npm run symlink

ADD . $APP_PATH
RUN npm --version
RUN node --version

# Add pptr user.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser $APP_PATH

# Run user as non privileged.
USER pptruser

CMD npm start
