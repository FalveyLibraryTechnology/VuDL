# Dependencies

- Node (nvm recommended)
- [Install Redis](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04) to support queue features
- Type definitions for node (`npm install -g npm`)
- Execute `npm run install-all` to install all node dependencies

# Set up configuration in the api directory

Copy api/vudl.ini.dist to api/vudl.ini, and configure it using a text editor.

# Running the dev server

In two separate terminals or panes, run:
1. `npm run api:watch` to run Typescript for the API code
1. `npm run dev` to fire up all dev servers

After a few moments, a new tab should automatically open in your browser pointing to `localhost:3000`. Refresh until the app appears.

# NPM Scripts

| Script | Description |
| - | - |
| api | run node api server |
| api:build | Build api Typescript |
| api:dev | run api server, restart server on changes |
| api:lint | lint only the api code |
| api:setup | install npm dependencies in api/ |
| api:watch | run Typescript in watch mode on api code |
| api:wsl | run api server, restart on changes (use if on WSL or `api:dev` isn't working) |
| | |
| client | run react-scripts server |
| client:build | build React code for production |
| client:lint | lint only the api code |
| client:setup | install npm dependencies in client/ |
| | |
| queue | start api worker queue server |
| queue:dev | start api worker listener, restart on changes |
| queue:wsl | start api worker listener, restart on changes (use if on WSL or `api:dev` isn't working) |
| | |
| backend | start both api and worker queue servers |
| backend:dev | start both api and worker queue servers, restart on changes |
| backend:wsl | start both api and worker queue servers, restart on changes (use if on WSL or `api:dev` isn't working) |
| | |
| build | build entire project for production |
| dev | run api, client, and queue dev servers (auto-restart) |
| format | format all code with [Prettier](https://prettier.io) |
| install-all | concurrently npm:setup npm:api:setup npm:client:setup |
| lint | report lint errors in all code |
| setup | instal root npm dependencies |
| start | run api, client, and queue servers (production) |
| watch | alias for api:watch |