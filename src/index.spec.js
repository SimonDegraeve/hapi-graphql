const hapi = require('hapi');
const { buildSchema } = require('graphql');

const plugin = require('./index');

const schema = buildSchema(`
type Query {
  hello: String
}
`);
const root = {
  hello: () => 'Hello world!',
};

const hasRoute = (server, path, method) => {
  let foundRoute = false;

  server.table().forEach((route) => {
    if (route.path === path && route.method.toLowerCase() === method.toLowerCase()) {
      foundRoute = true;
    }
  });

  return foundRoute;
};

describe('plugin registration', () => {
  let server;

  beforeEach(() => {
    server = new hapi.Server({});
  });
  it('works with hapi v17+', async () => {
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

describe('query operations', () => {
  let server;

  beforeAll(async () => {
    server = new hapi.Server({});
    await server.register({
      plugin,
      options: {
        query: {
          schema,
          rootValue: root,
          formatError: error => ({
            message: error.message,
            locations: error.locations,
            stack: error.stack,
          }),
        },
        route: {
          path: '/graphql',
          config: {
          },
        },
      },
    });
  });

  it('responds to hello world queries', async () => {
    const request = {
      method: 'get',
      url: '/graphql?query={ hello }',
    };

    const response = await server.inject(request);

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.data.hello).toBe('Hello world!');
  });

  it('complains on malformed queries', async () => {
    const request = {
      method: 'get',
      url: '/graphql?query={ }',
    };

    const response = await server.inject(request);

    expect(response.statusCode).toBe(400);
    const payload = JSON.parse(response.payload);
    expect(payload.errors).toHaveLength(1);
    expect(payload.errors[0].message).toMatch(/Syntax Error/);
  });
});
