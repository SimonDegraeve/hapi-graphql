# GraphQL Hapi Plugin

[![NPM Version](https://img.shields.io/npm/v/hapi-graphql.svg)](https://npmjs.org/package/hapi-graphql)
[![Build Status](https://secure.travis-ci.org/SimonDegraeve/hapi-graphql.png)](http://travis-ci.org/SimonDegraeve/hapi-graphql)
[![Coverage Status](https://coveralls.io/repos/SimonDegraeve/hapi-graphql/badge.svg?branch=master&service=github)](https://coveralls.io/github/SimonDegraeve/hapi-graphql?branch=master)
[![Dependency Status](https://david-dm.org/SimonDegraeve/hapi-graphql.svg)](https://david-dm.org/SimonDegraeve/hapi-graphql)
[![bitHound Overalll Score](https://www.bithound.io/github/SimonDegraeve/hapi-graphql/badges/score.svg)](https://www.bithound.io/github/SimonDegraeve/hapi-graphql)

Create a GraphQL HTTP server with [Hapi](http://hapijs.com).
Port from [express-graphql](https://github.com/graphql/express-graphql).

```sh
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
