const hapi = require('hapi');
const plugin = require('./index');

const hasRoute = (server, path, method) => {
  let foundRoute = false;

  server.table().forEach((route) => {
    if (route.path === path && route.method.toLowerCase() === method.toLowerCase()) {
      foundRoute = true;
    }
  });

  return foundRoute;
};


describe('hapi-graphql', () => {
  let server;

  beforeEach(() => {
    server = new hapi.Server({});
  });
  it('registers cleanly into hapi v17+', async () => {
    await server.register({
      plugin,
      options: {
        route: {
          path: '/graphql',
          config: {

          },
        },
      },
    });
    expect(hasRoute(server, '/graphql', 'get')).toBeTruthy();
    expect(hasRoute(server, '/graphql', 'post')).toBeTruthy();
  });
});
