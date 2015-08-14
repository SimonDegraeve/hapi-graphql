# GraphQL Hapi Plugin

Create a GraphQL HTTP server with [Hapi](http://hapijs.com).
Port from [express-graphql](https://github.com/graphql/express-graphql).

```js
npm install --save hapi-graphql
```

### Example

```js
import Hapi from 'hapi';
import GraphQL from 'hapi-graphql';
import {GraphQLSchema} from 'graphql';

const server = new Hapi.Server();
server.connection({
  port: 3000
});

const TestSchema = new GraphQLSchema({});

server.register({
  register: GraphQL,
  options: {
    query: {
      schema: TestSchema,
      rootValue: {},
      pretty: false
    },
    // OR
    //
    // query: (request) => {{
    //   schema: TestSchema,
    //   rootValue: {},
    //   pretty: false
    // }),
    route: {
      path: '/graphql',
      config: {}
    }
  }
}, () =>
  server.start(() =>
    console.log('Server running at:', server.info.uri)
  )
);
```
