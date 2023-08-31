FROM node:18

# Set up pm2 process manager.
RUN npm install pm2 pm2-logrotate -g \
    && pm2 set pm2-logrotate:retain 5 \
    && pm2 set pm2-logrotate:max_size 50M

# Copy in the api files
WORKDIR /app
COPY ./config ./config
COPY ./src ./src
COPY ./.babelrc .
COPY ./.eslintrc.json .
COPY ./.nycrc .
COPY ./ecosystem.config.json .
COPY ./package.json .

# Install package dependencies and transpile the app.
RUN npm install && npm run build

ENV NODE_ENV 'development'

CMD ["pm2-runtime", "start", "ecosystem.config.json"]